import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { useContractReads } from 'wagmi'

import settings from '../settings'
import BorrowingManagerABI from '../utils/abis/BorrowingManager.json'
import FeesManagerABI from '../utils/abis/FeesManager.json'
import RegistrationManagerABI from '../utils/abis/RegistrationManager.json'
import { range } from '../utils/time'

const useFeesDistributionByMonthlyRevenues = ({ startEpoch, endEpoch, mr }) => {
  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: settings.contracts.borrowingManager,
        abi: BorrowingManagerABI,
        functionName: 'totalBorrowedAmountByEpochsRange',
        args: [startEpoch, endEpoch],
        enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0)
      },
      {
        address: settings.contracts.registrationManager,
        abi: RegistrationManagerABI,
        functionName: 'totalSentinelStakedAmountByEpochsRange',
        args: [startEpoch, endEpoch],
        enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0)
      },
      {
        address: settings.contracts.feesManager,
        abi: FeesManagerABI,
        functionName: 'kByEpochsRange',
        args: [startEpoch, endEpoch],
        enabled: (startEpoch || startEpoch === 0) && (endEpoch || endEpoch === 0)
      }
    ]
  })

  const totalBorrowedAmountInEpoch = useMemo(() => (data && data[0] ? data[0] : []), [data])
  const totalStakedAmountInEpoch = useMemo(() => (data && data[1] ? data[1] : []), [data])
  const kInEpoch = useMemo(() => (data && data[2] ? data[2] : []), [data])

  return useMemo(
    () =>
      range(startEpoch, endEpoch + 1).map((_epoch) => {
        const k = BigNumber(kInEpoch[_epoch] ? kInEpoch[_epoch].toString() : 0)
        const totalBorrowedAmount = BigNumber(
          totalBorrowedAmountInEpoch[_epoch] ? totalBorrowedAmountInEpoch[_epoch].toString() : 0
        )
        const totalSentinelStakedAmount = BigNumber(
          totalStakedAmountInEpoch[_epoch] ? totalStakedAmountInEpoch[_epoch].toString() : 0
        )
        const totalAmount = totalBorrowedAmount.plus(totalSentinelStakedAmount)
        const sentinelsStakingFeesPercentage = totalAmount.isEqualTo(0)
          ? BigNumber(0)
          : totalSentinelStakedAmount.dividedBy(totalAmount)
        const sentinelsStakingFeesAmount = BigNumber(mr).multipliedBy(sentinelsStakingFeesPercentage)
        const sentinelsBorrowingFeesAndLendersInterestsAmount = BigNumber(mr).minus(sentinelsStakingFeesAmount)
        const lendersInterestsAmount = sentinelsBorrowingFeesAndLendersInterestsAmount.multipliedBy(k)
        const sentinelsBorrowingFeesAmount =
          sentinelsBorrowingFeesAndLendersInterestsAmount.minus(lendersInterestsAmount)

        return {
          lendersInterestsAmount,
          sentinelsBorrowingFeesAmount,
          sentinelsStakingFeesAmount
        }
      }),
    [totalBorrowedAmountInEpoch, totalStakedAmountInEpoch, kInEpoch, startEpoch, endEpoch, mr]
  )
}

export { useFeesDistributionByMonthlyRevenues }
