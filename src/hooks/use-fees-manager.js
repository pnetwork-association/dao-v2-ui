import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { useWriteContract, useReadContract, useReadContracts, useSwitchChain, useChainId } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { groupBy } from 'lodash'

import settings from '../settings'
import LendingManagerABI from '../utils/abis/LendingManager.json'
import FeesManagerABI from '../utils/abis/FeesManager.json'
import RegistrationManagerABI from '../utils/abis/RegistrationManager.json'
import { range } from '../utils/time'
import { useRates } from './use-crypto-compare'
import { useEpochs } from './use-epochs'
import { useSentinel } from './use-registration-manager'
import { formatAssetAmount, formatCurrency } from '../utils/amount'
import { BORROWING_SENTINEL, STAKING_SENTINEL } from '../contants'
import { useSentinelLastEpochReward } from './use-sentinels-historical-data'

const useFeesDistributionByMonthlyRevenues = ({
  startEpoch,
  endEpoch,
  mr,
  addBorrowAmountToBorrowedAmount = false // used when we want to simulate a borrowing sentinel registration
}) => {
  const { data } = useReadContracts({
    contracts: [
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'totalBorrowedAmountByEpochsRange',
        args: [0, 24],

        chainId: polygon.id
      },
      {
        address: settings.contracts.registrationManager,
        abi: RegistrationManagerABI,
        functionName: 'totalSentinelStakedAmountByEpochsRange',
        args: [0, 24],
        chainId: polygon.id
      },
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'totalLendedAmountByEpochsRange',
        args: [0, 24],
        chainId: polygon.id
      },
      {
        address: settings.contracts.feesManager,
        abi: FeesManagerABI,
        functionName: 'minimumBorrowingFee',
        args: [],
        chainId: polygon.id
      }
    ]
  })

  const totalBorrowedAmountInEpoch = useMemo(() => (data && data[0] ? data[0] : []), [data])
  const totalStakedAmountInEpoch = useMemo(() => (data && data[1] ? data[1] : []), [data])
  const totalLendedAmountInEpoch = useMemo(() => (data && data[2] ? data[2] : []), [data])
  const minimumBorrowingFee = useMemo(
    () => (data && data[3] ? BigNumber(data[3]).dividedBy(10 ** 6) : BigNumber(0)),
    [data]
  )

  return useMemo(
    () =>
      (startEpoch || startEpoch === 0) && endEpoch
        ? range(startEpoch, endEpoch + 1)
            .map((_epoch, _index) => {
              // totalAmount = totalSentinelStakedAmount + totalBorrowedAmount
              // parcentageHowManyFeesToStakingSentinels = totalSentinelStakedAmount / totalAmount
              // howManyRevenuesToStakingSentinels = revenues * parcentageHowManyFeesToStakingSentinels
              // howManyRevenuesToLendersAndBorrowers = revenues - howManyFeesToStakingSentinels
              // howManyRevenuesToLenders = howManyRevenuesToLendersAndBorrowers * k
              // howManyRevenuesToBorrowers = howManyRevenuesToLendersAndBorrowers - howManyRevenuesToLenders

              let totalBorrowedAmount = BigNumber(
                totalBorrowedAmountInEpoch[_epoch] ? totalBorrowedAmountInEpoch[_epoch].toString() : 0
              )
              const totalLendedAmount = BigNumber(
                totalLendedAmountInEpoch[_epoch] ? totalLendedAmountInEpoch[_epoch].toString() : 0
              )

              const canBorrow = totalLendedAmount
                .minus(totalBorrowedAmount)
                .isGreaterThan(settings.registrationManager.borrowAmount)
              if (addBorrowAmountToBorrowedAmount && canBorrow) {
                totalBorrowedAmount = totalBorrowedAmount.plus(settings.registrationManager.borrowAmount)
              }

              const totalSentinelStakedAmount = BigNumber(
                totalStakedAmountInEpoch[_epoch] ? totalStakedAmountInEpoch[_epoch].toString() : 0
              )
              const totalAmount = totalBorrowedAmount.plus(totalLendedAmount)

              const utilizationRatio = totalLendedAmount.isGreaterThan(0)
                ? totalBorrowedAmount.dividedBy(totalLendedAmount)
                : BigNumber(0)
              const k = utilizationRatio.multipliedBy(utilizationRatio).plus(minimumBorrowingFee)

              const sentinelsStakingRevenuesPercentage = totalAmount.isEqualTo(0)
                ? BigNumber(0)
                : totalSentinelStakedAmount.dividedBy(totalAmount)
              const stakingSentinelsRevenuesAmount = BigNumber(mr).multipliedBy(sentinelsStakingRevenuesPercentage)
              const sentinelsBorrowingFeesAndLendersRewardsAmount = BigNumber(mr).minus(stakingSentinelsRevenuesAmount) // k.isEqualTo(0) ? BigNumber(0) : BigNumber(mr).minus(stakingSentinelsRevenuesAmount)
              const lendersRevenuesAmount = sentinelsBorrowingFeesAndLendersRewardsAmount.multipliedBy(k)
              const borrowingSentinelsRevenuesAmount =
                sentinelsBorrowingFeesAndLendersRewardsAmount.minus(lendersRevenuesAmount)

              return {
                epoch: _epoch,
                lendersRevenuesAmount,
                stakingSentinelsRevenuesAmount,
                borrowingSentinelsRevenuesAmount
              }
            })
            .reduce((_acc, _val) => {
              _acc[_val.epoch] = {
                lendersRevenuesAmount: _val.lendersRevenuesAmount,
                stakingSentinelsRevenuesAmount: _val.stakingSentinelsRevenuesAmount,
                borrowingSentinelsRevenuesAmount: _val.borrowingSentinelsRevenuesAmount
              }
              return _acc
            }, {})
        : {},
    [
      minimumBorrowingFee,
      totalLendedAmountInEpoch,
      addBorrowAmountToBorrowedAmount,
      totalBorrowedAmountInEpoch,
      totalStakedAmountInEpoch,
      startEpoch,
      endEpoch,
      mr
    ]
  )
}

const useClaimableFeesAssetsByEpochs = (_opts = {}) => {
  const { type } = _opts
  const assets = settings.assets
    .filter(({ feesManagerClaimEnabled }) => feesManagerClaimEnabled)
    .sort((_a, _b) => _a.name.localeCompare(_b.name))
  const { currentEpoch } = useEpochs()
  const { sentinelAddress, kind } = useSentinel()

  const rates = useRates(
    assets.filter(({ feesManagerClaimEnabled }) => feesManagerClaimEnabled).map(({ symbolPrice }) => symbolPrice)
  )

  const enabled = useMemo(() => {
    if (type === 'stakingSentinel' && kind !== STAKING_SENTINEL) return false
    if (type === 'borrowingSentinel' && kind !== BORROWING_SENTINEL) return false

    return Boolean(sentinelAddress) && Boolean(currentEpoch || currentEpoch === 0)
  }, [sentinelAddress, currentEpoch, type, kind])

  const { data } = useReadContract({
    address: settings.contracts.feesManager,
    abi: FeesManagerABI,
    functionName: 'claimableFeesByEpochsRangeOf',
    args: [sentinelAddress, assets.map(({ address }) => address), 0, currentEpoch],
    enabled,
    chainId: polygon.id
  })

  return useMemo(() => {
    if (!data || !enabled) return null

    return Array.from(Array(currentEpoch).keys()).reduce((_acc, _epoch) => {
      _acc[_epoch] = data
        .slice(_epoch * assets.length, _epoch * assets.length + assets.length)
        .map((_value, _index) => {
          const asset = assets[_index]
          const amount = BigNumber(_value.toString()).dividedBy(10 ** asset.decimals)
          const rate = rates ? rates[asset.symbolPrice] : null

          let countervalue = null
          if (rate) {
            countervalue = BigNumber(amount).multipliedBy(rate).toFixed(2)
          }

          return {
            amount,
            countervalue,
            formattedAmount: formatAssetAmount(amount, asset.symbol),
            formattedCountervalue: countervalue ? formatCurrency(countervalue, 'USD') : null,
            ...asset
          }
        })
        .sort((_a, _b) => (BigNumber(_a.amount).isGreaterThan(_b.amount) ? -1 : 1))

      return _acc
    }, {})
  }, [rates, assets, currentEpoch, data, enabled])
}

const useClaimableFeesAssetsByAssets = (_opts) => {
  const { type } = _opts
  const rates = useRates(
    settings.assets
      .filter(({ lendingManagerClaimEnabled }) => lendingManagerClaimEnabled)
      .map(({ symbolPrice }) => symbolPrice)
  )

  const assets = useClaimableFeesAssetsByEpochs({ type })
  const flatAssets = assets ? Object.values(assets).flat() : []
  const assetsByAddress = groupBy(flatAssets, 'address')

  const assetsAmount = Object.keys(assetsByAddress).reduce((_acc, _address) => {
    _acc[_address] = assetsByAddress[_address].reduce((_iacc, { amount }) => {
      _iacc = _iacc.plus(amount)
      return _iacc
    }, new BigNumber(0))

    return _acc
  }, {})

  return useMemo(
    () =>
      settings.assets
        .filter(({ lendingManagerClaimEnabled }) => lendingManagerClaimEnabled)
        .sort((_a, _b) => _a.name.localeCompare(_b.name))
        .map((_asset) => {
          const amount = assetsAmount[_asset.address]

          const rate = rates ? rates[_asset.symbolPrice] : null
          let countervalue = null

          if (rate) {
            countervalue = BigNumber(amount).multipliedBy(rate).toFixed(2)
          }

          return {
            amount,
            countervalue,
            formattedAmount: formatAssetAmount(amount, _asset.symbol),
            formattedCountervalue: countervalue ? formatCurrency(countervalue, 'USD') : null,
            ..._asset
          }
        })
        .sort((_a, _b) => (BigNumber(_a.amount).isGreaterThan(_b.amount) ? -1 : 1)),
    [assetsAmount, rates]
  )
}

const useClaimFeeByEpoch = () => {
  const { switchChain } = useSwitchChain({ chainId: polygon.id })
  const activeChainId = useChainId()
  const { error, data, writeAsync } = useWriteContract({
    address: settings.contracts.feesManager,
    abi: FeesManagerABI,
    functionName: 'claimFeeByEpoch',
    mode: 'recklesslyUnprepared',
    chainId: polygon.id
  })

  const onClaim = useCallback(
    (_asset, _epoch) =>
      writeAsync({
        recklesslySetUnpreparedArgs: [_asset, _epoch]
      }),
    [writeAsync]
  )

  return {
    claim: activeChainId !== polygon.id && switchChain ? switchChain : onClaim,
    error,
    data
  }
}

const useClaimFeeByEpochsRange = () => {
  const { currentEpoch } = useEpochs()
  const { switchChain } = useSwitchChain({ chainId: polygon.id })
  const activeChainId = useChainId()
  const { error, data, writeAsync } = useWriteContract({
    address: settings.contracts.feesManager,
    abi: FeesManagerABI,
    functionName: 'claimFeeByEpochsRange',
    mode: 'recklesslyUnprepared',
    chainId: polygon.id
  })

  // TODO: choose better startEpoch and endEpoch

  const onClaim = useCallback(
    (_asset) =>
      writeAsync({
        recklesslySetUnpreparedArgs: [_asset, 0, currentEpoch - 1]
      }),
    [currentEpoch, writeAsync]
  )

  return {
    claim: activeChainId !== polygon.id && switchChain ? switchChain : onClaim,
    error,
    data
  }
}

const useStakingSentinelEstimatedRevenues = () => {
  const { currentEpoch } = useEpochs()
  const { endEpoch: sentinelRegistrationEndEpoch, kind, startEpoch: sentinelRegistrationStartEpoch } = useSentinel()
  const { value: mr } = useSentinelLastEpochReward()

  const { startEpoch, endEpoch } = useMemo(() => {
    if (kind !== STAKING_SENTINEL) {
      return {
        startEpoch: null,
        endEpoch: null
      }
    }

    return {
      startEpoch: sentinelRegistrationStartEpoch > currentEpoch ? sentinelRegistrationStartEpoch : currentEpoch + 1,
      endEpoch: sentinelRegistrationEndEpoch - currentEpoch < 6 ? currentEpoch + 6 : sentinelRegistrationEndEpoch
    }
  }, [kind, currentEpoch, sentinelRegistrationStartEpoch, sentinelRegistrationEndEpoch])

  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'totalBorrowedAmountByEpochsRange',
    args: [startEpoch, endEpoch],
    enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0),
    chainId: polygon.id
  })

  const borrowedAmount = settings.registrationManager.borrowAmount
  const totalBorrowedAmountInEpoch = useMemo(() => (data ? data : []), [data])

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    startEpoch,
    endEpoch,
    mr
  })

  // NOTE: i need the current number of staking sentinels
  const numberOfSentinelsInEpoch = useMemo(() => {
    return totalBorrowedAmountInEpoch.map((_val) => BigNumber(_val.toString()).dividedBy(borrowedAmount))
  }, [totalBorrowedAmountInEpoch, borrowedAmount])

  const revenues = useMemo(
    () =>
      (startEpoch || startEpoch === 0) && endEpoch && kind === STAKING_SENTINEL
        ? range(startEpoch, endEpoch + 1).map((_epoch) => {
            const stakingSentinelsRevenuesAmount =
              feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[_epoch]
                ? feeDistributionByMonthlyRevenues[_epoch].stakingSentinelsRevenuesAmount
                : BigNumber(0)

            const numberOfSentinels = numberOfSentinelsInEpoch
            const stakingFeePercentage =
              !numberOfSentinels || BigNumber(numberOfSentinels).isNaN() || BigNumber(numberOfSentinels).isEqualTo(0)
                ? new BigNumber(0)
                : BigNumber(1).dividedBy(numberOfSentinels)

            return stakingSentinelsRevenuesAmount.multipliedBy(stakingFeePercentage).toFixed()
          })
        : [],
    [numberOfSentinelsInEpoch, feeDistributionByMonthlyRevenues, endEpoch, startEpoch, kind]
  )

  return {
    endEpoch,
    revenues,
    startEpoch
  }
}

const useBorrowingSentinelEstimatedRevenues = () => {
  const { currentEpoch } = useEpochs()
  const { endEpoch: sentinelRegistrationEndEpoch, kind, startEpoch: sentinelRegistrationStartEpoch } = useSentinel()
  const { value: mr } = useSentinelLastEpochReward()

  const { startEpoch, endEpoch } = useMemo(() => {
    if (kind !== BORROWING_SENTINEL) {
      return {
        startEpoch: null,
        endEpoch: null
      }
    }
    return {
      startEpoch: sentinelRegistrationStartEpoch > currentEpoch ? sentinelRegistrationStartEpoch : currentEpoch + 1,
      endEpoch: currentEpoch - sentinelRegistrationEndEpoch < 6 ? currentEpoch + 6 : sentinelRegistrationEndEpoch
    }
  }, [kind, currentEpoch, sentinelRegistrationEndEpoch, sentinelRegistrationStartEpoch])

  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'totalBorrowedAmountByEpochsRange',
    args: [startEpoch, endEpoch],
    enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0),
    chainId: polygon.id
  })

  const borrowedAmount = settings.registrationManager.borrowAmount
  const totalBorrowedAmountInEpoch = useMemo(() => (data ? data : []), [data])

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    startEpoch,
    endEpoch,
    mr
  })

  // NOTE: onchain borrowed amount has no decimals
  const numberOfSentinelsInEpoch = useMemo(() => {
    return totalBorrowedAmountInEpoch.map((_val) => BigNumber(_val.toString()).dividedBy(borrowedAmount))
  }, [totalBorrowedAmountInEpoch, borrowedAmount])

  const revenues = useMemo(
    () =>
      (startEpoch || startEpoch === 0) && endEpoch && kind === BORROWING_SENTINEL
        ? range(startEpoch, endEpoch + 1).map((_epoch, _index) => {
            const borrowingSentinelsRevenuesAmount =
              feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[_epoch]
                ? feeDistributionByMonthlyRevenues[_epoch].borrowingSentinelsRevenuesAmount
                : BigNumber(0)

            // _index is needed since numberOfSentinelsInEpoch is an array where elements[0] represent the value of the current epoch
            const numberOfSentinels = numberOfSentinelsInEpoch[_index]

            const borrowingFeePercentage =
              !numberOfSentinels || BigNumber(numberOfSentinels).isNaN() || BigNumber(numberOfSentinels).isEqualTo(0)
                ? new BigNumber(0)
                : BigNumber(1).dividedBy(numberOfSentinels)

            return borrowingSentinelsRevenuesAmount.multipliedBy(borrowingFeePercentage).toFixed()
          })
        : [],
    [numberOfSentinelsInEpoch, feeDistributionByMonthlyRevenues, endEpoch, startEpoch, kind]
  )

  return {
    endEpoch,
    revenues,
    startEpoch
  }
}

export {
  useBorrowingSentinelEstimatedRevenues,
  useClaimableFeesAssetsByAssets,
  useClaimableFeesAssetsByEpochs,
  useClaimFeeByEpoch,
  useClaimFeeByEpochsRange,
  useFeesDistributionByMonthlyRevenues,
  useStakingSentinelEstimatedRevenues
}
