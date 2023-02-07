import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { useContractWrite, useContractRead, useContractReads } from 'wagmi'
import { groupBy } from 'lodash'

import settings from '../settings'
import BorrowingManagerABI from '../utils/abis/BorrowingManager.json'
import FeesManagerABI from '../utils/abis/FeesManager.json'
import RegistrationManagerABI from '../utils/abis/RegistrationManager.json'
import { range } from '../utils/time'
import { useRates } from './use-crypto-compare'
import { useEpochs } from './use-epochs'
import { useSentinel } from './use-registration-manager'
import { formatAssetAmount, formatCurrency } from '../utils/amount'
import { BORROWING_SENTINEL, STAKING_SENTINEL } from '../contants'

const useFeesDistributionByMonthlyRevenues = ({ startEpoch, endEpoch, mr }) => {
  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: settings.contracts.borrowingManager,
        abi: BorrowingManagerABI,
        functionName: 'totalBorrowedAmountByEpochsRange',
        args: [startEpoch, endEpoch],
        enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0)
      },
      {
        address: settings.contracts.registrationManager,
        abi: RegistrationManagerABI,
        functionName: 'totalSentinelStakedAmountByEpochsRange',
        args: [startEpoch, endEpoch],
        enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0)
      },
      {
        address: settings.contracts.feesManager,
        abi: FeesManagerABI,
        functionName: 'kByEpochsRange',
        args: [startEpoch, endEpoch],
        enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0)
      }
    ]
  })

  const totalBorrowedAmountInEpoch = useMemo(() => (data && data[0] ? data[0] : []), [data])
  const totalStakedAmountInEpoch = useMemo(() => (data && data[1] ? data[1] : []), [data])
  const kInEpoch = useMemo(() => (data && data[2] ? data[2] : []), [data])

  return useMemo(
    () =>
      (startEpoch || startEpoch === 0) &&
      endEpoch &&
      range(startEpoch, endEpoch + 1).map((_, _index) => {
        const k = BigNumber(kInEpoch[_index] ? kInEpoch[_index].toString() : 0).multipliedBy(10 ** -6)
        const totalBorrowedAmount = BigNumber(
          totalBorrowedAmountInEpoch[_index] ? totalBorrowedAmountInEpoch[_index].toString() : 0
        )
        const totalSentinelStakedAmount = BigNumber(
          totalStakedAmountInEpoch[_index] ? totalStakedAmountInEpoch[_index].toString() : 0
        )
        const totalAmount = totalBorrowedAmount.plus(totalSentinelStakedAmount)
        const sentinelsStakingFeesPercentage = totalAmount.isEqualTo(0)
          ? BigNumber(0)
          : totalSentinelStakedAmount.dividedBy(totalAmount)
        const stakingSentinelsFeesAmount = BigNumber(mr).multipliedBy(sentinelsStakingFeesPercentage)
        const sentinelsBorrowingFeesAndLendersInterestsAmount = BigNumber(mr).minus(stakingSentinelsFeesAmount)
        const lendersInterestsAmount = sentinelsBorrowingFeesAndLendersInterestsAmount.multipliedBy(k)
        const borrowingSentinelsFeesAmount =
          sentinelsBorrowingFeesAndLendersInterestsAmount.minus(lendersInterestsAmount)

        return {
          lendersInterestsAmount,
          stakingSentinelsFeesAmount,
          borrowingSentinelsFeesAmount
        }
      }),
    [totalBorrowedAmountInEpoch, totalStakedAmountInEpoch, kInEpoch, startEpoch, endEpoch, mr]
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

  const { data } = useContractRead({
    address: settings.contracts.feesManager,
    abi: FeesManagerABI,
    functionName: 'claimableFeesByEpochsRangeOf',
    args: [sentinelAddress, assets.map(({ address }) => address), 0, currentEpoch],
    enabled,
    watch: true
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
      .filter(({ borrowingManagerClaimEnabled }) => borrowingManagerClaimEnabled)
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
        .filter(({ borrowingManagerClaimEnabled }) => borrowingManagerClaimEnabled)
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
  const { error, data, writeAsync } = useContractWrite({
    address: settings.contracts.feesManager,
    abi: FeesManagerABI,
    functionName: 'claimFeeByEpoch',
    mode: 'recklesslyUnprepared'
  })

  const onClaim = useCallback(
    (_asset, _epoch) =>
      writeAsync({
        recklesslySetUnpreparedArgs: [_asset, _epoch]
      }),
    [writeAsync]
  )

  return {
    claim: onClaim,
    error,
    data
  }
}

const useClaimFeeByEpochsRange = () => {
  const { currentEpoch } = useEpochs()
  const { error, data, writeAsync } = useContractWrite({
    address: settings.contracts.feesManager,
    abi: FeesManagerABI,
    functionName: 'claimFeeByEpochsRange',
    mode: 'recklesslyUnprepared'
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
    claim: onClaim,
    error,
    data
  }
}

const useStakingSentinelEstimatedRevenues = () => {
  const { currentEpoch } = useEpochs()
  const { endEpoch: sentinelRegistrationEndEpoch, kind, startEpoch: sentinelRegistrationStartEpoch } = useSentinel()

  const { startEpoch, endEpoch } = useMemo(() => {
    if (kind !== STAKING_SENTINEL) {
      return {
        startEpoch: null,
        endEpoch: null
      }
    }
    return {
      startEpoch: sentinelRegistrationStartEpoch > currentEpoch ? sentinelRegistrationStartEpoch : currentEpoch + 1,
      endEpoch: currentEpoch - sentinelRegistrationEndEpoch < 6 ? currentEpoch + 6 : sentinelRegistrationEndEpoch
    }
  }, [kind, currentEpoch, sentinelRegistrationStartEpoch, sentinelRegistrationEndEpoch])

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    startEpoch,
    endEpoch,
    mr: 150
  })

  // NOTE: i need the current number of staking sentinels
  const numberOfSentinelsInEpoch = BigNumber(1)

  const revenues = useMemo(
    () =>
      (startEpoch || startEpoch === 0) && endEpoch && kind === STAKING_SENTINEL
        ? range(startEpoch, endEpoch + 1).map((_, _index) => {
            const stakingSentinelsFeesAmount =
              feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[_index]
                ? feeDistributionByMonthlyRevenues[_index].stakingSentinelsFeesAmount
                : BigNumber(0)

            const numberOfSentinels = numberOfSentinelsInEpoch
            const stakingFeePercentage =
              !numberOfSentinels || numberOfSentinels.isNaN() || numberOfSentinels.isEqualTo(0)
                ? new BigNumber(0)
                : BigNumber(1).dividedBy(numberOfSentinels)

            return stakingSentinelsFeesAmount.multipliedBy(stakingFeePercentage).toFixed()
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

  const { data } = useContractRead({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'totalBorrowedAmountByEpochsRange',
    args: [startEpoch, endEpoch],
    enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0),
    cacheTime: 1000 * 60 * 2
  })

  const borrowedAmount = settings.registrationManager.borrowAmount
  const totalBorrowedAmountInEpoch = useMemo(() => (data ? data : []), [data])

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    startEpoch,
    endEpoch,
    mr: 150
  })

  // NOTE: onchain borrowed amount has no decimals
  const numberOfSentinelsInEpoch = useMemo(() => {
    return totalBorrowedAmountInEpoch.map((_val) => BigNumber(_val.toString()).dividedBy(borrowedAmount))
  }, [totalBorrowedAmountInEpoch, borrowedAmount])

  const revenues = useMemo(
    () =>
      (startEpoch || startEpoch === 0) && endEpoch && kind === BORROWING_SENTINEL
        ? range(startEpoch, endEpoch + 1).map((_, _index) => {
            const borrowingSentinelsFeesAmount =
              feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[_index]
                ? feeDistributionByMonthlyRevenues[_index].borrowingSentinelsFeesAmount
                : BigNumber(0)

            const numberOfSentinels = numberOfSentinelsInEpoch[_index]

            const borrowingFeePercentage =
              !numberOfSentinels || numberOfSentinels.isNaN() || numberOfSentinels.isEqualTo(0)
                ? new BigNumber(0)
                : BigNumber(1).dividedBy(numberOfSentinels)

            return borrowingSentinelsFeesAmount.multipliedBy(borrowingFeePercentage).toFixed()
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
