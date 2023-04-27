import { useEffect, useMemo, useState, useContext } from 'react'
import { useBlockNumber, useContract, useProvider } from 'wagmi'
import { polygon } from 'wagmi/chains'
import retry from 'async-retry'

import settings from '../settings'
import LendingManagerABI from '../utils/abis/LendingManager.json'
import StakingManagerABI from '../utils/abis/StakingManager.json'
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
  const [dandelionVotingActivities, setDandelionVotingActivities] = useState(null)
  const { data: blockNumber } = useBlockNumber({
    watch: false, // NOTE: keep it false becase of rate limiting
    chainId: polygon.id
  })
  const provider = useProvider({ chainId: polygon.id })

  const stakingManager = useContract({
    address: settings.contracts.stakingManager,
    abi: StakingManagerABI,
    signerOrProvider: provider
  })

  const lendingManager = useContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    signerOrProvider: provider
  })

  const dandelionVoting = useContract({
    address: settings.contracts.dandelionVoting,
    abi: DandelionVotingABI,
    signerOrProvider: provider
  })

  const { fromBlock, toBlock } = useMemo(
    () => ({
      fromBlock: blockNumber
        ? cachedLastBlock === 0
          ? blockNumber - settings.activities.blocksWindow
          : cachedLastBlock + 1
        : 0,
      toBlock: blockNumber ? blockNumber + 1 : 0
    }),
    [blockNumber, cachedLastBlock]
  )

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // S T A K I N G   M A N A G E
        try {
          const [stakeEvents, unstakeEvents] = await fetchWithRecursion(
            fromBlock,
            toBlock,
            recursiveMode.current.StakingManager,
            {
              fetchData: (_fromBlock, _toBlock) =>
                Promise.all([
                  retry(() => stakingManager.queryFilter('Staked', _fromBlock, _toBlock), {
                    retries: 2,
                    minTimeout: 1 * 1000
                  }),
                  retry(() => stakingManager.queryFilter('Unstaked', _fromBlock, _toBlock), {
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
                  retry(() => lendingManager.queryFilter('Lended', _fromBlock, _toBlock), {
                    retries: 2,
                    minTimeout: 1 * 1000
                  }),
                  retry(() => lendingManager.queryFilter('DurationIncreased', _fromBlock, _toBlock), {
                    retries: 2,
                    minTimeout: 1 * 1000
                  })
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
              limitBlock: 42023192, // no votes until now
              fetchData: (_fromBlock, _toBlock) =>
                Promise.all([
                  retry(() => dandelionVoting.queryFilter('CastVote', _fromBlock, _toBlock), {
                    retries: 2,
                    minTimeout: 1 * 1000
                  }),
                  retry(() => dandelionVoting.queryFilter('StartVote', _fromBlock, _toBlock), {
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
      } catch (_err) {
        console.error(_err)
      }
    }

    if (
      stakingManager?.queryFilter &&
      lendingManager?.queryFilter &&
      dandelionVoting?.queryFilter &&
      fromBlock &&
      toBlock &&
      toBlock > cachedLastBlock &&
      checkpoint.current < toBlock
    ) {
      checkpoint.current = toBlock
      mutex.current.runExclusive(async () => {
        await fetchAllData()
      })
    }
  }, [
    stakingManager,
    lendingManager,
    dandelionVoting,
    fromBlock,
    toBlock,
    cachedLastBlock,
    recursiveMode,
    mutex,
    checkpoint
  ])

  useEffect(() => {
    if (stakingManagerActivities && dandelionVotingActivities && lendingManagerActivities) {
      /*console.log(
        'storing',
        stakingManagerActivities.length,
        lendingManagerActivities.length,
        dandelionVotingActivities.length
      )*/
      setLocalActivities([...stakingManagerActivities, ...lendingManagerActivities, ...dandelionVotingActivities])
      setStakingManagerActivities(null)
      setLendingManagerActivities(null)
      setDandelionVotingActivities(null)
    }
  }, [stakingManagerActivities, lendingManagerActivities, dandelionVotingActivities])

  useEffect(() => {
    if (toBlock > cachedLastBlock && localActivities?.length > 0) {
      cacheActivities(localActivities)
      cacheLastBlock(toBlock)
      setLocalActivities(null)
      // console.log('cache')
    }
  }, [toBlock, cacheActivities, localActivities, cacheLastBlock, cachedLastBlock])

  return {
    activities: activities.sort((_b, _a) => _a?.timestamp - _b?.timestamp),
    isLoading: activities.length === 0
  }
}

export { useActivities }
