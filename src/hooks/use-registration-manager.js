import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import {
  erc20ABI,
  useAccount,
  useBalance,
  useChainId,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction
} from 'wagmi'
import { mainnet, polygon } from 'wagmi/chains'

import settings from '../settings'
import BorrowingManagerABI from '../utils/abis/BorrowingManager.json'
import PTokensVaultABI from '../utils/abis/PTokensVault.json'
import RegistrationManagerABI from '../utils/abis/RegistrationManager.json'
import { slicer } from '../utils/address'
import { isValidHexString } from '../utils/format'
import { getNickname } from '../utils/nicknames'
import { range, SECONDS_IN_ONE_HOUR } from '../utils/time'
import { useEpochs } from './use-epochs'
import { useFeesDistributionByMonthlyRevenues } from './use-fees-manager'
import { getForwarderUpdateSentinelRegistrationByStakingUserData } from '../utils/forwarder'

const kind = {
  1: 'Staking',
  2: 'Borrowing'
}

const useRegisterSentinel = ({ type = 'stake' }) => {
  const [amount, setAmount] = useState('0')
  const [signature, setSignature] = useState('')
  const [approved, setApproved] = useState(false)
  const [epochs, setEpochs] = useState(0)
  const { address } = useAccount()
  const { currentEpochEndsIn, epochDuration } = useEpochs()
  const activeChainId = useChainId()

  const mainnetNetwork = useSwitchNetwork({
    chainId: mainnet.id
  })
  const polygonNetwork = useSwitchNetwork({
    chainId: polygon.id
  })

  const { data: pntBalanceData } = useBalance({
    token: settings.contracts.pntOnPolygon,
    address,
    chainId: polygon.id
  })

  const onChainAmount = useMemo(
    () => (amount.toString().length > 0 ? ethers.utils.parseEther(amount.toString()) : ethers.BigNumber.from('0')),
    [amount]
  )

  const { data: allowance } = useContractRead({
    address: settings.contracts.pntOnPolygon,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, settings.contracts.registrationManager],
    chainId: polygon.id
  })

  const approveEnabled = useMemo(
    () => onChainAmount.gt(0) && !approved && type === 'stake',
    [onChainAmount, approved, type]
  )

  const { config: approveConfigs } = usePrepareContractWrite({
    address: settings.contracts.pntOnEthereum,
    abi: erc20ABI,
    functionName: 'approve',
    args: [settings.contracts.pTokensVault, onChainAmount],
    enabled: approveEnabled,
    chainId: mainnet.id
  })
  const { write: approve, error: approveError, data: approveData } = useContractWrite(approveConfigs)

  const lockTime = useMemo(
    () =>
      currentEpochEndsIn && epochs && type === 'stake'
        ? currentEpochEndsIn + epochs * epochDuration + SECONDS_IN_ONE_HOUR
        : null,
    [currentEpochEndsIn, epochs, epochDuration, type]
  )

  const isSignatureValid = useMemo(() => isValidHexString(signature), [signature])
  const updateSentinelRegistrationByStakingEnabled = useMemo(
    () =>
      onChainAmount.gt(ethers.utils.parseEther('0')) &&
      approved &&
      pntBalanceData &&
      onChainAmount.lte(pntBalanceData.value) &&
      lockTime &&
      lockTime >= settings.stakingManager.minStakeSeconds &&
      isSignatureValid &&
      type === 'stake',
    [onChainAmount, approved, lockTime, pntBalanceData, isSignatureValid, type]
  )

  const peginData = useMemo(
    () =>
      onChainAmount && lockTime && address && isSignatureValid
        ? getForwarderUpdateSentinelRegistrationByStakingUserData({
            amount: onChainAmount,
            duration: lockTime,
            pntOnPolygonAddress: settings.contracts.pntOnPolygon,
            ownerAddress: address,
            registrationManagerAddress: settings.contracts.registrationManager,
            signature
          })
        : '0x',
    [onChainAmount, lockTime, address, signature, isSignatureValid]
  )

  const { config: updateSentinelRegistrationByStakingConfigs } = usePrepareContractWrite({
    address: settings.contracts.pTokensVault,
    abi: PTokensVaultABI,
    functionName: 'pegIn',
    args: [
      onChainAmount,
      settings.contracts.pntOnEthereum,
      settings.contracts.forwarderOnPolygon,
      peginData,
      '0x0075dd4c'
    ],
    enabled: updateSentinelRegistrationByStakingEnabled,
    chainId: mainnet.id
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
    () => epochs >= 1 && isSignatureValid && type === 'borrow',
    [epochs, isSignatureValid, type]
  )
  const { config: updateSentinelRegistrationByBorrowingConfigs } = usePrepareContractWrite({
    address: settings.contracts.registrationManager,
    abi: RegistrationManagerABI,
    functionName: 'updateSentinelRegistrationByBorrowing',
    args: [epochs, isSignatureValid ? signature : '0x'],
    enabled: updateSentinelRegistrationByBorrowingEnabled,
    chainId: polygon.id
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
    approve: activeChainId !== mainnet.id && mainnetNetwork.switchNetwork ? mainnetNetwork.switchNetwork : approve,
    approved,
    approveData,
    approveEnabled,
    approveError,
    lockTime,
    epochs,
    isApproving,
    isUpdatingSentinelRegistrationByBorrowing,
    isUpdatingSentinelRegistrationByStaking,
    setAmount,
    setApproved,
    setEpochs,
    setSignature,
    signature,
    updateSentinelRegistrationByBorrowing:
      activeChainId !== polygon.id && polygonNetwork.switchNetwork
        ? polygonNetwork.switchNetwork
        : updateSentinelRegistrationByBorrowing,
    updateSentinelRegistrationByBorrowingData,
    updateSentinelRegistrationByBorrowingEnabled,
    updateSentinelRegistrationByBorrowingError,
    updateSentinelRegistrationByStaking:
      activeChainId !== mainnet.id && mainnetNetwork.switchNetwork
        ? mainnetNetwork.switchNetwork
        : updateSentinelRegistrationByStaking,
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
    enabled: address,
    watch: true,
    chainId: polygon.id
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
    enabled: sentinelAddress,
    chainId: polygon.id
  })

  return {
    endEpoch: sentinelRegistrationData?.endEpoch,
    formattedSentinelAddress: sentinelAddress ? slicer(sentinelAddress) : '-',
    formattedKind: sentinelRegistrationData ? kind[sentinelRegistrationData.kind] : '-',
    kind: sentinelRegistrationData?.kind,
    sentinelAddress,
    sentinelNickname: sentinelAddress ? getNickname(sentinelAddress) : '-',
    startEpoch: sentinelRegistrationData?.startEpoch
  }
}

const useBorrowingSentinelProspectus = () => {
  const { currentEpoch } = useEpochs()
  const [epochs, setEpochs] = useState(0)
  const { startEpoch: currentStartEpoch = 0, endEpoch: currentEndEpoch = 0 } = useSentinel()

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
        enabled: (_startEpoch || _startEpoch === 0) && (_endEpoch || _endEpoch === 0),
        chainId: polygon.id
      }
    ]
  })

  const borrowedAmount = settings.registrationManager.borrowAmount
  const totalBorrowedAmountInEpoch = useMemo(() => (data && data[0] ? data[0] : []), [data])

  const { startEpoch, endEpoch } = useMemo(() => {
    if (!currentEpoch && currentEpoch !== 0) {
      return {
        startEpoch: null,
        endEpoch: null
      }
    }

    let startEpoch = currentEpoch >= currentEndEpoch ? currentEpoch + 1 : currentEndEpoch + 1
    startEpoch = currentEpoch >= currentEndEpoch ? currentEpoch + 1 : currentEndEpoch
    const endEpoch = startEpoch + epochs - (currentEpoch >= currentEndEpoch ? 1 : 0)

    return {
      endEpoch,
      startEpoch: currentEpoch >= currentEndEpoch ? currentEpoch + 1 : currentStartEpoch
    }
  }, [currentEpoch, epochs, currentEndEpoch, currentStartEpoch])

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
      (startEpoch || startEpoch === 0) && endEpoch
        ? range(startEpoch, endEpoch + 1).map((_, _index) => {
            const borrowingSentinelsFeesAmount =
              feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[_index]
                ? feeDistributionByMonthlyRevenues[_index].borrowingSentinelsFeesAmount
                : BigNumber(0)

            const numberOfSentinels = numberOfSentinelsInEpoch[_index]
            const borrowingFeePercentage =
              !numberOfSentinels || numberOfSentinels.isNaN() || numberOfSentinels.isEqualTo(0)
                ? new BigNumber(1)
                : BigNumber(1).dividedBy(numberOfSentinels)

            return borrowingSentinelsFeesAmount.multipliedBy(borrowingFeePercentage).toFixed()
          })
        : [],
    [numberOfSentinelsInEpoch, feeDistributionByMonthlyRevenues, endEpoch, startEpoch]
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
