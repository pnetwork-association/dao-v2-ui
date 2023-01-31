import { useEffect, useMemo, useState, useContext } from 'react'
import { useBlockNumber, useContract, useProvider } from 'wagmi'

import settings from '../settings'
import BorrowingManagerABI from '../utils/abis/BorrowingManager.json'
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
  const [borrowingManagerActivities, setBorrowingManagerActivities] = useState(null)
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

  const borrowingManager = useContract({
    address: settings.contracts.borrowingManager,
    abi: BorrowingManagerABI,
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

        setStakingManagerActivities(await extractActivityFromEvents(stakeEvents))
      } catch (_err) {
        console.error(_err)
      }
    }

    if (stakingManager?.queryFilter && fromBlock && toBlock && toBlock > cachedLastBlock) {
      fetchStakingManagerData()
    }
  }, [stakingManager, fromBlock, toBlock, cachedLastBlock])

  useEffect(() => {
    const fetchBorrowingManagerData = async () => {
      try {
        const [lendEvents] = await Promise.all([borrowingManager.queryFilter('Lended', fromBlock, toBlock)])
        setBorrowingManagerActivities(await extractActivityFromEvents(lendEvents))
      } catch (_err) {
        console.error(_err)
      }
    }

    if (borrowingManager?.queryFilter && fromBlock && toBlock && toBlock > cachedLastBlock) {
      fetchBorrowingManagerData()
    }
  }, [borrowingManager, fromBlock, toBlock, cachedLastBlock])

  useEffect(() => {
    const fetchVotingData = async () => {
      try {
        const [castVoteEvents, startVoteEvents] = await Promise.all([
          voting.queryFilter('CastVote', fromBlock, toBlock),
          voting.queryFilter('StartVote', fromBlock, toBlock)
        ])

        setVotingActivities(await extractActivityFromEvents([...castVoteEvents, ...startVoteEvents]))
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
    if (stakingManagerActivities && votingActivities && borrowingManagerActivities) {
      // console.log("storing", stakingManagerActivities.length, votingActivities.length)
      setLocalActivities([...stakingManagerActivities, ...borrowingManagerActivities, ...votingActivities])
      setStakingManagerActivities(null)
      setBorrowingManagerActivities(null)
      setVotingActivities(null)
    }
  }, [stakingManagerActivities, borrowingManagerActivities, votingActivities])

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
