import { useMemo, useState, useEffect } from 'react'
import {
  erc20ABI,
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { groupBy } from 'lodash'

import settings from '../settings'
import BorrowingManagerABI from '../utils/abis/BorrowingManager.json'
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

  const { data } = useContractRead({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'loanEndEpochOf',
    args: [address]
  })

  return {
    formattedValue: data || data?.toNumber() === 0 ? `#${data.toNumber()}` : '-',
    value: data ? data.toNumber() : null
  }
}

const useAccountLoanStartEpoch = () => {
  const { address } = useAccount()

  const { data } = useContractRead({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'loanStartEpochOf',
    args: [address]
  })

  return {
    formattedValue: data || data?.toNumber() === 0 ? `#${data.toNumber()}` : '-',
    value: data ? data.toNumber() : 0
  }
}

const useAccountLendedAmountByEpoch = (_epoch) => {
  const { address } = useAccount()

  const { data } = useContractRead({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
    functionName: 'lendedAmountByEpochOf',
    args: [address, _epoch]
  })

  const amount = useMemo(() => (data ? BigNumber(data.toString()).dividedBy(10 ** 18) : BigNumber(null)), [data])

  return {
    value: amount.toFixed(),
    formattedValue: formatAssetAmount(amount, 'PNT')
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
  const { address } = useAccount()
  const { value: startEpoch } = useAccountLoanStartEpoch()
  const { value: endEpoch } = useAccountLoanEndEpoch()

  const { data } = useContractRead({
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

  return lendedAmount
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
  useUtilizationRatioInTheCurrentEpoch
}
