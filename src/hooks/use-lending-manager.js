import BigNumber from 'bignumber.js'
import { groupBy } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBlockNumber
} from 'wagmi'
import { gnosis } from 'wagmi/chains'
import { useQueryClient } from '@tanstack/react-query'
import moment from 'moment'

import settings from '../settings'
import { getPntAddressByChainId } from '../utils/preparers/balance'
import LendingManagerABI from '../utils/abis/LendingManager.json'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import { formatAssetAmount, formatCurrency } from '../utils/amount'
import { SECONDS_IN_ONE_DAY } from '../utils/time'
import { useRates } from './use-crypto-compare'
import { useEpochs } from './use-epochs'
import { useFeesDistributionByMonthlyRevenues } from './use-fees-manager'
import {
  prepareContractReadAllowanceApproveLend,
  prepareContractWriteApproveLend,
  prepareContractWriteLend,
  prepareContractWriteIncreaseLendDuration
} from '../utils/preparers/lending-manager'
import { getEthersOnChainAmount } from '../utils/amount'
import { useSentinelLastEpochReward } from './use-sentinels-historical-data'
import { extractActivityFromEvents } from '../utils/logs'

import { EventsContext } from '../components/context/Events'

const useLend = () => {
  const [amount, setAmount] = useState('0')
  const [receiver, setReceiver] = useState('')
  const [approved, setApproved] = useState(false)
  const [duration, setDuration] = useState(settings.stakingManager.minStakeDays)
  const [epochs, setEpochs] = useState(0)
  const { address } = useAccount()
  const activeChainId = useChainId()

  const { data: pntBalanceData } = useBalance({
    token: getPntAddressByChainId(activeChainId),
    address
  })

  const onChainAmount = useMemo(() => getEthersOnChainAmount(amount), [amount])

  const { data: allowance, refetch: refetchAllowance } = useReadContract(
    prepareContractReadAllowanceApproveLend({ activeChainId, address, enabled: address })
  )

  const approveEnabled = useMemo(() => onChainAmount > 0 && !approved && address, [onChainAmount, approved, address])
  const { writeContract: callApprove, error: approveError, data: approveData } = useWriteContract()
  const approve = () =>
    callApprove(prepareContractWriteApproveLend({ activeChainId, amount: onChainAmount, enabled: approveEnabled }))

  const lendEnabled = useMemo(
    () =>
      onChainAmount > 0 &&
      approved &&
      pntBalanceData &&
      onChainAmount <= pntBalanceData.value &&
      epochs > 0 &&
      Boolean(address),
    [onChainAmount, approved, pntBalanceData, epochs, address]
  )

  const { writeContract: callLend, error: lendError, data: lendData } = useWriteContract()
  const lend = () =>
    callLend(
      prepareContractWriteLend({
        activeChainId,
        amount: onChainAmount,
        duration: duration * SECONDS_IN_ONE_DAY,
        receiver,
        enabled: lendEnabled
      })
    )

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveData,
    confirmations: 1
  })

  const { isLoading: isLending } = useWaitForTransactionReceipt({
    hash: lendData,
    confirmations: 1
  })

  useEffect(() => {
    setApproved(allowance ? allowance >= onChainAmount : false)
  }, [allowance, onChainAmount])

  useEffect(() => {
    if (approveData) {
      setApproved(true)
      refetchAllowance()
    }
  }, [approveData, setApproved, refetchAllowance])

  useEffect(() => {
    if (lendData) {
      setAmount('0')
    }
  }, [lendData, setAmount])

  useEffect(() => {
    setReceiver(address)
  }, [address])

  return {
    amount,
    approve,
    approved,
    approveData,
    approveEnabled,
    approveError,
    duration,
    epochs,
    isApproving,
    isLending,
    lend,
    lendData,
    lendEnabled,
    lendError,
    receiver,
    setAmount,
    setApproved,
    setDuration,
    setEpochs,
    setReceiver
  }
}

const useAccountLoanEndEpoch = () => {
  const queryClient = useQueryClient()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { address } = useAccount()
  const { currentEpoch } = useEpochs()

  const { data, queryKey } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'weightByEpochsRangeOf',
    args: [address, 0, currentEpoch + 24],
    chainId: gnosis.id
  })

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [blockNumber, queryClient])

  const endEpoch = useMemo(
    () => (data ? data.length - 1 - data.findIndex((_, _index) => data[data.length - 1 - _index] > 0) : null),
    [data]
  )

  return {
    formattedValue: endEpoch || endEpoch === 0 ? `#${endEpoch}` : '-',
    value: endEpoch ? endEpoch : null
  }
}

const useAccountLoanStartEpoch = () => {
  const { address } = useAccount()
  const { currentEpoch } = useEpochs()

  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'weightByEpochsRangeOf',
    args: [address, 0, currentEpoch + 24],
    chainId: gnosis.id,
    query: {
      enabled: (currentEpoch || currentEpoch === 0) && address
    }
  })

  const startEpoch = useMemo(() => {
    if (!data) return null
    let isFirst = false
    const index = data.findIndex((_, _index) => {
      const weight = data[data.length - 1 - _index]
      if (weight > 0 && !isFirst) {
        isFirst = true
        return false
      }
      if (weight === 0 && isFirst) {
        return true
      }
      return false
    })
    return data.length - index
  }, [data])

  return {
    formattedValue: startEpoch || startEpoch === 0 ? `#${startEpoch}` : '-',
    value: startEpoch ? startEpoch : null
  }
}

const useTotalLendedAmountByEpoch = (_epoch) => {
  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'totalLendedAmountByEpoch',
    args: [_epoch],
    chainId: gnosis.id
  })

  const amount = useMemo(() => (data ? BigNumber(data.toString()).dividedBy(10 ** 18) : BigNumber(null)), [data])

  return {
    value: amount.toFixed(),
    formattedValue: formatAssetAmount(amount, 'PNT')
  }
}

const useTotalBorrowedAmountByEpoch = (_epoch) => {
  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'totaBorrowedAmountByEpoch',
    args: [_epoch],
    chainId: gnosis.id
  })

  const amount = useMemo(() => (data ? BigNumber(data.toString()).dividedBy(10 ** 18) : BigNumber(null)), [data])

  return {
    value: amount.toFixed(),
    formattedValue: formatAssetAmount(amount, 'PNT')
  }
}

const useTotalLendedAmountByStartAndEndEpochs = () => {
  const { value: startEpoch } = useAccountLoanStartEpoch()
  const { value: endEpoch } = useAccountLoanEndEpoch()

  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'totalLendedAmountByEpochsRange',
    args: [startEpoch, endEpoch],
    chainId: gnosis.id,
    query: {
      enabled: startEpoch && endEpoch
    }
  })

  const lendedAmount = useMemo(() => {
    if (!data) return null

    return data.reduce((_acc, _amount, _index) => {
      const offchainAmount = BigNumber(_amount?.toString()).dividedBy(10 ** 18)

      _acc[_index + startEpoch] = {
        value: offchainAmount.toFixed(),
        formattedValue: formatAssetAmount(offchainAmount, 'PNT')
      }

      return _acc
    }, {})
  }, [data, startEpoch])

  return lendedAmount
}

const useUtilizationRatio = () => {
  const { currentEpoch } = useEpochs()

  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'utilizationRatioByEpochsRange',
    args: [currentEpoch, currentEpoch + 12],
    chainId: gnosis.id,
    query: {
      enabled: currentEpoch || currentEpoch === 0
    }
  })

  return data?.reduce((_acc, _amount, _index) => {
    const ratio = BigNumber(_amount?.toString()).dividedBy(10 ** (6 - 2))

    _acc[_index + currentEpoch] = {
      value: ratio.toFixed(),
      formattedValue: `${ratio}%`
    }

    return _acc
  }, {})
}

const useUtilizationRatioInTheCurrentEpoch = () => {
  const { currentEpoch } = useEpochs()

  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'utilizationRatioByEpoch',
    args: [currentEpoch],
    chainId: gnosis.id,
    query: {
      enabled: currentEpoch || currentEpoch === 0
    }
  })

  const ratio = BigNumber(data?.toString()).dividedBy(10 ** 4)

  return {
    value: ratio.toFixed(),
    formattedValue: `${ratio.toFixed(2)}%`
  }
}

const useAccountUtilizationRatio = () => {
  const { address } = useAccount()
  const { value: startEpoch } = useAccountLoanStartEpoch()
  const { value: endEpoch } = useAccountLoanEndEpoch()

  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'utilizationRatioOf',
    args: [address, startEpoch, endEpoch],
    chainId: gnosis.id,
    query: {
      enabled: startEpoch && endEpoch && address
    }
  })

  return data?.reduce((_acc, _amount, _index) => {
    const ratio = BigNumber(_amount?.toString()).dividedBy(10 ** 4)

    _acc[_index + startEpoch] = {
      value: ratio.toFixed(),
      formattedValue: `${ratio}%`
    }

    return _acc
  }, {})
}

const useClaimableRewardsAssetsByEpochs = () => {
  const assets = settings.assets
    .filter(({ lendingManagerClaimEnabled }) => lendingManagerClaimEnabled)
    .sort((_a, _b) => _a.name.localeCompare(_b.name))
  const { address } = useAccount()
  const { currentEpoch } = useEpochs()

  const rates = useRates(
    assets.filter(({ lendingManagerClaimEnabled }) => lendingManagerClaimEnabled).map(({ symbolPrice }) => symbolPrice)
  )

  const { data } = useReadContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'claimableAssetsAmountByEpochsRangeOf',
    args: [address, assets.map(({ address }) => address), 0, currentEpoch],
    chainId: gnosis.id,
    query: {
      enabled: address && (currentEpoch || currentEpoch === 0)
    }
  })

  return useMemo(() => {
    if (!data) return null

    return Array.from(Array(currentEpoch + 1).keys()).reduce((_acc, _epoch) => {
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
  }, [rates, assets, currentEpoch, data])
}

const useClaimableRewardsAssetsByAssets = () => {
  const rates = useRates(
    settings.assets
      .filter(({ lendingManagerClaimEnabled }) => lendingManagerClaimEnabled)
      .map(({ symbolPrice }) => symbolPrice)
  )

  const assets = useClaimableRewardsAssetsByEpochs()
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

const useClaimRewardByEpoch = () => {
  const { error, data, writeAsync } = useWriteContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'claimRewardByEpoch',
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

const useClaimRewardByEpochsRange = () => {
  const { currentEpoch } = useEpochs()
  const { error, data, writeAsync } = useWriteContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    functionName: 'claimRewardByEpochsRange',
    mode: 'recklesslyUnprepared'
  })

  // TODO: choose better startEpoch and endEpoch

  const onClaim = useCallback(
    (_asset) =>
      writeAsync({
        recklesslySetUnpreparedArgs: [_asset, 0, currentEpoch]
      }),
    [currentEpoch, writeAsync]
  )

  return {
    claim: onClaim,
    error,
    data
  }
}

const useEstimateApy = () => {
  const { currentEpoch, epochDuration } = useEpochs()
  const { address } = useAccount()
  const [duration, setDuration] = useState(0) // in days
  const [amount, setAmount] = useState(0)
  const { PNT: pntUsd } = useRates(['PNT'])
  const { value: mr } = useSentinelLastEpochReward()

  const [_startEpoch, _endEpoch] = useMemo(
    () => (currentEpoch || currentEpoch === 0 ? [0, currentEpoch + 24] : [null, null]),
    [currentEpoch]
  )

  const { data } = useReadContracts({
    contracts: [
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'totalWeightByEpochsRange',
        args: [_startEpoch, _endEpoch],
        chainId: gnosis.id,
        query: {
          enabled: (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0)
        }
      },
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'weightByEpochsRangeOf',
        args: [address, _startEpoch, _endEpoch],
        chainId: gnosis.id,
        query: {
          enabled: address && (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0)
        }
      }
    ]
  })

  const totalWeights = useMemo(
    () => (data && data[0].result ? data[0].result.map((_val) => BigNumber(_val.toString())) : []),
    [data]
  )
  const userWeights = useMemo(
    () => (data && data[1].result ? data[1].result.map((_val) => BigNumber(_val.toString())) : []),
    [data]
  )

  const { startEpoch, endEpoch } = useMemo(() => {
    const lockTime = BigNumber(duration).multipliedBy(SECONDS_IN_ONE_DAY)
    const newStartEpoch = BigNumber(currentEpoch).plus(1)
    // TODO: handle the case when an user wants to lock tokens that are unlocked
    const newEndEpoch = BigNumber(currentEpoch).plus(lockTime.dividedToIntegerBy(epochDuration)).minus(1)

    if (newStartEpoch.isGreaterThan(newEndEpoch)) {
      return {
        startEpoch: null,
        endEpoch: null
      }
    }

    return {
      startEpoch: newStartEpoch.toNumber(),
      endEpoch: newEndEpoch.toNumber()
    }
  }, [currentEpoch, duration, epochDuration])

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    startEpoch,
    endEpoch,
    mr
  })

  const { apy, userWeightPercentages } = useMemo(() => {
    if (BigNumber(amount).isEqualTo(0)) return { apy: BigNumber(), userWeightPercentages: [] }
    if (endEpoch - startEpoch < 0) return { apy: BigNumber(0), userWeightPercentages: [] }

    const userWeightPercentages = []
    let totalUserRevenues = new BigNumber(0)

    for (let epoch = startEpoch, index = 0; epoch <= endEpoch; epoch++, index++) {
      const poolRevenue =
        feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[index]
          ? feeDistributionByMonthlyRevenues[index].lendersRevenuesAmount
          : BigNumber(0)

      const currentUserWeight = BigNumber(userWeights && userWeights[epoch] ? userWeights[epoch] : 0)
      const newUserWeight = BigNumber(amount).multipliedBy(endEpoch - epoch + 1)

      const totalWeightsInEpoch =
        totalWeights[epoch] && !totalWeights[epoch].isNaN() ? totalWeights[epoch].plus(newUserWeight) : newUserWeight

      const userWeightPercentage =
        !totalWeightsInEpoch || totalWeightsInEpoch.isNaN() || totalWeightsInEpoch.isEqualTo(0)
          ? new BigNumber(1)
          : newUserWeight.plus(currentUserWeight).dividedBy(totalWeightsInEpoch)

      userWeightPercentages[epoch] = userWeightPercentage.toNumber()

      const userEpochRevenues = poolRevenue.multipliedBy(userWeightPercentage)
      totalUserRevenues = totalUserRevenues.plus(userEpochRevenues)
    }

    const totalUserRevenuesAnnualized = totalUserRevenues.multipliedBy(24).dividedBy(endEpoch - startEpoch + 1)
    const divAmount = BigNumber(amount).multipliedBy(pntUsd).isEqualTo(0) ? 1 : BigNumber(amount).multipliedBy(pntUsd)

    return {
      apy: BigNumber(totalUserRevenuesAnnualized).dividedBy(divAmount),
      userWeightPercentages
    }
  }, [amount, pntUsd, totalWeights, startEpoch, endEpoch, userWeights, feeDistributionByMonthlyRevenues])

  return {
    apy: {
      formattedValue: !apy.isNaN() ? `${apy.toFixed(2)}%` : '-',
      value: apy.toFixed(2)
    },
    endEpoch,
    formattedEndEpoch: endEpoch || endEpoch === 0 ? `#${endEpoch}` : '-',
    formattedStartEpoch: startEpoch || startEpoch === 0 ? `#${startEpoch}` : '-',
    setAmount,
    setDuration,
    startEpoch,
    userWeightPercentages
  }
}

const useEstimateApyIncreaseDuration = () => {
  const { currentEpoch, epochDuration } = useEpochs()
  const { address } = useAccount()
  const [duration, setDuration] = useState(0) // in days
  const { value: currentLoanStartEpoch } = useAccountLoanStartEpoch()
  const { value: currentLoanEndEpoch } = useAccountLoanEndEpoch()
  const { PNT: pntUsd } = useRates(['PNT'])
  const { value: mr } = useSentinelLastEpochReward()

  const [_startEpoch, _endEpoch] = useMemo(
    () => (currentEpoch || currentEpoch === 0 ? [0, currentEpoch + 24] : [null, null]),
    [currentEpoch]
  )

  const { data } = useReadContracts({
    contracts: [
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'totalWeightByEpochsRange',
        args: [_startEpoch, _endEpoch],
        chainId: gnosis.id,
        query: {
          enabled: (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0)
        }
      },
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'weightByEpochsRangeOf',
        args: [address, _startEpoch, _endEpoch],
        chainId: gnosis.id,
        query: {
          enabled: address && (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0)
        }
      },
      {
        address: settings.contracts.stakingManagerLM,
        abi: StakingManagerABI,
        functionName: 'stakeOf',
        args: [address],
        chainId: gnosis.id,
        query: {
          enabled: address
        }
      }
    ]
  })

  const totalWeights = useMemo(
    () => (data && data[0].result ? data[0].result.map((_val) => BigNumber(_val.toString())) : []),
    [data]
  )
  const userWeights = useMemo(
    () => (data && data[1].result ? data[1].result.map((_val) => BigNumber(_val.toString())) : []),
    [data]
  )
  const stake = useMemo(() => (data && data[2] ? data[2] : []), [data])

  const { startEpoch, endEpoch } = useMemo(() => {
    if (duration === 0) {
      return {
        startEpoch: currentLoanStartEpoch,
        endEpoch: currentLoanEndEpoch
      }
    }

    const startEpoch = currentEpoch + 1
    const newEndDate = stake?.endDate.toNumber() + duration * SECONDS_IN_ONE_DAY
    const numberOfEpochs = Math.round((newEndDate - moment().unix()) / epochDuration) - 1
    const endEpoch = startEpoch + numberOfEpochs - 1

    return {
      startEpoch,
      endEpoch
    }
  }, [currentLoanStartEpoch, currentLoanEndEpoch, stake, currentEpoch, duration, epochDuration])

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    startEpoch,
    endEpoch,
    mr
  })

  const { apy, userWeightPercentages } = useMemo(() => {
    const stakedAmount = BigNumber(stake?.amount?.toString()).dividedBy(10 ** 18)
    if (stakedAmount.isEqualTo(0)) return { apy: BigNumber(), userWeightPercentages: [] }
    if (endEpoch - startEpoch < 0) return { apy: BigNumber(0), userWeightPercentages: [] }

    const userWeightPercentages = []
    let totalUserRevenues = new BigNumber(0)

    for (let epoch = startEpoch, index = 0; epoch <= endEpoch; epoch++, index++) {
      const poolRevenue =
        feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[index]
          ? feeDistributionByMonthlyRevenues[index].lendersRevenuesAmount
          : BigNumber(0)

      const currentUserWeight = BigNumber(userWeights && userWeights[epoch] ? userWeights[epoch] : 0)
      let totalWeightsInEpoch =
        totalWeights[epoch] && !totalWeights[epoch].isNaN()
          ? totalWeights[epoch].plus(currentUserWeight)
          : currentUserWeight

      if (!currentUserWeight.isEqualTo(0)) {
        totalWeightsInEpoch = totalWeightsInEpoch.minus(currentUserWeight)
      }

      const newUserWeight = stakedAmount.multipliedBy(endEpoch - epoch + 1)
      totalWeightsInEpoch = totalWeightsInEpoch.plus(newUserWeight)

      const userWeightPercentage =
        !totalWeightsInEpoch || totalWeightsInEpoch.isNaN() || totalWeightsInEpoch.isEqualTo(0)
          ? new BigNumber(1)
          : newUserWeight.plus(currentUserWeight).dividedBy(totalWeightsInEpoch)

      userWeightPercentages[epoch] = userWeightPercentage.toNumber()

      const userEpochRevenues = poolRevenue.multipliedBy(userWeightPercentage)
      totalUserRevenues = totalUserRevenues.plus(userEpochRevenues)
    }

    const totalUserRevenuesAnnualized = totalUserRevenues.multipliedBy(24).dividedBy(endEpoch - startEpoch + 1)
    const divAmount = stakedAmount.multipliedBy(pntUsd).isEqualTo(0) ? 1 : stakedAmount.multipliedBy(pntUsd)

    return {
      apy: BigNumber(totalUserRevenuesAnnualized).dividedBy(divAmount),
      userWeightPercentages
    }
  }, [stake, pntUsd, totalWeights, startEpoch, endEpoch, userWeights, feeDistributionByMonthlyRevenues])

  return {
    apy: {
      formattedValue: !apy.isNaN() ? `${apy.toFixed(2)}%` : '-',
      value: apy.toFixed(2)
    },
    endEpoch,
    formattedEndEpoch: endEpoch || endEpoch === 0 ? `#${endEpoch}` : '-',
    formattedStartEpoch: startEpoch || startEpoch === 0 ? `#${startEpoch}` : '-',
    setDuration,
    startEpoch,
    userWeightPercentages
  }
}

const useApy = () => {
  const { address } = useAccount()
  const { value: startEpoch } = useAccountLoanStartEpoch()
  const { value: endEpoch } = useAccountLoanEndEpoch()
  const { PNT: pntUsd } = useRates(['PNT'])
  const { value: mr } = useSentinelLastEpochReward()

  const { data } = useReadContracts({
    contracts: [
      {
        address: settings.contracts.stakingManagerLM,
        abi: StakingManagerABI,
        functionName: 'stakeOf',
        args: [address],
        chainId: gnosis.id,
        query: {
          enabled: address
        }
      },
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'totalWeightByEpochsRange',
        args: [startEpoch, endEpoch],
        chainId: gnosis.id,
        query: {
          enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0)
        }
      },
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'weightByEpochsRangeOf',
        args: [address, startEpoch, endEpoch],
        chainId: gnosis.id,
        query: {
          enabled: address && (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0)
        }
      }
    ]
  })

  const stake = useMemo(() => (data && data[0] ? data[0] : {}), [data])
  const totalWeights = useMemo(
    () => (data && data[1].result ? data[1].result.map((_val) => BigNumber(_val)) : []),
    [data]
  )
  const userWeights = useMemo(
    () => (data && data[2].result ? data[2].result.map((_val) => BigNumber(_val)) : []),
    [data]
  )

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    startEpoch,
    endEpoch,
    mr
  })

  return useMemo(() => {
    const stakedAmount = BigNumber(stake?.amount?.toString()).dividedBy(10 ** 18)

    let totalUserRevenues = new BigNumber(0)
    for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
      const poolRevenue =
        feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[epoch]
          ? feeDistributionByMonthlyRevenues[epoch].lendersRevenuesAmount
          : BigNumber(0)

      const totalWeight = totalWeights[epoch]
      const userWeight = userWeights[epoch]
      const userWeightPercentage =
        !totalWeight || totalWeight.isNaN() || totalWeight.isEqualTo(0)
          ? new BigNumber(1)
          : userWeight.dividedBy(totalWeight)

      const userEpochRevenues = poolRevenue.multipliedBy(userWeightPercentage)
      totalUserRevenues = totalUserRevenues.plus(userEpochRevenues)
    }

    const totalUserRevenuesAnnualized = totalUserRevenues.multipliedBy(24).dividedBy(endEpoch - startEpoch + 1)
    const divAmount = stakedAmount.multipliedBy(pntUsd).isEqualTo(0) ? 1 : stakedAmount.multipliedBy(pntUsd)
    const apy = BigNumber(totalUserRevenuesAnnualized).dividedBy(divAmount)

    return {
      value: apy.toFixed(),
      formattedValue: !apy.isNaN() ? `${apy.toFixed(2)}%` : '-'
    }
  }, [pntUsd, totalWeights, startEpoch, endEpoch, userWeights, stake, feeDistributionByMonthlyRevenues])
}

const useIncreaseLendDuration = () => {
  const [duration, setDuration] = useState(1) // 1 day
  const activeChainId = useChainId()

  const { writeContract: callWrite, error, data, isLoading } = useWriteContract()
  const write = () =>
    callWrite(
      prepareContractWriteIncreaseLendDuration({
        activeChainId,
        duration: duration * SECONDS_IN_ONE_DAY,
        enabled: duration > 0
      })
    )

  return {
    duration,
    setDuration,
    increaseLendDuration: write,
    increaseLendDurationData: data,
    increaseLendDurationError: error,
    increaseLendDurationLoading: isLoading
  }
}

const useEpochsBorrowableAmount = () => {
  const { data } = useReadContracts({
    contracts: [
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'totalLendedAmountByEpochsRange',
        args: [0, 24],
        chainId: gnosis.id,
        query: {
          enabled: true
        }
      },
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'totalBorrowedAmountByEpochsRange',
        args: [0, 24],
        chainId: gnosis.id,
        query: {
          enabled: true
        }
      }
    ]
  })

  const epochsLendedAmount = useMemo(
    () => (data && data[0].result ? data[0].result.map((_val) => BigNumber(_val)) : []),
    [data]
  )
  const epochsBorrowedAmount = useMemo(
    () => (data && data[1].result ? data[1].result.map((_val) => BigNumber(_val)) : []),
    [data]
  )
  const epochsBorrowableAmount = useMemo(
    () => epochsLendedAmount.map((_amount, _index) => _amount.minus(epochsBorrowedAmount[_index])),
    [epochsLendedAmount, epochsBorrowedAmount]
  )

  return {
    onChainEpochsBorrowableAmount: epochsBorrowableAmount,
    epochsBorrowableAmount: epochsBorrowableAmount.map((_val) => _val)
  }
}

const useLenders = () => {
  const [lenders, setLenders] = useState([])
  const { currentEpoch, startFirstEpochTimestamp, epochDuration } = useEpochs()
  const { lendedEvents } = useContext(EventsContext)

  useEffect(() => {
    const fetch = async () => {
      try {
        const formattedLendedEvents = (await extractActivityFromEvents(lendedEvents)).filter(
          ({ endEpoch }) => endEpoch > currentEpoch
        )
        const lendedEventsGroupedByLender = groupBy(formattedLendedEvents, 'lender')

        const totalLendedAmountByEpoch = formattedLendedEvents.reduce((_acc, { startEpoch, endEpoch, amount }) => {
          for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
            _acc[epoch] = BigNumber(_acc[epoch] || 0).plus(amount)
          }
          return _acc
        }, {})

        setLenders(
          Object.keys(lendedEventsGroupedByLender)
            .map((_address) => {
              const { lender, lenderNickname } = lendedEventsGroupedByLender[_address][0]

              const amount = lendedEventsGroupedByLender[_address].reduce((_acc, { amount }) => {
                _acc = _acc.plus(amount)
                return _acc
              }, BigNumber(0))

              const endEpoch = lendedEventsGroupedByLender[_address].reduce((_acc, { endEpoch }) => {
                if (endEpoch > _acc) {
                  _acc = endEpoch
                }
                return _acc
              }, 0)

              const lendedAmountByEpoch = lendedEventsGroupedByLender[_address].reduce(
                (_acc, { startEpoch, endEpoch, amount }) => {
                  for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
                    _acc[epoch] = BigNumber(_acc[epoch] || 0).plus(amount)
                  }
                  return _acc
                },
                {}
              )

              const finishesAt = startFirstEpochTimestamp + endEpoch * epochDuration
              const remainingTime = moment.unix(finishesAt).fromNow()
              const poolPercentage = lendedAmountByEpoch[currentEpoch]
                .dividedBy(totalLendedAmountByEpoch[currentEpoch])
                .toFixed(5)

              return {
                address: lender,
                amount: amount.toFixed(),
                endEpoch,
                formattedAmount: formatAssetAmount(amount, 'PNT'),
                formattedPoolPercentage: `${poolPercentage * 100}%`,
                nickname: lenderNickname,
                poolPercentage,
                remainingTime
              }
            })
            .sort((_a, _b) => _b.amount - _a.amount)
        )
      } catch (_err) {
        console.error(_err)
      }
    }

    fetch()
  }, [lendedEvents, currentEpoch, startFirstEpochTimestamp, epochDuration])

  return lenders
}

const useTotalNumberOfLendersInEpochs = () => {
  const { lendedEvents } = useContext(EventsContext)
  const decodedEvents = useMemo(
    () => lendedEvents.map(({ decode, data, topics }) => decode(data, topics)),
    [lendedEvents]
  )

  return useMemo(() => {
    const doubleLenders = {}
    return decodedEvents.reduce((_acc, _event) => {
      const lender = _event.lender
      if (!doubleLenders[lender]) {
        doubleLenders[lender] = {}
      }

      Array.from(
        { length: _event.endEpoch.toNumber() - _event.startEpoch.toNumber() + 1 },
        (_, i) => i + _event.startEpoch.toNumber()
      ).forEach((_epoch) => {
        if (!_acc[_epoch]) {
          _acc[_epoch] = 0
        }

        if (doubleLenders[lender][_epoch]) return
        doubleLenders[lender][_epoch] = true
        _acc[_epoch] += 1
      })

      return _acc
    }, {})
  }, [decodedEvents])
}

const useTotalNumberOfBorrowersInEpochs = () => {
  const { borrowedEvents } = useContext(EventsContext)
  const decodedEvents = useMemo(
    () => borrowedEvents.map(({ decode, data, topics }) => decode(data, topics)),
    [borrowedEvents]
  )

  return useMemo(() => {
    const doubleBorrowers = {}
    return decodedEvents.reduce((_acc, _event) => {
      const borrower = _event.borrower
      const epoch = _event.epoch

      if (!doubleBorrowers[borrower]) {
        doubleBorrowers[borrower] = {}
      }

      if (!_acc[epoch]) {
        _acc[epoch] = 0
      }

      if (doubleBorrowers[borrower][epoch]) return _acc
      doubleBorrowers[borrower][epoch] = true
      _acc[epoch] += 1

      return _acc
    }, {})
  }, [decodedEvents])
}

export {
  useAccountLoanEndEpoch,
  useAccountLoanStartEpoch,
  useAccountUtilizationRatio,
  useApy,
  useClaimableRewardsAssetsByAssets,
  useClaimableRewardsAssetsByEpochs,
  useClaimRewardByEpoch,
  useClaimRewardByEpochsRange,
  useEpochsBorrowableAmount,
  useEstimateApy,
  useEstimateApyIncreaseDuration,
  useIncreaseLendDuration,
  useLend,
  useLenders,
  useTotalBorrowedAmountByEpoch,
  useTotalLendedAmountByEpoch,
  useTotalLendedAmountByStartAndEndEpochs,
  useTotalNumberOfBorrowersInEpochs,
  useTotalNumberOfLendersInEpochs,
  useUtilizationRatio,
  useUtilizationRatioInTheCurrentEpoch
}
