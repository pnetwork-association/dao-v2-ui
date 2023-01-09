import { useMemo } from 'react'
import { useContractReads } from 'wagmi'
import moment from 'moment'

import settings from '../settings'
import { parseSeconds } from '../utils/time'
import EpochsManagerABI from '../utils/abis/EpochsManager.json'

const useEpochs = () => {
  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: settings.contracts.epochsManager,
        abi: EpochsManagerABI,
        functionName: 'currentEpoch',
        args: []
      },
      {
        address: settings.contracts.epochsManager,
        abi: EpochsManagerABI,
        functionName: 'epochDuration',
        args: []
      },
      {
        address: settings.contracts.epochsManager,
        abi: EpochsManagerABI,
        functionName: 'startFirstEpochDate',
        args: []
      }
    ]
  })

  const currentEpoch = useMemo(() => (data && data[0] ? data[0].toNumber() : null), [data])
  const epochDuration = useMemo(() => (data && data[1] ? data[1].toNumber() : null), [data])
  const startFirstEpochDate = useMemo(() => (data && data[2] ? data[2].toNumber() : null), [data])

  const secondsPassedUntilNow = useMemo(
    () => (startFirstEpochDate ? moment().unix() - startFirstEpochDate : null),
    [startFirstEpochDate]
  )
  const secondsPassedUntilStartCurrentEpoch = useMemo(
    () =>
      (currentEpoch || currentEpoch === 0) && epochDuration && startFirstEpochDate
        ? currentEpoch > 0
          ? currentEpoch * epochDuration
          : moment().unix() - startFirstEpochDate
        : null,
    [currentEpoch, epochDuration, startFirstEpochDate]
  )

  const currentEpochEndsIn = useMemo(
    () =>
      (currentEpoch || currentEpoch === 0) &&
      startFirstEpochDate &&
      secondsPassedUntilNow &&
      secondsPassedUntilStartCurrentEpoch
        ? currentEpoch === 0
          ? epochDuration - (moment().unix() - startFirstEpochDate)
          : epochDuration - (secondsPassedUntilNow - secondsPassedUntilStartCurrentEpoch)
        : null,
    [currentEpoch, epochDuration, secondsPassedUntilNow, secondsPassedUntilStartCurrentEpoch, startFirstEpochDate]
  )

  const currentEpochEndsAt = useMemo(
    () => (currentEpochEndsIn ? moment().unix() + currentEpochEndsIn : null),
    [currentEpochEndsIn]
  )

  return {
    currentEpoch,
    currentEpochEndsAt,
    currentEpochEndsIn,
    epochDuration,
    formattedCurrentEpoch: currentEpoch || currentEpoch === 0 ? `#${currentEpoch}` : '-',
    formattedCurrentEpochEndAt: currentEpochEndsAt
      ? moment.unix(currentEpochEndsAt).format('MMM DD YYYY - HH:mm:ss')
      : '-',
    formattedCurrentEpochEndIn: currentEpochEndsIn ? parseSeconds(currentEpochEndsIn) : '-',
    formattedEpochDuration: epochDuration ? parseSeconds(epochDuration) : '-',
    startFirstEpochDate
  }
}

export { useEpochs }
