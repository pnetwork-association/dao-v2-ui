import { useEffect, useMemo, useState, useContext, useRef } from 'react'
import { useBlockNumber, useContract, useProvider } from 'wagmi'
import { polygon } from 'wagmi/chains'

import settings from '../settings'
import LendingManagerABI from '../utils/abis/LendingManager.json'
import StakingManagerABI from '../utils/abis/StakingManager.json'
import DandelionVotingABI from '../utils/abis/DandelionVoting.json'
import { extractActivityFromEvents } from '../utils/logs'

import { ActivitiesContext } from '../components/context/Activities'

const useActivities = () => {
  const {
    activities,
    cacheActivities,
    lastBlock: cachedLastBlock,
    setLastBlock: cacheLastBlock
  } = useContext(ActivitiesContext)

  const checkpoints = useRef({
    LendingManager: 0,
    StakingManager: 0,
    DandelionVoting: 0
  })

  const [localActivities, setLocalActivities] = useState([])
  const [stakingManagerActivities, setStakingManagerActivities] = useState(null)
  const [borrowingManagerActivities, setBorrowingManagerActivities] = useState(null)
  const [votingActivities, setVotingActivities] = useState(null)
  const { data: blockNumber } = useBlockNumber({
    watch: true,
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
      fromBlock: blockNumber ? (cachedLastBlock === 0 ? blockNumber - 130000 : cachedLastBlock + 1) : 0,
      toBlock: blockNumber ? blockNumber + 1 : 0
    }),
    [blockNumber, cachedLastBlock]
  )

  useEffect(() => {
    const fetchStakingManagerData = async () => {
      try {
        const [stakeEvents, unstakeEvents] = await Promise.all([
          stakingManager.queryFilter('Staked', fromBlock, toBlock),
          stakingManager.queryFilter('Unstaked', fromBlock, toBlock)
        ])

        setStakingManagerActivities(await extractActivityFromEvents([...stakeEvents, ...unstakeEvents]))
      } catch (_err) {
        console.error(_err)
      }
    }

    if (
      stakingManager?.queryFilter &&
      fromBlock &&
      toBlock &&
      toBlock > cachedLastBlock &&
      checkpoints.current['StakingManager'] < toBlock
    ) {
      checkpoints.current['StakingManager'] = toBlock
      fetchStakingManagerData()
    }
  }, [stakingManager, fromBlock, toBlock, cachedLastBlock])

  useEffect(() => {
    const fetchBorrowingManagerData = async () => {
      try {
        const [lendEvents, increaseLendDurationEvents] = await Promise.all([
          lendingManager.queryFilter('Lended', fromBlock, toBlock),
          lendingManager.queryFilter('DurationIncreased', fromBlock, toBlock)
        ])
        setBorrowingManagerActivities(await extractActivityFromEvents([...lendEvents, ...increaseLendDurationEvents]))
      } catch (_err) {
        console.error(_err)
      }
    }

    if (
      lendingManager?.queryFilter &&
      fromBlock &&
      toBlock &&
      toBlock > cachedLastBlock &&
      checkpoints.current['LendingManager'] < toBlock
    ) {
      fetchBorrowingManagerData()
    }
  }, [lendingManager, fromBlock, toBlock, cachedLastBlock])

  useEffect(() => {
    const fetchVotingData = async () => {
      try {
        const [castVoteEvents, startVoteEvents] = await Promise.all([
          dandelionVoting.queryFilter('CastVote', fromBlock, toBlock),
          dandelionVoting.queryFilter('StartVote', fromBlock, toBlock)
        ])

        setVotingActivities(await extractActivityFromEvents([...castVoteEvents, ...startVoteEvents]))
      } catch (_err) {
        console.error(_err)
      }
    }

    if (
      dandelionVoting?.queryFilter &&
      fromBlock &&
      toBlock &&
      toBlock > cachedLastBlock &&
      checkpoints.current['DandelionVoting'] < toBlock
    ) {
      checkpoints.current['DandelionVoting'] = toBlock
      // console.log('fetch', fromBlock, toBlock)
      fetchVotingData()
    }
  }, [dandelionVoting, fromBlock, toBlock, cachedLastBlock])

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
