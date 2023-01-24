import BigNumber from 'bignumber.js'
import { useEffect, useMemo, useState } from 'react'
import { useBlockNumber, useContract, useProvider } from 'wagmi'

import settings from '../settings'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import VotingAbi from '../utils/abis/Voting.json'
import { formatAssetAmount } from '../utils/amount'
import { parseSeconds } from '../utils/time'
import { getNickname } from '../utils/nicknames'

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

        const decodedStakeEvents = stakeEvents
          .map(({ decode, data, topics }) => decode(data, topics))
          .map(({ amount, duration, receiver }) => {
            const am = BigNumber(amount?.toString())
              .dividedBy(10 ** 18)
              .toFixed()

            return {
              amount: am,
              duration: BigNumber(duration?.toString()).toNumber(),
              formattedAmount: formatAssetAmount(am, 'PNT'),
              formattedDuration: parseSeconds(duration),
              receiver,
              receiverNickname: getNickname(receiver),
              type: 'Staked'
            }
          })

        setStakingManagerActivities(decodedStakeEvents)
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
        const [castVoteEvents, startVoteEvents] = await Promise.all([
          voting.queryFilter('CastVote', fromBlock, toBlock),
          voting.queryFilter('StartVote', fromBlock, toBlock)
          // stakingManager.queryFilter('Unstaked', fromBlock, toBlock)
        ])

        const decodedCastVoteEvents = castVoteEvents.map(({ decode, data, topics }) => decode(data, topics))

        const decodedStartVoteEvents = startVoteEvents
          .map(({ decode, data, topics }) => decode(data, topics))
          .map(({ creator, metadata, voteId }) => ({
            creator,
            creatorNickname: getNickname(creator),
            metadata,
            type: 'StartVote',
            voteId
          }))

        setVotingActivities([...decodedCastVoteEvents, ...decodedStartVoteEvents])
      } catch (_err) {
        console.error(_err)
      }
    }

    if (blockNumber && voting?.queryFilter) {
      fetchVotingData()
    }
  }, [blockNumber, voting])

  const activities = useMemo(
    () => [...stakingManagerActivities, ...votingActivities],
    [stakingManagerActivities, votingActivities]
  )

  return {
    activities,
    isLoading
  }
}

export { useActivities }
