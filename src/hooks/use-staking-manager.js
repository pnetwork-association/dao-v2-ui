import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import {
  useAccount,
  useBalance,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction
} from 'wagmi'
import { polygon } from 'wagmi/chains'
import axios from 'axios'

import settings from '../settings'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import { formatAssetAmount } from '../utils/amount'
import { SECONDS_IN_ONE_DAY } from '../utils/time'
import {
  prepareContractReadAllowanceApproveStake,
  prepareContractWriteStake,
  prepareContractWriteApproveStake
} from '../utils/preparers/staking-manager'
import { getPntAddressByChainId } from '../utils/preparers/balance'

const useStake = () => {
  const [approved, setApproved] = useState(false)
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('0')
  const [duration, setDuration] = useState(settings.stakingManager.minStakeDays)
  const { address } = useAccount()
  const activeChainId = useChainId()

  const { data: pntBalanceData } = useBalance({
    token: getPntAddressByChainId(activeChainId),
    address
  })

  const { data: allowance } = useContractRead(prepareContractReadAllowanceApproveStake({ activeChainId, address }))

  const onChainAmount = useMemo(
    () => (amount.length > 0 ? ethers.utils.parseEther(amount) : ethers.BigNumber.from('0')),
    [amount]
  )

  const approveEnabled = useMemo(() => onChainAmount.gt(0) && !approved, [onChainAmount, approved])
  const { config: approveConfigs } = usePrepareContractWrite(
    prepareContractWriteApproveStake({ activeChainId, amount: onChainAmount, enabled: approveEnabled })
  )
  const { write: approve, error: approveError, data: approveData } = useContractWrite(approveConfigs)

  const stakeEnabled = useMemo(
    () =>
      onChainAmount.gt(0) &&
      approved &&
      onChainAmount.lte(pntBalanceData.value) &&
      duration >= settings.stakingManager.minStakeDays,
    [onChainAmount, approved, pntBalanceData, duration]
  )

  const { config: stakeConfigs } = usePrepareContractWrite(
    prepareContractWriteStake({
      activeChainId,
      amount: onChainAmount,
      duration: duration * SECONDS_IN_ONE_DAY,
      receiver,
      enabled: stakeEnabled
    })
  )
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
  const { availableToUnstakePntAmount } = useUserStake()
  const activeChainId = useChainId()
  const { switchNetwork } = useSwitchNetwork({ chainId: polygon.id })

  const onChainAmount = useMemo(
    () => (amount.length > 0 ? ethers.utils.parseEther(amount) : ethers.BigNumber.from('0')),
    [amount]
  )

  const { config: unstakeConfigs } = usePrepareContractWrite({
    address: settings.contracts.stakingManager,
    abi: StakingManagerABI,
    functionName: 'unstake',
    args: [onChainAmount],
    enabled: BigNumber(amount).isGreaterThan(0) && BigNumber(amount).isLessThanOrEqualTo(availableToUnstakePntAmount),
    chainId: polygon.id
  })
  const { write: unstake, error: unstakeError, data: unstakeData } = useContractWrite(unstakeConfigs)

  const { isLoading: isUnstaking } = useWaitForTransaction({
    hash: unstakeData?.hash
  })

  return {
    amount,
    isUnstaking,
    setAmount,
    unstake: activeChainId !== polygon.id && switchNetwork ? switchNetwork : unstake,
    unstakeData,
    unstakeError
  }
}

const useUserStake = () => {
  const { address } = useAccount()

  const { data } = useContractRead({
    address: settings.contracts.stakingManager,
    abi: StakingManagerABI,
    functionName: 'stakeOf',
    args: [address],
    enabled: address,
    watch: true,
    chainId: polygon.id
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
