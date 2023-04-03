import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { groupBy } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useAccount,
  useBalance,
  useChainId,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'
import { mainnet, polygon } from 'wagmi/chains'
import moment from 'moment'

import settings from '../settings'
import BorrowingManagerABI from '../utils/abis/LendingManager.json'
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

const useLend = () => {
  const [amount, setAmount] = useState('0')
  const [receiver, setReceiver] = useState('')
  const [approved, setApproved] = useState(false)
  const [duration, setDuration] = useState(settings.stakingManager.minStakeDays)
  const [epochs, setEpochs] = useState(0)
  const { address } = useAccount()
  const activeChainId = useChainId()

  const { data: pntBalanceData } = useBalance({
    token: settings.contracts.pntOnEthereum,
    address,
    chainId: mainnet.id
  })

  const onChainAmount = useMemo(
    () => (amount.length > 0 ? ethers.utils.parseEther(amount) : ethers.BigNumber.from('0')),
    [amount]
  )

  const { data: allowance } = useContractRead(
    prepareContractReadAllowanceApproveLend({ activeChainId, address, enabled: address })
  )

  const approveEnabled = useMemo(() => onChainAmount.gt(0) && !approved && address, [onChainAmount, approved, address])
  const { config: approveConfigs } = usePrepareContractWrite(
    prepareContractWriteApproveLend({ activeChainId, amount: onChainAmount, enabled: approveEnabled })
  )
  const { write: approve, error: approveError, data: approveData } = useContractWrite(approveConfigs)

  const lendEnabled = useMemo(
    () =>
      onChainAmount.gt(0) &&
      approved &&
      pntBalanceData &&
      onChainAmount.lte(pntBalanceData.value) &&
      epochs > 0 &&
      address,
    [onChainAmount, approved, pntBalanceData, epochs, address]
  )

  const { config: lendConfigs } = usePrepareContractWrite(
    prepareContractWriteLend({
      activeChainId,
      amount: onChainAmount,
      duration: duration * SECONDS_IN_ONE_DAY,
      receiver,
      enabled: lendEnabled
    })
  )

  const { write: lend, error: lendError, data: lendData } = useContractWrite(lendConfigs)

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash
  })

  const { isLoading: isLending } = useWaitForTransaction({
    hash: lendData?.hash
  })

  useEffect(() => {
    setApproved(allowance ? allowance.gte(onChainAmount) : false)
  }, [allowance, onChainAmount])

  useEffect(() => {
    if (approveData) {
      approveData.wait(1).then(() => {
        setApproved(true)
      })
    }
  }, [approveData, setApproved])

  useEffect(() => {
    if (lendData) {
      lendData.wait(1).then(() => {
        setAmount('0')
      })
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
  const { address } = useAccount()
  const { currentEpoch } = useEpochs()

  const { data } = useContractRead({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
    functionName: 'weightByEpochsRangeOf',
    args: [address, 0, currentEpoch + 23],
    enabled: (currentEpoch || currentEpoch === 0) && address,
    chainId: polygon.id
  })

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

  const { data } = useContractRead({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
    functionName: 'weightByEpochsRangeOf',
    args: [address, 0, currentEpoch + 23],
    enabled: (currentEpoch || currentEpoch === 0) && address,
    chainId: polygon.id
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
  const { data } = useContractRead({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
    functionName: 'totalLendedAmountByEpoch',
    args: [_epoch],
    chainId: polygon.id
  })

  const amount = useMemo(() => (data ? BigNumber(data.toString()).dividedBy(10 ** 18) : BigNumber(null)), [data])

  return {
    value: amount.toFixed(),
    formattedValue: formatAssetAmount(amount, 'PNT')
  }
}

const useTotalBorrowedAmountByEpoch = (_epoch) => {
  const { data } = useContractRead({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
    functionName: 'totaBorrowedAmountByEpoch',
    args: [_epoch],
    chainId: polygon.id
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

  const { data } = useContractRead({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
    functionName: 'totalLendedAmountByEpochsRange',
    args: [startEpoch, endEpoch],
    enabled: startEpoch && endEpoch,
    chainId: polygon.id
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

  const { data } = useContractRead({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
    functionName: 'utilizationRatioByEpochsRange',
    args: [currentEpoch, currentEpoch + 12],
    enabled: currentEpoch || currentEpoch === 0,
    chainId: polygon.id
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

  const { data } = useContractRead({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
    functionName: 'utilizationRatioByEpoch',
    args: [currentEpoch],
    enabled: currentEpoch || currentEpoch === 0,
    chainId: polygon.id
  })

  const ratio = BigNumber(data?.toString()).dividedBy(10 ** 16)

  return {
    value: ratio.toFixed(),
    formattedValue: `${ratio}%`
  }
}

const useAccountUtilizationRatio = () => {
  const { address } = useAccount()
  const { value: startEpoch } = useAccountLoanStartEpoch()
  const { value: endEpoch } = useAccountLoanEndEpoch()

  const { data } = useContractRead({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
    functionName: 'utilizationRatioOf',
    args: [address, startEpoch, endEpoch],
    enabled: startEpoch && endEpoch && address,
    chainId: polygon.id
  })

  return data?.reduce((_acc, _amount, _index) => {
    const ratio = BigNumber(_amount?.toString()).dividedBy(10 ** 16)

    _acc[_index + startEpoch] = {
      value: ratio.toFixed(),
      formattedValue: `${ratio}%`
    }

    return _acc
  }, {})
}

const useClaimableRewardsAssetsByEpochs = () => {
  const assets = settings.assets
    .filter(({ borrowingManagerClaimEnabled }) => borrowingManagerClaimEnabled)
    .sort((_a, _b) => _a.name.localeCompare(_b.name))
  const { address } = useAccount()
  const { currentEpoch } = useEpochs()

  const rates = useRates(
    assets
      .filter(({ borrowingManagerClaimEnabled }) => borrowingManagerClaimEnabled)
      .map(({ symbolPrice }) => symbolPrice)
  )

  const { data } = useContractRead({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
    functionName: 'claimableAssetsAmountByEpochsRangeOf',
    args: [address, assets.map(({ address }) => address), 0, currentEpoch],
    enabled: address && (currentEpoch || currentEpoch === 0),
    watch: true
  })

  return useMemo(() => {
    if (!data) return null

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
  }, [rates, assets, currentEpoch, data])
}

const useClaimableRewardsAssetsByAssets = () => {
  const rates = useRates(
    settings.assets
      .filter(({ borrowingManagerClaimEnabled }) => borrowingManagerClaimEnabled)
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

const useClaimRewardByEpoch = () => {
  const { error, data, writeAsync } = useContractWrite({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
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
  const { error, data, writeAsync } = useContractWrite({
    address: settings.contracts.lendingManager,
    abi: BorrowingManagerABI,
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

  const [_startEpoch, _endEpoch] = useMemo(
    () => (currentEpoch || currentEpoch === 0 ? [0, currentEpoch + 25] : [null, null]),
    [currentEpoch]
  )

  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: settings.contracts.lendingManager,
        abi: BorrowingManagerABI,
        functionName: 'totalWeightByEpochsRange',
        args: [_startEpoch, _endEpoch],
        enabled: (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0),
        chainId: polygon.id
      },
      {
        address: settings.contracts.lendingManager,
        abi: BorrowingManagerABI,
        functionName: 'weightByEpochsRangeOf',
        args: [address, _startEpoch, _endEpoch],
        enabled: address && (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0),
        chainId: polygon.id
      }
    ]
  })

  const totalWeights = useMemo(() => (data && data[0] ? data[0].map((_val) => BigNumber(_val.toString())) : []), [data])
  const userWeights = useMemo(() => (data && data[1] ? data[1].map((_val) => BigNumber(_val.toString())) : []), [data])

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
    mr: 150
  })

  const { apy, userWeightPercentages } = useMemo(() => {
    if (BigNumber(amount).isEqualTo(0)) return { apy: BigNumber(), userWeightPercentages: [] }
    if (endEpoch - startEpoch < 0) return { apy: BigNumber(0), userWeightPercentages: [] }

    const userWeightPercentages = []
    let totalUserRevenues = new BigNumber(0)

    for (let epoch = startEpoch, index = 0; epoch <= endEpoch; epoch++, index++) {
      const poolRevenue =
        feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[index]
          ? feeDistributionByMonthlyRevenues[index].lendersRewardsAmount
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

  const [_startEpoch, _endEpoch] = useMemo(
    () => (currentEpoch || currentEpoch === 0 ? [0, currentEpoch + 25] : [null, null]),
    [currentEpoch]
  )

  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: settings.contracts.lendingManager,
        abi: BorrowingManagerABI,
        functionName: 'totalWeightByEpochsRange',
        args: [_startEpoch, _endEpoch],
        enabled: (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0),
        chainId: polygon.id
      },
      {
        address: settings.contracts.lendingManager,
        abi: BorrowingManagerABI,
        functionName: 'weightByEpochsRangeOf',
        args: [address, _startEpoch, _endEpoch],
        enabled: address && (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0),
        chainId: polygon.id
      },
      {
        address: settings.contracts.stakingManagerLM,
        abi: StakingManagerABI,
        functionName: 'stakeOf',
        args: [address],
        enabled: address,
        chainId: polygon.id
      }
    ]
  })

  const totalWeights = useMemo(() => (data && data[0] ? data[0].map((_val) => BigNumber(_val.toString())) : []), [data])
  const userWeights = useMemo(() => (data && data[1] ? data[1].map((_val) => BigNumber(_val.toString())) : []), [data])
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
    mr: 150
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
          ? feeDistributionByMonthlyRevenues[index].lendersRewardsAmount
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
  const { currentEpoch } = useEpochs()
  const { address } = useAccount()
  const { value: startEpoch } = useAccountLoanStartEpoch()
  const { value: endEpoch } = useAccountLoanEndEpoch()
  const { PNT: pntUsd } = useRates(['PNT'])

  const [_startEpoch, _endEpoch] = useMemo(
    () => (currentEpoch || currentEpoch === 0 ? [0, currentEpoch + 25] : [null, null]),
    [currentEpoch]
  )

  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: settings.contracts.stakingManagerLM,
        abi: StakingManagerABI,
        functionName: 'stakeOf',
        args: [address],
        enabled: address,
        chainId: polygon.id
      },
      {
        address: settings.contracts.lendingManager,
        abi: BorrowingManagerABI,
        functionName: 'totalWeightByEpochsRange',
        args: [_startEpoch, _endEpoch],
        enabled: (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0),
        chainId: polygon.id
      },
      {
        address: settings.contracts.lendingManager,
        abi: BorrowingManagerABI,
        functionName: 'weightByEpochsRangeOf',
        args: [address, _startEpoch, _endEpoch],
        enabled: address && (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0),
        chainId: polygon.id
      }
    ]
  })

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    startEpoch,
    endEpoch,
    mr: 150
  })

  const stake = useMemo(() => (data && data[0] ? data[0] : {}), [data])
  const totalWeights = useMemo(() => (data && data[1] ? data[1].map((_val) => BigNumber(_val)) : []), [data])
  const userWeights = useMemo(() => (data && data[2] ? data[2].map((_val) => BigNumber(_val)) : []), [data])

  return useMemo(() => {
    const stakedAmount = BigNumber(stake?.amount?.toString()).dividedBy(10 ** 18)

    let totalUserRevenues = new BigNumber(0)
    for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
      const poolRevenue =
        feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[epoch]
          ? feeDistributionByMonthlyRevenues[epoch].lendersRewardsAmount
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

  const { config } = usePrepareContractWrite(
    prepareContractWriteIncreaseLendDuration({
      activeChainId,
      duration: duration * SECONDS_IN_ONE_DAY,
      enabled: duration > 0
    })
  )
  const { write, error, data, isLoading } = useContractWrite(config)

  return {
    duration,
    setDuration,
    increaseLendDuration: write,
    increaseLendDurationData: data,
    increaseLendDurationError: error,
    increaseLendDurationLoading: isLoading
  }
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
  useEstimateApy,
  useEstimateApyIncreaseDuration,
  useIncreaseLendDuration,
  useLend,
  useTotalBorrowedAmountByEpoch,
  useTotalLendedAmountByEpoch,
  useTotalLendedAmountByStartAndEndEpochs,
  useUtilizationRatio,
  useUtilizationRatioInTheCurrentEpoch
}
