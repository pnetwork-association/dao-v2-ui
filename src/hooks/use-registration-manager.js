import { useMemo, useState, useEffect } from 'react'
import {
  useAccount,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useBalance,
  erc20ABI
} from 'wagmi'
import { ethers } from 'ethers'

import settings from '../settings'
import RegistrationManagerABI from '../utils/abis/RegistrationManager.json'
import { SECONDS_IN_ONE_DAY } from '../utils/time'
import { slicer } from '../utils/address'
import { useEpochs } from './use-epochs'
import { isValidHexString } from '../utils/format'

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
      onChainAmount.gt(ethers.utils.parseEther('0')) && // TODO: set settings.borrowingManager.minBorrowAmount
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
    () =>
      onChainAmount.gt(ethers.utils.parseEther('0')) && // TODO: set 200000
      epochs >= 1 &&
      isSignatureValid,
    [onChainAmount, epochs, isSignatureValid]
  )
  const { config: updateSentinelRegistrationByBorrowingConfigs } = usePrepareContractWrite({
    address: settings.contracts.registrationManager,
    abi: RegistrationManagerABI,
    functionName: 'updateSentinelRegistrationByBorrowing',
    args: [onChainAmount, epochs, isSignatureValid ? signature : '0x'],
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

export { useRegisterSentinel, useSentinel }
