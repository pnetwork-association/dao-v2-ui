import moment from 'moment'
import { useMemo } from 'react'
import { useContractReads } from 'wagmi'
import { polygon } from 'wagmi/chains'

import settings from '../settings'
import EpochsManagerABI from '../utils/abis/EpochsManager.json'
import { parseSeconds } from '../utils/time'

const useEpochs = () => {
  const { data } = useContractReads({
    contracts: [
      {
        address: settings.contracts.epochsManager,
        abi: EpochsManagerABI,
        functionName: 'currentEpoch',
        args: [],
        chainId: polygon.id
      },
      {
        address: settings.contracts.epochsManager,
        abi: EpochsManagerABI,
        functionName: 'epochDuration',
        args: [],
        chainId: polygon.id
      },
      {
        address: settings.contracts.epochsManager,
        abi: EpochsManagerABI,
        functionName: 'startFirstEpochTimestamp',
        args: [],
        chainId: polygon.id
      }
    ]
  })

  const currentEpoch = useMemo(() => (data && data[0] ? data[0].toNumber() : null), [data])
  const epochDuration = useMemo(() => (data && data[1] ? data[1].toNumber() : null), [data])
  const startFirstEpochTimestamp = useMemo(() => (data && data[2] ? data[2].toNumber() : null), [data])

  const secondsPassedUntilNow = useMemo(
    () => (startFirstEpochTimestamp ? moment().unix() - startFirstEpochTimestamp : null),
    [startFirstEpochTimestamp]
  )

  const secondsPassedUntilStartCurrentEpoch = useMemo(
    () =>
      (currentEpoch || currentEpoch === 0) && epochDuration && startFirstEpochTimestamp
        ? currentEpoch > 0
          ? currentEpoch * epochDuration
          : moment().unix() - startFirstEpochTimestamp
        : null,
    [currentEpoch, epochDuration, startFirstEpochTimestamp]
  )

  const currentEpochEndsIn = useMemo(
    () =>
      (currentEpoch || currentEpoch === 0) &&
      startFirstEpochTimestamp &&
      secondsPassedUntilNow &&
      secondsPassedUntilStartCurrentEpoch
        ? currentEpoch === 0
          ? epochDuration - (moment().unix() - startFirstEpochTimestamp)
          : epochDuration - (secondsPassedUntilNow - secondsPassedUntilStartCurrentEpoch)
        : null,
    [currentEpoch, epochDuration, secondsPassedUntilNow, secondsPassedUntilStartCurrentEpoch, startFirstEpochTimestamp]
  )

  const currentEpochEndsAt = useMemo(
    () => (currentEpochEndsIn ? moment().unix() + currentEpochEndsIn : null),
    [currentEpochEndsIn]
  )

  const currentEpochStartedAt = useMemo(
    () => startFirstEpochTimestamp + currentEpoch * epochDuration,
    [startFirstEpochTimestamp, currentEpoch, epochDuration]
  )

  return {
    currentEpoch,
    currentEpochEndsAt,
    currentEpochEndsIn,
    currentEpochStartedAt,
    epochDuration,
    formattedCurrentEpoch: currentEpoch || currentEpoch === 0 ? `#${currentEpoch}` : '-',
    formattedCurrentEpochEndAt: currentEpochEndsAt
      ? moment.unix(currentEpochEndsAt).format('MMM DD YYYY - HH:mm:ss')
      : '-',
    formattedCurrentEpochStartedAt: currentEpochStartedAt
      ? moment.unix(currentEpochStartedAt).format('MMM DD YYYY - HH:mm:ss')
      : '-',
    formattedCurrentEpochEndIn: currentEpochEndsIn ? parseSeconds(currentEpochEndsIn) : '-',
    formattedEpochDuration: epochDuration ? parseSeconds(epochDuration) : '-',
    startFirstEpochTimestamp
  }
}

export { useEpochs }
