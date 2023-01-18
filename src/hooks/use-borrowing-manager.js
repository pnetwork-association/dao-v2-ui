import { useMemo, useState, useEffect } from 'react'
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
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { groupBy } from 'lodash'

import settings from '../settings'
import BorrowingManagerABI from '../utils/abis/BorrowingManager.json'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import { SECONDS_IN_ONE_DAY } from '../utils/time'
import { useEpochs } from './use-epochs'
import { formatAssetAmount } from '../utils/amount'
import { useRates } from './use-crypto-compare'
import { formatCurrency } from '../utils/amount'

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
    () => onChainAmount.gt(0) && approved && onChainAmount.lte(pntBalanceData.value) && epochs > 0,
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

const useAccountLendedAmountInTheCurrentEpoch = () => {
  const { currentEpoch } = useEpochs()
  return useAccountLendedAmountByEpoch(currentEpoch)
}

const useAccountLendedAmountInTheNextEpochOf = () => {
  const { currentEpoch } = useEpochs()
  return useAccountLendedAmountByEpoch(currentEpoch + 1)
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

const useAccountLendedAmountByEpoch = (_epoch) => {
  // const { address } = useAccount()

  /*const { data } = useContractRead({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'lendedAmountByEpochOf',
    args: [address, _epoch]
  })

  const amount = useMemo(() => (data ? BigNumber(data.toString()).dividedBy(10 ** 18) : BigNumber(null)), [data])

  return {
    value: amount.toFixed(),
    formattedValue: formatAssetAmount(amount, 'PNT')
  }*/
  return {
    value: 0,
    formattedValue: 'TODO'
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

const useAccountLendedAmountByStartAndEndLoanEpochs = () => {
  // const { address } = useAccount()
  // const { value: startEpoch } = useAccountLoanStartEpoch()
  // const { value: endEpoch } = useAccountLoanEndEpoch()

  return null

  /*const { data } = useContractRead({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'lendedAmountByEpochsRangeOf',
    args: [address, startEpoch, endEpoch],
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

  return lendedAmount*/
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

  // TODO: use assets above when test tokens will be removed
  const rates = useRates(
    settings.assets
      .filter(({ symbol }) => !symbol.includes('TST'))
      .filter(({ borrowingManagerClaimEnabled }) => borrowingManagerClaimEnabled)
      .map(({ symbolPrice }) => symbolPrice), // TODO: remove TST check
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

          let rate = rates ? rates[asset.symbolPrice] : null

          let countervalue = null

          // TODO remove it
          if (asset.symbol === 'TST1') {
            rate = 0.18
          }
          // TODO remove it
          if (asset.symbol === 'TST2') {
            rate = 2.34
          }

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

          let rate = rates ? rates[_asset.symbolPrice] : null

          let countervalue = null

          // TODO remove it
          if (_asset.symbol === 'TST1') {
            rate = 0.18
          }
          // TODO remove it
          if (_asset.symbol === 'TST2') {
            rate = 2.34
          }

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
  // const { value: startEpoch } = useAccountLoanStartEpoch()
  // const { value: endEpoch } = useAccountLoanEndEpoch()
  const { currentEpoch, epochDuration, startFirstEpochTimestamp } = useEpochs()
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
        address: settings.contracts.stakingManager,
        abi: StakingManagerABI,
        functionName: 'addressStakeLocks',
        args: [address, 0],
        enabled: address && _startEpoch && _endEpoch
      },
      {
        address: settings.contracts.borrowingManager,
        abi: BorrowingManagerABI,
        functionName: 'totalWeightByEpochsRange',
        args: [_startEpoch, _endEpoch],
        enabled: _startEpoch && _endEpoch
      },
      {
        address: settings.contracts.borrowingManager,
        abi: BorrowingManagerABI,
        functionName: 'weightByEpochsRangeOf',
        args: [address, _startEpoch, _endEpoch],
        enabled: _startEpoch && _endEpoch
      }
    ]
  })

  const lock = useMemo(() => (data ? data[0] : []), [data])
  const totalWeights = useMemo(() => (data ? data[1] : []), [data])
  const userWeights = useMemo(() => (data ? data[2] : []), [data])

  const { startEpoch, endEpoch, resetEpochs } = useMemo(() => {
    const lockDate = BigNumber(lock?.lockDate?.toString())
    const lockDuration = BigNumber(lock?.duration?.toString())

    const lockTime = BigNumber(duration).multipliedBy(SECONDS_IN_ONE_DAY)

    const stakeEpoch = lockDate.minus(startFirstEpochTimestamp).dividedToIntegerBy(epochDuration)
    const oldStartEpoch = stakeEpoch.plus(1)
    const oldEndEpoch = stakeEpoch
      .plus(lockDate.plus(lockDuration).minus(startFirstEpochTimestamp).dividedToIntegerBy(epochDuration))
      .minus(1)
    const newStartEpoch = BigNumber(currentEpoch).plus(1)
    const newEndEpoch = BigNumber(currentEpoch).plus(lockTime.dividedToIntegerBy(epochDuration)).minus(1)

    let startEpoch = BigNumber(currentEpoch).plus(1)
    let endEpoch = lockTime.dividedToIntegerBy(epochDuration)
    let resetEpochs = null

    if (newStartEpoch.isLessThanOrEqualTo(oldEndEpoch) && newEndEpoch.isLessThanOrEqualTo(oldEndEpoch)) {
      startEpoch = oldStartEpoch
      endEpoch = oldEndEpoch
      resetEpochs = [startEpoch.toNumber(), endEpoch.toNumber()]
    }

    if (newStartEpoch.isLessThanOrEqualTo(oldEndEpoch) && newEndEpoch.isGreaterThan(oldEndEpoch)) {
      startEpoch = oldStartEpoch
      endEpoch = newEndEpoch
      resetEpochs = [oldStartEpoch.toNumber(), oldEndEpoch.toNumber()]
    }

    return { startEpoch: startEpoch.toNumber(), endEpoch: endEpoch.toNumber(), resetEpochs }
  }, [lock, currentEpoch, duration, epochDuration, startFirstEpochTimestamp])

  const apy = useMemo(() => {
    if (!totalWeights || !userWeights) return BigNumber()
    if (BigNumber(amount).isEqualTo(0)) return BigNumber()
    if (endEpoch - startEpoch <= 0) return BigNumber(0)

    const lockAmount = BigNumber(lock?.amount?.toString())
    const mr = 150 // total revenues per epoch

    const poolRevenues = []
    let totalUserRevenues = new BigNumber(0)

    const totalWeightsWithReset = totalWeights.slice().map((_val) => BigNumber(_val))
    if (resetEpochs) {
      for (let epoch = resetEpochs[0]; epoch <= resetEpochs[1]; epoch++) {
        if (totalWeightsWithReset[epoch].isGreaterThan(0)) {
          totalWeightsWithReset[epoch] = totalWeightsWithReset[epoch].minus(userWeights[epoch])
        }
      }
    }

    for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
      poolRevenues[epoch] = BigNumber(mr).multipliedBy(0.5) // getPoolRevenuesForEpoch(epoca, mr) total in dollar of the interests earned by the BorrowingManager

      const userWeight = BigNumber(amount)
        .plus(BigNumber(lockAmount).dividedToIntegerBy(10 ** 18))
        .multipliedBy(endEpoch - epoch + 1)

      totalWeightsWithReset[epoch] = totalWeightsWithReset[epoch]
        ? totalWeightsWithReset[epoch].plus(userWeight)
        : userWeight

      const userWeightPercentage =
        !totalWeightsWithReset[epoch] || totalWeightsWithReset[epoch].isEqualTo(0)
          ? 1
          : userWeight.dividedBy(totalWeightsWithReset[epoch])

      const userEpochRevenues = poolRevenues[epoch].multipliedBy(userWeightPercentage)
      totalUserRevenues = totalUserRevenues.plus(userEpochRevenues)
    }

    const totalUserRevenuesAnnualized = totalUserRevenues.multipliedBy(24).dividedBy(endEpoch - startEpoch + 1)

    return BigNumber(totalUserRevenuesAnnualized).dividedBy(BigNumber(amount).multipliedBy(pntUsd))
  }, [amount, pntUsd, totalWeights, startEpoch, endEpoch, resetEpochs, userWeights, lock])

  return {
    setAmount,
    setDuration,
    apy: apy.toFixed(),
    formattedApy: !apy.isNaN() ? `${apy.toFixed(2)}%` : '-',
    startEpoch,
    endEpoch,
    formattedStartEpoch: startEpoch || startEpoch === 0 ? `#${startEpoch}` : '-',
    formattedEndEpoch: endEpoch || endEpoch === 0 ? `#${endEpoch}` : '-'
  }
}

export {
  useAccountLendedAmountByStartAndEndLoanEpochs,
  useAccountLendedAmountInTheCurrentEpoch,
  useAccountLendedAmountInTheNextEpochOf,
  useAccountLoanEndEpoch,
  useAccountLoanStartEpoch,
  useAccountUtilizationRatio,
  useClaimableInterestsAssetsByAssets,
  useClaimableInterestsAssetsByEpochs,
  useClaimInterestByEpoch,
  useLend,
  //useTotalAssetInterestAmountByEpoch,
  useTotalBorrowedAmountByEpoch,
  useTotalLendedAmountByEpoch,
  useTotalLendedAmountByStartAndEndEpochs,
  useUtilizationRatio,
  useUtilizationRatioInTheCurrentEpoch,
  useEstimateApy
}
