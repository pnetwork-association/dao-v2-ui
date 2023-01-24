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
import moment from 'moment'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'

import settings from '../settings'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import { formatAssetAmount } from '../utils/amount'
import { SECONDS_IN_ONE_DAY } from '../utils/time'

const useStake = () => {
  const [approved, setApproved] = useState(false)
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('0')
  const [duration, setDuration] = useState(settings.stakingManager.minStakeDays)
  const { address } = useAccount()

  const { data: pntBalanceData } = useBalance({
    token: settings.contracts.pnt,
    address
  })

  const { data: allowance } = useContractRead({
    address: settings.contracts.pnt,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, settings.contracts.stakingManager]
  })

  const onChainAmount = useMemo(
    () => (amount.length > 0 ? ethers.utils.parseEther(amount) : ethers.BigNumber.from('0')),
    [amount]
  )

  const approveEnabled = useMemo(() => onChainAmount.gt(0) && !approved, [onChainAmount, approved])
  const { config: approveConfigs } = usePrepareContractWrite({
    address: settings.contracts.pnt,
    abi: erc20ABI,
    functionName: 'approve',
    args: [settings.contracts.stakingManager, onChainAmount],
    enabled: approveEnabled
  })
  const { write: approve, error: approveError, data: approveData } = useContractWrite(approveConfigs)

  const stakeEnabled = useMemo(
    () =>
      onChainAmount.gt(0) &&
      approved &&
      onChainAmount.lte(pntBalanceData.value) &&
      duration >= settings.stakingManager.minStakeDays,
    [onChainAmount, approved, pntBalanceData, duration]
  )
  const { config: stakeConfigs } = usePrepareContractWrite({
    address: settings.contracts.stakingManager,
    abi: StakingManagerABI,
    functionName: 'stake',
    args: [onChainAmount, duration * SECONDS_IN_ONE_DAY, receiver],
    enabled: stakeEnabled
  })
  const { write: stake, error: stakeError, data: stakeData } = useContractWrite(stakeConfigs)

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash
  })

  const { isLoading: isStaking } = useWaitForTransaction({
    hash: stakeData?.hash
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
    if (stakeData) {
      stakeData.wait(1).then(() => {
        setAmount('0')
      })
    }
  }, [stakeData, setAmount])

  useEffect(() => {
    setReceiver(address)
  }, [address, setReceiver])

  return {
    allowance,
    amount,
    approve,
    approved,
    approveData,
    approveEnabled,
    approveError,
    duration,
    isApproving,
    isStaking,
    receiver,
    setAmount,
    setApproved,
    setDuration,
    setReceiver,
    stake,
    stakeData,
    stakeEnabled,
    stakeError
  }
}

const useUnstake = () => {
  const [amount, setAmount] = useState('0')
  const { availableToUnstakePntAmount } = useLocks()

  const onChainAmount = useMemo(
    () => (amount.length > 0 ? ethers.utils.parseEther(amount) : ethers.BigNumber.from('0')),
    [amount]
  )

  const { config: unstakeConfigs } = usePrepareContractWrite({
    address: settings.contracts.stakingManager,
    abi: StakingManagerABI,
    functionName: 'unstake',
    args: [onChainAmount],
    enabled: BigNumber(amount).isGreaterThan(0) && BigNumber(amount).isLessThanOrEqualTo(availableToUnstakePntAmount)
  })
  const { write: unstake, error: unstakeError, data: unstakeData } = useContractWrite(unstakeConfigs)

  const { isLoading: isUnstaking } = useWaitForTransaction({
    hash: unstakeData?.hash
  })

  return {
    amount,
    isUnstaking,
    setAmount,
    unstake,
    unstakeData,
    unstakeError
  }
}

const useLocks = () => {
  const { address } = useAccount()

  const { data } = useContractRead({
    address: settings.contracts.stakingManager,
    abi: StakingManagerABI,
    functionName: 'stakeOf',
    args: [address],
    enabled: address
  })

  const availableToUnstakePntAmount = useMemo(() => {
    if (!data) return

    const { endDate, amount } = data

    return BigNumber(endDate.toNumber() >= moment().unix() ? amount.toString() : 0).dividedBy(10 ** 18)
  }, [data])

  return {
    availableToUnstakePntAmount,
    fomattedAvailableToUnstakePntAmount: formatAssetAmount(availableToUnstakePntAmount, 'PNT')
  }
}

export { useStake, useLocks, useUnstake }
