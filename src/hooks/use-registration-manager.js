import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
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
import RegistrationManagerABI from '../utils/abis/RegistrationManager.json'
import { slicer } from '../utils/address'
import { isValidHexString } from '../utils/format'
import { range, SECONDS_IN_ONE_DAY } from '../utils/time'
import { useEpochs } from './use-epochs'
import { useFeesDistributionByMonthlyRevenues } from './use-fees-manager'

const kind = {
  1: 'Staking',
  2: 'Borrowing'
}

const useRegisterSentinel = () => {
  const [type, setType] = useState('stake')
  const [amount, setAmount] = useState('0')
  const [signature, setSignature] = useState('')
  const [approved, setApproved] = useState(false)
  const [epochs, setEpochs] = useState(0)
  const { address } = useAccount()
  const { currentEpochEndsIn, epochDuration } = useEpochs()

  const { data: pntBalanceData } = useBalance({
    token: settings.contracts.pnt,
    address
  })

  const onChainAmount = useMemo(
    () => (amount.toString().length > 0 ? ethers.utils.parseEther(amount.toString()) : ethers.BigNumber.from('0')),
    [amount]
  )

  const { data: allowance } = useContractRead({
    address: settings.contracts.pnt,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, settings.contracts.registrationManager]
  })

  const approveEnabled = useMemo(
    () => onChainAmount.gt(0) && !approved && type === 'stake',
    [onChainAmount, approved, type]
  )
  const { config: approveConfigs } = usePrepareContractWrite({
    address: settings.contracts.pnt,
    abi: erc20ABI,
    functionName: 'approve',
    args: [settings.contracts.registrationManager, onChainAmount],
    enabled: approveEnabled
  })
  const { write: approve, error: approveError, data: approveData } = useContractWrite(approveConfigs)

  const duration = useMemo(
    () => (currentEpochEndsIn && epochs && type === 'stake' ? currentEpochEndsIn + epochs * epochDuration : null),
    [currentEpochEndsIn, epochs, epochDuration, type]
  )

  const isSignatureValid = useMemo(() => isValidHexString(signature), [signature])

  const updateSentinelRegistrationByStakingEnabled = useMemo(
    () =>
      onChainAmount.gt(ethers.utils.parseEther('0')) &&
      approved &&
      pntBalanceData &&
      onChainAmount.lte(pntBalanceData.value) &&
      duration &&
      duration >= settings.stakingManager.minStakeDays &&
      isSignatureValid,
    [onChainAmount, approved, duration, pntBalanceData, isSignatureValid]
  )
  const { config: updateSentinelRegistrationByStakingConfigs } = usePrepareContractWrite({
    address: settings.contracts.registrationManager,
    abi: RegistrationManagerABI,
    functionName: 'updateSentinelRegistrationByStaking',
    args: [onChainAmount, duration * SECONDS_IN_ONE_DAY, isSignatureValid ? signature : '0x'],
    enabled: updateSentinelRegistrationByStakingEnabled
  })
  const {
    write: updateSentinelRegistrationByStaking,
    error: updateSentinelRegistrationByStakingError,
    data: updateSentinelRegistrationByStakingData
  } = useContractWrite(updateSentinelRegistrationByStakingConfigs)

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash
  })

  const { isLoading: isUpdatingSentinelRegistrationByStaking } = useWaitForTransaction({
    hash: updateSentinelRegistrationByStakingData?.hash
  })

  const updateSentinelRegistrationByBorrowingEnabled = useMemo(
    () => epochs >= 1 && isSignatureValid,
    [epochs, isSignatureValid]
  )
  const { config: updateSentinelRegistrationByBorrowingConfigs } = usePrepareContractWrite({
    address: settings.contracts.registrationManager,
    abi: RegistrationManagerABI,
    functionName: 'updateSentinelRegistrationByBorrowing',
    args: [epochs, isSignatureValid ? signature : '0x'],
    enabled: updateSentinelRegistrationByBorrowingEnabled
  })
  const {
    write: updateSentinelRegistrationByBorrowing,
    error: updateSentinelRegistrationByBorrowingError,
    data: updateSentinelRegistrationByBorrowingData
  } = useContractWrite(updateSentinelRegistrationByBorrowingConfigs)

  const { isLoading: isUpdatingSentinelRegistrationByBorrowing } = useWaitForTransaction({
    hash: updateSentinelRegistrationByBorrowingData?.hash
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
    if (updateSentinelRegistrationByStakingData) {
      updateSentinelRegistrationByStakingData.wait(1).then(() => {
        setAmount(0)
      })
    }
  }, [updateSentinelRegistrationByStakingData, setAmount])

  useEffect(() => {
    if (updateSentinelRegistrationByBorrowingData) {
      updateSentinelRegistrationByBorrowingData.wait(1).then(() => {
        setAmount(0)
      })
    }
  }, [updateSentinelRegistrationByBorrowingData, setAmount])

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
    isUpdatingSentinelRegistrationByBorrowing,
    isUpdatingSentinelRegistrationByStaking,
    setAmount,
    setApproved,
    setEpochs,
    setSignature,
    setType,
    signature,
    type,
    updateSentinelRegistrationByBorrowing,
    updateSentinelRegistrationByBorrowingData,
    updateSentinelRegistrationByBorrowingEnabled,
    updateSentinelRegistrationByBorrowingError,
    updateSentinelRegistrationByStaking,
    updateSentinelRegistrationByStakingData,
    updateSentinelRegistrationByStakingEnabled,
    updateSentinelRegistrationByStakingError
  }
}

const useSentinel = () => {
  const { address } = useAccount()

  const { data: sentinelAddressData } = useContractRead({
    address: settings.contracts.registrationManager,
    abi: RegistrationManagerABI,
    functionName: 'sentinelOf',
    args: [address],
    enabled: address
  })

  const sentinelAddress =
    sentinelAddressData && sentinelAddressData !== '0x0000000000000000000000000000000000000000'
      ? ethers.utils.getAddress(sentinelAddressData)
      : null

  const { data: sentinelRegistrationData } = useContractRead({
    address: settings.contracts.registrationManager,
    abi: RegistrationManagerABI,
    functionName: 'sentinelRegistration',
    args: [sentinelAddress],
    enabled: sentinelAddress
  })

  return {
    endEpoch: sentinelRegistrationData?.endEpoch.toNumber(),
    formattedSentinelAddress: sentinelAddress ? slicer(sentinelAddress) : '-',
    kind: sentinelRegistrationData ? kind[sentinelRegistrationData.kind] : '-',
    sentinelAddress: sentinelAddress || '-',
    startEpoch: sentinelRegistrationData?.startEpoch.toNumber()
  }
}

const useBorrowingSentinelProspectus = () => {
  const { currentEpoch } = useEpochs()
  const [epochs, setEpochs] = useState(0)

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
        functionName: 'totalBorrowedAmountByEpochsRange',
        args: [_startEpoch, _endEpoch],
        enabled: (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0)
      }
    ]
  })

  const borrowedAmount = settings.registrationManager.borrowAmount
  const totalBorrowedAmountInEpoch = useMemo(() => (data && data[0] ? data[0] : []), [data])

  const { startEpoch, endEpoch } = useMemo(() => {
    // TODO: handle previous registration
    return {
      startEpoch: currentEpoch + 1,
      endEpoch: currentEpoch + 1 + epochs
    }
  }, [currentEpoch, epochs])

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    startEpoch,
    endEpoch,
    mr: 300
  })

  // NOTE: onchain borrowed amount has no decimals
  const numberOfSentinelsInEpoch = useMemo(() => {
    return totalBorrowedAmountInEpoch.map((_val) => BigNumber(_val.toString()).dividedBy(borrowedAmount))
  }, [totalBorrowedAmountInEpoch, borrowedAmount])

  const epochsRevenues = useMemo(
    () =>
      range(currentEpoch + 1, currentEpoch + epochs + 1).map((_epoch) => {
        const sentinelsBorrowingFeesAmount =
          feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[_epoch]
            ? feeDistributionByMonthlyRevenues[_epoch].sentinelsBorrowingFeesAmount
            : BigNumber(0)
        const numberOfSentinels = numberOfSentinelsInEpoch[_epoch]
        const borrowingFeePercentage =
          !numberOfSentinels || numberOfSentinels.isNaN() || numberOfSentinels.isEqualTo(0)
            ? new BigNumber(1)
            : BigNumber(1).dividedBy(numberOfSentinels)

        return sentinelsBorrowingFeesAmount.multipliedBy(borrowingFeePercentage).toFixed()
      }),
    [currentEpoch, epochs, numberOfSentinelsInEpoch, feeDistributionByMonthlyRevenues]
  )

  return {
    endEpoch,
    epochs,
    epochsRevenues,
    setEpochs,
    startEpoch
  }
}

export { useBorrowingSentinelProspectus, useRegisterSentinel, useSentinel }
