import { useEffect, useMemo, useState } from 'react'
import { useBlockNumber, useContract, useProvider } from 'wagmi'

import settings from '../settings'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import VotingAbi from '../utils/abis/Voting.json'
import { extractActivityFromEvents } from '../utils/logs'

const useActivities = () => {
  const [stakingManagerActivities, setStakingManagerActivities] = useState([])
  const [votingActivities, setVotingActivities] = useState([])
  const { data: blockNumber, isLoading } = useBlockNumber()
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

  useEffect(() => {
    const fetchStakingManagerData = async () => {
      try {
        const fromBlock = blockNumber - 4 * 10080
        const toBlock = blockNumber
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

    if (blockNumber && stakingManager?.queryFilter) {
      fetchStakingManagerData()
    }
  }, [blockNumber, stakingManager])

  useEffect(() => {
    const fetchVotingData = async () => {
      try {
        const fromBlock = blockNumber - 4 * 10080
        const toBlock = blockNumber
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

    if (blockNumber && voting?.queryFilter) {
      fetchVotingData()
    }
  }, [blockNumber, voting])

  const activities = useMemo(
    () => [...stakingManagerActivities, ...votingActivities].sort((_b, _a) => _a?.timestamp - _b?.timestamp),
    [stakingManagerActivities, votingActivities]
  )

  return {
    activities,
    isLoading
  }
}

export { useActivities }
