import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { groupBy } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import {
  erc20ABI,
  useAccount,
  useBalance,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'

import settings from '../settings'
import BorrowingManagerABI from '../utils/abis/BorrowingManager.json'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import { formatAssetAmount, formatCurrency } from '../utils/amount'
import { SECONDS_IN_ONE_DAY } from '../utils/time'
import { useRates } from './use-crypto-compare'
import { useEpochs } from './use-epochs'
import { useFeesDistributionByMonthlyRevenues } from './use-fees-manager'

const useLend = () => {
  const [amount, setAmount] = useState('0')
  const [receiver, setReceiver] = useState('')
  const [approved, setApproved] = useState(false)
  const [duration, setDuration] = useState(settings.stakingManager.minStakeDays)
  const [epochs, setEpochs] = useState(0)
  const { address } = useAccount()

  const { data: pntBalanceData } = useBalance({
    token: settings.contracts.pnt,
    address
  })

  const onChainAmount = useMemo(
    () => (amount.length > 0 ? ethers.utils.parseEther(amount) : ethers.BigNumber.from('0')),
    [amount]
  )

  const { data: allowance } = useContractRead({
    address: settings.contracts.pnt,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, settings.contracts.borrowingManager]
  })

  const approveEnabled = useMemo(() => onChainAmount.gt(0) && !approved, [onChainAmount, approved])
  const { config: approveConfigs } = usePrepareContractWrite({
    address: settings.contracts.pnt,
    abi: erc20ABI,
    functionName: 'approve',
    args: [settings.contracts.borrowingManager, onChainAmount],
    enabled: approveEnabled
  })
  const { write: approve, error: approveError, data: approveData } = useContractWrite(approveConfigs)

  const lendEnabled = useMemo(
    () => onChainAmount.gt(0) && approved && pntBalanceData && onChainAmount.lte(pntBalanceData.value) && epochs > 0,
    [onChainAmount, approved, pntBalanceData, epochs]
  )
  const { config: lendConfigs } = usePrepareContractWrite({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'lend',
    args: [onChainAmount, duration * SECONDS_IN_ONE_DAY, receiver],
    enabled: lendEnabled
  })
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
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'weightByEpochsRangeOf',
    args: [address, 0, currentEpoch + 23],
    enabled: (currentEpoch || currentEpoch === 0) && address
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
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'weightByEpochsRangeOf',
    args: [address, 0, currentEpoch + 23],
    enabled: (currentEpoch || currentEpoch === 0) && address
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
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'totalLendedAmountByEpoch',
    args: [_epoch]
  })

  const amount = useMemo(() => (data ? BigNumber(data.toString()).dividedBy(10 ** 18) : BigNumber(null)), [data])

  return {
    value: amount.toFixed(),
    formattedValue: formatAssetAmount(amount, 'PNT')
  }
}

const useTotalBorrowedAmountByEpoch = (_epoch) => {
  const { data } = useContractRead({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'totaBorrowedAmountByEpoch',
    args: [_epoch]
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
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'totalLendedAmountByEpochsRange',
    args: [startEpoch, endEpoch],
    enabled: startEpoch && endEpoch
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
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'utilizationRatioByEpochsRange',
    args: [currentEpoch, currentEpoch + 12],
    enabled: currentEpoch || currentEpoch === 0
  })

  return data?.reduce((_acc, _amount, _index) => {
    const ratio = BigNumber(_amount?.toString()).dividedBy(10 ** 16)

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
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'utilizationRatioByEpoch',
    args: [currentEpoch],
    enabled: currentEpoch || currentEpoch === 0
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
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'utilizationRatioOf',
    args: [address, startEpoch, endEpoch],
    enabled: startEpoch && endEpoch && address
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

const useClaimableInterestsAssetsByEpochs = () => {
  const assets = settings.assets
    .filter(({ borrowingManagerClaimEnabled }) => borrowingManagerClaimEnabled)
    .sort((_a, _b) => _a.name.localeCompare(_b.name))
  const { address } = useAccount()
  const { currentEpoch } = useEpochs()

  const rates = useRates(
    assets
      .filter(({ borrowingManagerClaimEnabled }) => borrowingManagerClaimEnabled)
      .map(({ symbolPrice }) => symbolPrice),
    { apiKey: process.env.REACT_APP_CRYPTO_COMPARE_API_KEY }
  )

  const { data } = useContractRead({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'claimableAssetsAmountByEpochsRangeOf',
    args: [address, assets.map(({ address }) => address), 0, currentEpoch],
    enabled: address && (currentEpoch || currentEpoch === 0)
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

const useClaimableInterestsAssetsByAssets = () => {
  const rates = useRates()
  const assets = useClaimableInterestsAssetsByEpochs()
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

const useClaimInterestByEpoch = () => {
  const { error, data, writeAsync } = useContractWrite({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'claimInterestByEpoch',
    mode: 'recklesslyUnprepared'
  })

  return {
    claim: writeAsync,
    error,
    data
  }
}

/*const useTotalAssetInterestAmountByEpoch = () => {
  const asset = settings.assets.find(({ symbol }) => symbol === 'TEST')
  const { data } = useContractRead({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'totalAssetInterestAmountByEpoch',
    args: [asset.address, 1]
  })
}*/

const useEstimateApy = () => {
  const { currentEpoch, epochDuration } = useEpochs()
  const { address } = useAccount()
  const [duration, setDuration] = useState(0) // in days
  const [amount, setAmount] = useState(0)

  const { PNT: pntUsd } = useRates(['PNT'], { apiKey: process.env.REACT_APP_CRYPTO_COMPARE_API_KEY })

  const [_startEpoch, _endEpoch] = useMemo(
    () => (currentEpoch || currentEpoch === 0 ? [0, currentEpoch + 25] : [null, null]),
    [currentEpoch]
  )

  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: settings.contracts.borrowingManager,
        abi: BorrowingManagerABI,
        functionName: 'totalWeightByEpochsRange',
        args: [_startEpoch, _endEpoch],
        enabled: (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0)
      },
      {
        address: settings.contracts.borrowingManager,
        abi: BorrowingManagerABI,
        functionName: 'weightByEpochsRangeOf',
        args: [address, _startEpoch, _endEpoch],
        enabled: address && (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0)
      }
    ]
  })

  const totalWeights = useMemo(() => (data && data[0] ? data[0].map((_val) => BigNumber(_val.toString())) : []), [data])
  const userWeights = useMemo(() => (data && data[1] ? data[1].map((_val) => BigNumber(_val.toString())) : []), [data])

  const { startEpoch, endEpoch } = useMemo(() => {
    const lockTime = BigNumber(duration).multipliedBy(SECONDS_IN_ONE_DAY)
    const newStartEpoch = BigNumber(currentEpoch).plus(1)
    const newEndEpoch = BigNumber(currentEpoch).plus(lockTime.dividedToIntegerBy(epochDuration))

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
    if (endEpoch - startEpoch <= 0) return { apy: BigNumber(0), userWeightPercentages: [] }

    const userWeightPercentages = []
    let totalUserRevenues = new BigNumber(0)

    for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
      const poolRevenue =
        feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[epoch]
          ? feeDistributionByMonthlyRevenues[epoch].lendersInterestsAmount
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

    return {
      apy: BigNumber(totalUserRevenuesAnnualized).dividedBy(BigNumber(amount).multipliedBy(pntUsd)),
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

const useApy = () => {
  const { currentEpoch } = useEpochs()
  const { address } = useAccount()
  const { value: startEpoch } = useAccountLoanStartEpoch()
  const { value: endEpoch } = useAccountLoanEndEpoch()
  const { PNT: pntUsd } = useRates(['PNT'], { apiKey: process.env.REACT_APP_CRYPTO_COMPARE_API_KEY })

  const [_startEpoch, _endEpoch] = useMemo(
    () => (currentEpoch || currentEpoch === 0 ? [0, currentEpoch + 25] : [null, null]),
    [currentEpoch]
  )

  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: settings.contracts.stakingManager,
        abi: StakingManagerABI,
        functionName: 'stakeOf',
        args: [address],
        enabled: address
      },
      {
        address: settings.contracts.borrowingManager,
        abi: BorrowingManagerABI,
        functionName: 'totalWeightByEpochsRange',
        args: [_startEpoch, _endEpoch],
        enabled: (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0)
      },
      {
        address: settings.contracts.borrowingManager,
        abi: BorrowingManagerABI,
        functionName: 'weightByEpochsRangeOf',
        args: [address, _startEpoch, _endEpoch],
        enabled: address && (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0)
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
          ? feeDistributionByMonthlyRevenues[epoch].lendersInterestsAmount
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

    // NOTE: What does it happen if an user stake (without lending) and then lend another amount? The APY would be wrong
    // since if we check the staked amount could be possibile that we show an higher apy
    const apy = BigNumber(totalUserRevenuesAnnualized).dividedBy(stakedAmount.multipliedBy(pntUsd))

    return {
      value: apy.toFixed(),
      formattedValue: !apy.isNaN() ? `${apy.toFixed(2)}%` : '-'
    }
  }, [pntUsd, totalWeights, startEpoch, endEpoch, userWeights, stake, feeDistributionByMonthlyRevenues])
}

export {
  useAccountLoanEndEpoch,
  useAccountLoanStartEpoch,
  useAccountUtilizationRatio,
  useApy,
  useClaimableInterestsAssetsByAssets,
  useClaimableInterestsAssetsByEpochs,
  useClaimInterestByEpoch,
  useLend,
  useTotalBorrowedAmountByEpoch,
  useTotalLendedAmountByEpoch,
  useTotalLendedAmountByStartAndEndEpochs,
  useUtilizationRatio,
  useUtilizationRatioInTheCurrentEpoch,
  useEstimateApy
}
