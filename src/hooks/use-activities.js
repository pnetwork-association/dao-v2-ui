import { useEffect, useMemo, useState, useContext } from 'react'
import { useBlockNumber, useClient } from 'wagmi'
import { getContract } from 'viem'
import { gnosis } from 'wagmi/chains'
import retry from 'async-retry'

import settings from '../settings'
import LendingManagerABI from '../utils/abis/LendingManager.json'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import RegistrationManagerABI from '../utils/abis/RegistrationManager.json'
import DandelionVotingABI from '../utils/abis/DandelionVoting.json'
import { extractActivityFromEvents } from '../utils/logs'

import { ActivitiesContext } from '../components/context/Activities'

const fetchWithRecursion = async (
  _fromBlock,
  _toBlock,
  _withRecursion,
  { fetchData, canProoced, limitBlock = settings.activities.limitBlock }
) => {
  const data = await fetchData(_fromBlock, _toBlock)
  const proceed = _fromBlock >= limitBlock && _withRecursion && canProoced(data)
  if (proceed) {
    return await fetchWithRecursion(
      _fromBlock - settings.activities.blocksWindow,
      _toBlock - settings.activities.blocksWindow,
      true,
      {
        fetchData,
        canProoced
      }
    )
  }

  return data
}

const useActivities = () => {
  const {
    activities,
    cacheActivities,
    checkpoint,
    lastBlock: cachedLastBlock,
    mutex,
    recursiveMode,
    setLastBlock: cacheLastBlock
  } = useContext(ActivitiesContext)

  const [localActivities, setLocalActivities] = useState([])
  const [stakingManagerActivities, setStakingManagerActivities] = useState(null)
  const [lendingManagerActivities, setLendingManagerActivities] = useState(null)
  const [registrationManagerActivities, setRegistrationManagerActivities] = useState(null)
  const [dandelionVotingActivities, setDandelionVotingActivities] = useState(null)
  const { data: blockNumber } = useBlockNumber({
    watch: false, // NOTE: keep it false becase of rate limiting
    chainId: gnosis.id
  })
  const client = useClient({ chainId: gnosis.id })

  const stakingManager = getContract({
    address: settings.contracts.stakingManager,
    abi: StakingManagerABI,
    client: client
  })

  const lendingManager = getContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    client: client
  })

  const registrationManager = getContract({
    address: settings.contracts.registrationManager,
    abi: RegistrationManagerABI,
    client: client
  })

  const dandelionVotingV3 = getContract({
    address: settings.contracts.dandelionVotingV3,
    abi: DandelionVotingABI,
    client: client
  })

  const { fromBlock, toBlock } = useMemo(
    () => ({
      fromBlock: blockNumber
        ? cachedLastBlock === 0
          ? blockNumber - BigInt(settings.activities.blocksWindow)
          : cachedLastBlock + 1n
        : 0,
      toBlock: blockNumber ? blockNumber + 1n : 0n
    }),
    [blockNumber, cachedLastBlock]
  )

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // S T A K I N G   M A N A G E R
        try {
          const [stakeEvents, unstakeEvents] = await fetchWithRecursion(
            fromBlock,
            toBlock,
            recursiveMode.current.StakingManager,
            {
              fetchData: (_fromBlock, _toBlock) =>
                Promise.all([
                  retry(() => stakingManager.getEvents.Staked({ fromBlock: _fromBlock, toBlock: _toBlock }), {
                    retries: 2,
                    minTimeout: 1 * 1000
                  }),
                  retry(() => stakingManager.getEvents.Unstaked({ fromBlock: _fromBlock, toBlock: _toBlock }), {
                    retries: 2,
                    minTimeout: 1 * 1000
                  })
                ]),
              canProoced: ([_stakeEvents, _unstakeEvents]) => _stakeEvents.length === 0 && _unstakeEvents.length === 0
            }
          )
          if (recursiveMode.current.StakingManager) {
            recursiveMode.current.StakingManager = false
          }

          setStakingManagerActivities(await extractActivityFromEvents([...stakeEvents, ...unstakeEvents]))
        } catch (_err) {
          setStakingManagerActivities([])
          console.error(_err)
        }

        // L E N D I N G   M A N A G E R
        try {
          const [lendEvents, increaseLendDurationEvents] = await fetchWithRecursion(
            fromBlock,
            toBlock,
            recursiveMode.current.LendingManager,
            {
              fetchData: (_fromBlock, _toBlock) =>
                Promise.all([
                  retry(() => lendingManager.getEvents.Lended({ fromBlock: _fromBlock, toBlock: _toBlock }), {
                    retries: 2,
                    minTimeout: 1 * 1000
                  }),
                  retry(
                    () => lendingManager.getEvents.DurationIncreased({ fromBlock: _fromBlock, toBlock: _toBlock }),
                    {
                      retries: 2,
                      minTimeout: 1 * 1000
                    }
                  )
                ]),
              canProoced: ([_lendEvents, _increaseLendDurationEvents]) =>
                _lendEvents.length === 0 && _increaseLendDurationEvents.length === 0
            }
          )
          if (recursiveMode.current.LendingManager) {
            recursiveMode.current.LendingManager = false
          }

          setLendingManagerActivities(await extractActivityFromEvents([...lendEvents, ...increaseLendDurationEvents]))
        } catch (_err) {
          setLendingManagerActivities([])
          console.error(_err)
        }

        // D A N D E L I O N   V O T I N G
        try {
          const [castVoteEvents, startVoteEvents] = await fetchWithRecursion(
            fromBlock,
            toBlock,
            recursiveMode.current.DandelionVoting,
            {
              fetchData: (_fromBlock, _toBlock) =>
                Promise.all([
                  retry(() => dandelionVotingV3.getEvents.CastVote({ fromBlock: _fromBlock, toBlock: _toBlock }), {
                    retries: 2,
                    minTimeout: 1 * 1000
                  }),
                  retry(() => dandelionVotingV3.getEvents.StartVote({ fromBlock: _fromBlock, toBlock: _toBlock }), {
                    retries: 2,
                    minTimeout: 1 * 1000
                  })
                ]),
              canProoced: ([_castVoteEvents, _startVoteEvents]) =>
                _castVoteEvents.length === 0 && _startVoteEvents.length === 0
            }
          )
          if (recursiveMode.current.DandelionVoting) {
            recursiveMode.current.DandelionVoting = false
          }
          setDandelionVotingActivities(await extractActivityFromEvents([...castVoteEvents, ...startVoteEvents]))
        } catch (_err) {
          setDandelionVotingActivities([])
        }

        // R E G I S T R A T I O N   M A N A G E R
        try {
          const [sentinelRegistrationEvents] = await fetchWithRecursion(
            fromBlock,
            toBlock,
            recursiveMode.current.RegistrationManager,
            {
              fetchData: (_fromBlock, _toBlock) =>
                Promise.all([
                  retry(
                    () =>
                      registrationManager.getEvents.SentinelRegistrationUpdated({
                        fromBlock: _fromBlock,
                        toBlock: _toBlock
                      }),
                    {
                      retries: 2,
                      minTimeout: 1 * 1000
                    }
                  )
                ]),
              canProoced: ([_sentinelRegistrationEvents]) => _sentinelRegistrationEvents.length === 0
            }
          )
          if (recursiveMode.current.RegistrationManager) {
            recursiveMode.current.RegistrationManager = false
          }

          setRegistrationManagerActivities(await extractActivityFromEvents(sentinelRegistrationEvents))
        } catch (_err) {
          setRegistrationManagerActivities([])
        }
      } catch (_err) {
        console.error(_err)
      }
    }

    if (
      stakingManager?.getEvents &&
      lendingManager?.getEvents &&
      dandelionVotingV3?.getEvents &&
      fromBlock &&
      toBlock &&
      toBlock > cachedLastBlock &&
      checkpoint.current < toBlock
    ) {
      if (mutex.current.isLocked()) return
      checkpoint.current = toBlock
      mutex.current.runExclusive(async () => {
        await fetchAllData()
      })
    }
  }, [
    stakingManager,
    lendingManager,
    registrationManager,
    dandelionVotingV3,
    fromBlock,
    toBlock,
    cachedLastBlock,
    recursiveMode,
    mutex,
    checkpoint
  ])

  useEffect(() => {
    if (
      stakingManagerActivities &&
      dandelionVotingActivities &&
      lendingManagerActivities &&
      registrationManagerActivities
    ) {
      setLocalActivities([
        ...stakingManagerActivities,
        ...lendingManagerActivities,
        ...dandelionVotingActivities,
        ...registrationManagerActivities
      ])
      setStakingManagerActivities(null)
      setLendingManagerActivities(null)
      setDandelionVotingActivities(null)
      setRegistrationManagerActivities(null)
    }
  }, [stakingManagerActivities, lendingManagerActivities, dandelionVotingActivities, registrationManagerActivities])

  useEffect(() => {
    if (toBlock > cachedLastBlock && localActivities?.length > 0) {
      cacheActivities(localActivities)
      cacheLastBlock(toBlock)
      setLocalActivities(null)
    }
  }, [toBlock, cacheActivities, localActivities, cacheLastBlock, cachedLastBlock])

  return {
    activities: activities.sort((_b, _a) => Number(_a?.timestamp) - Number(_b?.timestamp)),
    isLoading: activities.length === 0
  }
}

export { useActivities }
