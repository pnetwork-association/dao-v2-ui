import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
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
import { polygon } from 'wagmi/chains'

import settings from '../settings'
import LendingManagerABI from '../utils/abis/LendingManager.json'
import RegistrationManagerABI from '../utils/abis/RegistrationManager.json'
import { slicer } from '../utils/address'
import { isValidHexString } from '../utils/format'
import { getNickname } from '../utils/nicknames'
import { range, SECONDS_IN_ONE_HOUR } from '../utils/time'
import { useEpochs } from './use-epochs'
import { useFeesDistributionByMonthlyRevenues } from './use-fees-manager'
import {
  prepareContractReadAllowanceApproveUpdateSentinelRegistrationByStaking,
  prepareContractWriteApproveUpdateSentinelRegistrationByStaking,
  prepareContractWriteUpdateSentinelRegistrationByStaking,
  prepareContractWriteUpdateSentinelRegistrationByBorrowing,
  prepareContractWriteIncreaseStakingSentinelRegistrationDuration
} from '../utils/preparers/registration-manager'
import { getEthersOnChainAmount } from '../utils/amount'
import { useSentinelLastEpochReward } from './use-sentinels-historical-data'

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

  const { data: pntBalanceData } = useBalance({
    token: settings.contracts.pntOnPolygon,
    address,
    chainId: polygon.id
  })

  const onChainAmount = useMemo(() => getEthersOnChainAmount(amount), [amount])

  const { data: allowance, refetch: refetchAllowance } = useContractRead(
    prepareContractReadAllowanceApproveUpdateSentinelRegistrationByStaking({
      address,
      activeChainId
    })
  )

  const approveEnabled = useMemo(
    () => onChainAmount.gt(0) && !approved && type === 'stake',
    [onChainAmount, approved, type]
  )

  const { config: approveConfigs } = usePrepareContractWrite(
    prepareContractWriteApproveUpdateSentinelRegistrationByStaking({
      activeChainId,
      amount: onChainAmount,
      approveEnabled
    })
  )
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

  const { config: updateSentinelRegistrationByStakingConfigs } = usePrepareContractWrite(
    prepareContractWriteUpdateSentinelRegistrationByStaking({
      activeChainId,
      amount: onChainAmount,
      duration: lockTime,
      receiver: address,
      signature,
      enabled: updateSentinelRegistrationByStakingEnabled
    })
  )

  const {
    write: updateSentinelRegistrationByStaking,
    error: updateSentinelRegistrationByStakingError,
    data: updateSentinelRegistrationByStakingData
  } = useContractWrite(updateSentinelRegistrationByStakingConfigs)

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash,
    confirmations: 1
  })

  const { isLoading: isUpdatingSentinelRegistrationByStaking } = useWaitForTransaction({
    hash: updateSentinelRegistrationByStakingData?.hash,
    confirmations: 1
  })

  const updateSentinelRegistrationByBorrowingEnabled = useMemo(
    () => epochs >= 1 && isSignatureValid && type === 'borrow',
    [epochs, isSignatureValid, type]
  )
  const { config: updateSentinelRegistrationByBorrowingConfigs } = usePrepareContractWrite(
    prepareContractWriteUpdateSentinelRegistrationByBorrowing({
      activeChainId,
      numberOfEpochs: epochs,
      receiver: address,
      signature,
      enabled: updateSentinelRegistrationByBorrowingEnabled
    })
  )
  const {
    write: updateSentinelRegistrationByBorrowing,
    error: updateSentinelRegistrationByBorrowingError,
    data: updateSentinelRegistrationByBorrowingData
  } = useContractWrite(updateSentinelRegistrationByBorrowingConfigs)

  const { isLoading: isUpdatingSentinelRegistrationByBorrowing } = useWaitForTransaction({
    hash: updateSentinelRegistrationByBorrowingData?.hash,
    confirmations: 1
  })

  useEffect(() => {
    setApproved(allowance ? allowance.gte(onChainAmount) : false)
  }, [allowance, onChainAmount])

  useEffect(() => {
    if (approveData) {
      setApproved(true)
      refetchAllowance()
    }
  }, [approveData, setApproved, refetchAllowance])

  useEffect(() => {
    if (updateSentinelRegistrationByStakingData) {
      setEpochs(0)
      setAmount(0)
      setSignature('')
    }
  }, [updateSentinelRegistrationByStakingData])

  useEffect(() => {
    if (updateSentinelRegistrationByBorrowingData) {
      setEpochs(0)
      setAmount(0)
      setSignature('')
    }
  }, [updateSentinelRegistrationByBorrowingData])

  return {
    amount,
    approve,
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
    enabled: address,
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
  const { value: mr } = useSentinelLastEpochReward()

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

  const { data } = useContractReads({
    contracts: [
      {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'totalBorrowedAmountByEpochsRange',
        args: [startEpoch, endEpoch],
        enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0),
        chainId: polygon.id
      }
    ]
  })
  const borrowedAmount = settings.registrationManager.borrowAmount
  const totalBorrowedAmountInEpoch = useMemo(() => (data && data[0] ? data[0] : []), [data])

  const feeDistributionByMonthlyRevenues = useFeesDistributionByMonthlyRevenues({
    addBorrowAmountToBorrowedAmount: true,
    endEpoch,
    mr,
    startEpoch
  })

  // NOTE: onchain borrowed amount has no decimals
  const numberOfSentinelsInEpoch = useMemo(() => {
    return totalBorrowedAmountInEpoch.map((_val) => BigNumber(_val.toString()).dividedBy(borrowedAmount))
  }, [totalBorrowedAmountInEpoch, borrowedAmount])

  const epochsRevenues = useMemo(
    () =>
      (startEpoch || startEpoch === 0) && endEpoch
        ? range(startEpoch, endEpoch + 1).map((_epoch) => {
            const borrowingSentinelsRevenuesAmount =
              feeDistributionByMonthlyRevenues && feeDistributionByMonthlyRevenues[_epoch]
                ? feeDistributionByMonthlyRevenues[_epoch].borrowingSentinelsRevenuesAmount
                : BigNumber(0)

            const numberOfSentinels = numberOfSentinelsInEpoch[_epoch]
            const borrowingFeePercentage =
              !numberOfSentinels || BigNumber(numberOfSentinels).isNaN() || BigNumber(numberOfSentinels).isEqualTo(0)
                ? new BigNumber(1)
                : BigNumber(1).dividedBy(numberOfSentinels)

            return borrowingSentinelsRevenuesAmount.multipliedBy(borrowingFeePercentage).toFixed()
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

const useIncreaseStakingSentinelRegistrationDuration = () => {
  const { epochDuration } = useEpochs()
  const [epochs, setEpochs] = useState(0)
  const activeChainId = useChainId()

  const { config } = usePrepareContractWrite(
    prepareContractWriteIncreaseStakingSentinelRegistrationDuration({
      activeChainId,
      duration: epochs * epochDuration,
      enabled: epochs > 0
    })
  )
  const { write, error, data, isLoading } = useContractWrite(config)

  return {
    epochs,
    setEpochs,
    increaseStakingSentinelRegistrationDuration: write,
    increaseStakingSentinelRegistrationDurationData: data,
    increaseStakingSentinelRegistrationDurationError: error,
    increaseStakingSentinelRegistrationDurationLoading: isLoading
  }
}

const useEffectiveEpochsForSentinelRegistration = ({ type, epochs, currentEndEpoch }) => {
  const { currentEpoch } = useEpochs()
  return useMemo(() => {
    if (type === 'borrow') {
      if (!currentEpoch && currentEpoch !== 0) return { startEpoch: null, endEpoch: null }

      let startEpoch = currentEpoch >= currentEndEpoch ? currentEpoch + 1 : currentEndEpoch + 1
      startEpoch = currentEpoch >= currentEndEpoch ? startEpoch : currentEndEpoch

      const endEpoch = startEpoch + epochs - (currentEpoch >= currentEndEpoch ? 1 : 0)
      return { startEpoch, endEpoch }
    }

    if (type === 'stake') {
      return { startEpoch: currentEpoch + 1, endEpoch: currentEpoch + epochs }
    }
  }, [type, currentEpoch, currentEndEpoch, epochs])
}

export {
  useBorrowingSentinelProspectus,
  useEffectiveEpochsForSentinelRegistration,
  useIncreaseStakingSentinelRegistrationDuration,
  useRegisterSentinel,
  useSentinel
}
