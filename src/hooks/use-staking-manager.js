import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import {
  erc20ABI,
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'
import axios from 'axios'

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
  const { write: stake, error: stakeError, data: stakeData, status: stakeStatus } = useContractWrite(stakeConfigs)

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
    stakeStatus,
    stakeData,
    stakeEnabled,
    stakeError
  }
}

const useUnstake = () => {
  const [amount, setAmount] = useState('0')
  const { availableToUnstakePntAmount } = useUserStake()

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
  const {
    write: unstake,
    error: unstakeError,
    data: unstakeData,
    status: unstakeStatus
  } = useContractWrite(unstakeConfigs)

  const { isLoading: isUnstaking } = useWaitForTransaction({
    hash: unstakeData?.hash
  })

  return {
    amount,
    isUnstaking,
    setAmount,
    unstake,
    unstakeData,
    unstakeError,
    unstakeStatus
  }
}

const useUserStake = () => {
  const { address } = useAccount()

  const { data, status } = useContractRead({
    address: settings.contracts.stakingManager,
    abi: StakingManagerABI,
    functionName: 'getStakedLocks',
    args: [address],
    enabled: address,
    watch: true
  })

  const locks = useMemo(() => {
    return data
      ? data.map(({ amount, duration, lockDate }) => ({
          amount,
          duration,
          lockDate
        }))
      : []
  }, [data])

  const unstakeableLocks = useMemo(
    () => locks.filter(({ lockDate, duration }) => lockDate.add(duration).lt(moment().unix())),
    [locks]
  )

  const availableToUnstakePntAmount = useMemo(
    () =>
      unstakeableLocks.reduce((_acc, { amount }) => {
        _acc = _acc.add(amount)
        return _acc
      }, ethers.BigNumber.from('0')),
    [unstakeableLocks]
  )

  const offchainUnstekableAmount = useMemo(
    () => BigNumber(availableToUnstakePntAmount.toString()).dividedBy(10 ** 18),
    [availableToUnstakePntAmount]
  )

  return {
    availableToUnstakePntAmount: offchainUnstekableAmount,
    fomattedAvailableToUnstakePntAmount: formatAssetAmount(offchainUnstekableAmount.toFixed(), 'PNT'),
    status: status
  }
}

const useHistoricalDaoPntTotalSupply = () => {
  const [historicalDaoPntTotalSupply, setHistoricalDaoPntTotalSupply] = useState({})

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(
          `https://pnetwork.watch:443/api/datasources/proxy/1/query?db=pnetwork-volumes-1&q=SELECT%20%22daopnt_supply_sum%22%20FROM%20%22daopnt_supply_sum%22%20WHERE%20time%20%3E%3D%20now()%20-%2090d%20and%20time%20%3C%3D%20now()%3BSELECT%20%22daopnt_supply%22%20FROM%20%22daopnt_supply%22%20WHERE%20(%22chain%22%20%3D%20%27eth%27)%20AND%20time%20%3E%3D%20now()%20-%2090d%20and%20time%20%3C%3D%20now()%3BSELECT%20%22daopnt_supply%22%20FROM%20%22daopnt_supply%22%20WHERE%20(%22chain%22%20%3D%20%27bsc%27)%20AND%20time%20%3E%3D%20now()%20-%2090d%20and%20time%20%3C%3D%20now()&epoch=ms`
        )

        const daoPntTotalSupply = data.results[0].series[0].values
        setHistoricalDaoPntTotalSupply({
          daoPntTotalSupply: daoPntTotalSupply.sort((_a, _b) => _a[0] - _b[0])
        })
      } catch (_err) {
        console.error(_err.message)
      }
    }

    fetch()
  }, [])

  return historicalDaoPntTotalSupply
}

export { useHistoricalDaoPntTotalSupply, useStake, useUnstake, useUserStake }
