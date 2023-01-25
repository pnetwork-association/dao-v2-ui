import { useEffect, useMemo, useState, useContext } from 'react'
import { useBlockNumber, useContract, useProvider } from 'wagmi'

import settings from '../settings'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import VotingAbi from '../utils/abis/Voting.json'
import { extractActivityFromEvents } from '../utils/logs'

import { ActivitiesContext } from '../components/context/Activities'

const useActivities = () => {
  const {
    activities,
    cacheActivities,
    lastBlock: cachedLastBlock,
    setLastBlock: cacheLastBlock
  } = useContext(ActivitiesContext)

  const [localActivities, setLocalActivities] = useState([])
  const [stakingManagerActivities, setStakingManagerActivities] = useState(null)
  const [votingActivities, setVotingActivities] = useState(null)
  const { data: blockNumber } = useBlockNumber({
    watch: true
  })
  const provider = useProvider()

  const stakingManager = useContract({
    address: settings.contracts.stakingManager,
    abi: StakingManagerABI,
    signerOrProvider: provider
  })

  const voting = useContract({
    address: settings.contracts.voting,
    abi: VotingAbi,
    signerOrProvider: provider
  })

  const { fromBlock, toBlock } = useMemo(
    () => ({
      fromBlock: blockNumber ? (cachedLastBlock === 0 ? blockNumber - 4 * 10080 : cachedLastBlock + 1) : 0,
      toBlock: blockNumber ? blockNumber + 1 : 0
    }),
    [blockNumber, cachedLastBlock]
  )

  useEffect(() => {
    const fetchStakingManagerData = async () => {
      try {
        const [stakeEvents /*unstakeEvents*/] = await Promise.all([
          stakingManager.queryFilter('Staked', fromBlock, toBlock)
          // stakingManager.queryFilter('Unstaked', fromBlock, toBlock)
        ])

        const activitiesStakeEvents = await extractActivityFromEvents(stakeEvents)
        setStakingManagerActivities(activitiesStakeEvents)
      } catch (_err) {
        console.error(_err)
      }
    }

    if (stakingManager?.queryFilter && fromBlock && toBlock && toBlock > cachedLastBlock) {
      fetchStakingManagerData()
    }
  }, [stakingManager, fromBlock, toBlock, cachedLastBlock])

  useEffect(() => {
    const fetchVotingData = async () => {
      try {
        const [, /*castVoteEvents*/ startVoteEvents] = await Promise.all([
          voting.queryFilter('CastVote', fromBlock, toBlock),
          voting.queryFilter('StartVote', fromBlock, toBlock)
          // stakingManager.queryFilter('Unstaked', fromBlock, toBlock)
        ])

        const activitiesStartVoteEvents = await extractActivityFromEvents(startVoteEvents)
        setVotingActivities(activitiesStartVoteEvents)
      } catch (_err) {
        console.error(_err)
      }
    }

    if (voting?.queryFilter && fromBlock && toBlock && toBlock > cachedLastBlock) {
      // console.log('fetch', fromBlock, toBlock)
      fetchVotingData()
    }
  }, [voting, fromBlock, toBlock, cachedLastBlock])

  useEffect(() => {
    if (stakingManagerActivities && votingActivities) {
      // console.log("storing", stakingManagerActivities.length, votingActivities.length)
      setLocalActivities([...stakingManagerActivities, ...votingActivities])
      setStakingManagerActivities(null)
      setVotingActivities(null)
    }
  }, [stakingManagerActivities, votingActivities])

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
