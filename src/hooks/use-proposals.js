import { ethers } from 'ethers'
import { useEffect, useMemo, useState, useContext, useRef } from 'react'
import {
  erc20ABI,
  useAccount,
  useBlockNumber,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useProvider
} from 'wagmi'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import { mainnet, polygon } from 'wagmi/chains'

import settings from '../settings'
import DandelionVotingABI from '../utils/abis/DandelionVoting'
import DandelionVotingOldABI from '../utils/abis/DandelionVotingOld'
import { formatAssetAmount } from '../utils/amount'
import { hexToAscii } from '../utils/format'
import { extractActionsFromTransaction } from '../utils/logs'
import { extrapolateProposalData } from '../utils/proposals'
import { useBalances } from './use-balances'
import ACLAbi from '../utils/abis/ACL.json'
import { getRole } from '../utils/role'
import { isValidHexString } from '../utils/format'

import { ProposalsContext } from '../components/context/Proposals'

const now = moment().unix()

const prepareOldProposal = (
  _proposal,
  _voteData,
  _voteActions,
  _executionBlockNumberTimestamp,
  _chainId,
  _idStart = 0,
  _durationBlocks
) => {
  const { executed, executionBlock, open, script, snapshotBlock, startBlock } = _voteData

  const votingPower = BigNumber(_voteData.votingPower.toString()).dividedBy(10 ** 18)
  const no = BigNumber(_voteData.nay.toString()).dividedBy(10 ** 18)
  const yes = BigNumber(_voteData.yea.toString()).dividedBy(10 ** 18)

  const votingPnt = yes.plus(no)
  const percentageYea = yes.dividedBy(votingPnt).multipliedBy(100)
  const percentageNay = no.dividedBy(votingPnt).multipliedBy(100)

  const quorum = yes.dividedBy(votingPower)
  const minAcceptQuorum = BigNumber(_voteData.minAcceptQuorum.toString()).dividedBy(10 ** 18)

  const quorumReached = quorum.isGreaterThan(minAcceptQuorum)
  const passed = percentageYea.isGreaterThan(51) && quorumReached

  const endBlock = startBlock.add(_durationBlocks)

  // No need to calculate the countdown on old votes on eth since are all closed and the new ones will be only on Polygon
  // TODO: What does it happen if keep creating vote on ethereum?
  const countdown = -1

  const formattedCloseDate =
    countdown > 0
      ? `~${moment.unix(now + countdown).format('MMM DD YYYY - HH:mm:ss')}`
      : _executionBlockNumberTimestamp
      ? moment.unix(_executionBlockNumberTimestamp).format('MMM DD YYYY - HH:mm:ss')
      : null

  console.log(_executionBlockNumberTimestamp, formattedCloseDate)

  return {
    ..._proposal,
    actions: _voteActions,
    chainId: _chainId,
    effectiveId: _proposal.id,
    endBlock: endBlock.toNumber(),
    executed,
    executionBlock: executionBlock.toNumber(),
    formattedCloseDate,
    formattedPercentageNay: formatAssetAmount(percentageNay, '%', {
      decimals: 2
    }),
    formattedPercentageYea: formatAssetAmount(percentageYea, '%', {
      decimals: 2
    }),
    formattedVotingPnt: formatAssetAmount(votingPnt, 'PNT'),
    id: _proposal.id + _idStart,
    minAcceptQuorum: minAcceptQuorum.toFixed(),
    no: no.toFixed(),
    open,
    passed,
    quorum: quorum.toFixed(),
    quorumReached,
    script,
    snapshotBlock: snapshotBlock.toNumber(),
    startBlock: startBlock.toNumber(),
    votingPnt,
    votingPower: votingPower.toFixed(),
    yes: yes.toFixed()
  }
}

const prepareNewProposal = (_proposal, _voteData, _voteActions, _chainId, _idStart = 0, _duration) => {
  const { executed, executionDate, open, script, snapshotBlock, startDate } = _voteData

  const votingPower = BigNumber(_voteData.votingPower.toString()).dividedBy(10 ** 18)
  const no = BigNumber(_voteData.nay.toString()).dividedBy(10 ** 18)
  const yes = BigNumber(_voteData.yea.toString()).dividedBy(10 ** 18)

  const votingPnt = yes.plus(no)
  const percentageYea = yes.dividedBy(votingPnt).multipliedBy(100)
  const percentageNay = no.dividedBy(votingPnt).multipliedBy(100)

  const quorum = yes.dividedBy(votingPower)
  const minAcceptQuorum = BigNumber(_voteData.minAcceptQuorum.toString()).dividedBy(10 ** 18)

  const quorumReached = quorum.isGreaterThan(minAcceptQuorum)
  const passed = percentageYea.isGreaterThan(51) && quorumReached

  const endDate = startDate.add(_duration)

  const countdown = now < endDate.toNumber() ? endDate.toNumber() - now : -1

  const formattedCloseDate =
    countdown > 0
      ? `~${moment.unix(now + countdown).format('MMM DD YYYY - HH:mm:ss')}`
      : moment.unix(now).format('MMM DD YYYY - HH:mm:ss')

  return {
    ..._proposal,
    actions: _voteActions,
    chainId: _chainId,
    effectiveId: _proposal.id,
    endDate: endDate.toNumber(),
    executed,
    executionDate: executionDate.toNumber(),
    formattedCloseDate,
    formattedPercentageNay: formatAssetAmount(percentageNay, '%', {
      decimals: 2
    }),
    formattedPercentageYea: formatAssetAmount(percentageYea, '%', {
      decimals: 2
    }),
    formattedVotingPnt: formatAssetAmount(votingPnt, 'PNT'),
    id: _proposal.id + _idStart,
    minAcceptQuorum: minAcceptQuorum.toFixed(),
    no: no.toFixed(),
    open,
    passed,
    quorum: quorum.toFixed(),
    quorumReached,
    script,
    snapshotBlock: snapshotBlock.toNumber(),
    startDate: startDate.toNumber(),
    votingPnt,
    votingPower: votingPower.toFixed(),
    yes: yes.toFixed()
  }
}

// hook used only by ProposalsProvider in order to store immediately the votes
const useFetchProposals = ({ setProposals }) => {
  const [etherscanProposals, setEtherscanProposals] = useState([])
  const [polygonscanProposals, setPolygonscanProposals] = useState([])
  const [oldEndlockNumberTimestamps, setOldEndBlockNumberTimestamps] = useState([])
  const [oldVotesActions, setOldVoteActions] = useState({})
  const [newVotesActions, setNewVoteActions] = useState({})
  const mainnetProvider = useProvider({ chainId: mainnet.id })
  const polygonProvider = useProvider({ chainId: polygon.id })
  const fetched = useRef(false)

  const { data: daoPntTotalSupply } = useContractRead({
    address: settings.contracts.daoPnt,
    abi: erc20ABI,
    functionName: 'totalSupply',
    args: []
  })

  const { data: currentBlockNumber } = useBlockNumber({ chainId: polygon.id })

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const [
          {
            data: { result: resultEtherscan }
          },
          {
            data: { result: resultPolygonscan }
          }
        ] = await Promise.all([
          axios.get(
            `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=365841&toBlock=latest&address=${settings.contracts.dandelionVotingOld}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
          ),
          axios.get(
            `https://api.polygonscan.com/api?module=logs&action=getLogs&fromBlock=40099754&toBlock=latest&address=${settings.contracts.dandelionVoting}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${process.env.REACT_APP_POLYGONSCAN_API_KEY}`
          )
        ])

        setEtherscanProposals(
          resultEtherscan.map((_proposal, _id) => {
            const data = extrapolateProposalData(hexToAscii(_proposal.data))
            return {
              id: _id + 1,
              formattedOpenDate: moment.unix(_proposal.timeStamp).format('MMM DD YYYY - HH:mm:ss'),
              timestamp: _proposal.timeStamp,
              ...data
            }
          })
        )

        setPolygonscanProposals(
          resultPolygonscan.map((_proposal, _id) => {
            const data = extrapolateProposalData(hexToAscii(_proposal.data))
            return {
              id: _id + 1,
              formattedOpenDate: moment.unix(_proposal.timeStamp).format('MMM DD YYYY - HH:mm:ss'),
              timestamp: _proposal.timeStamp,
              ...data
            }
          })
        )
      } catch (_err) {
        console.error(_err)
      }
    }
    if (!fetched.current) {
      fetched.current = true
      fetchProposals()
    }
  }, [])

  const { data: oldVotesData } = useContractReads({
    contracts: etherscanProposals.map(({ id }) => ({
      address: settings.contracts.dandelionVotingOld,
      abi: DandelionVotingOldABI,
      functionName: 'getVote',
      args: [id],
      chainId: mainnet.id
    }))
  })

  const { data: newVotesData } = useContractReads({
    contracts: polygonscanProposals.map(({ id }) => ({
      address: settings.contracts.dandelionVoting,
      abi: DandelionVotingABI,
      functionName: 'getVote',
      args: [id],
      chainId: polygon.id
    }))
  })

  const { data: oldDurationBlocks } = useContractRead({
    address: settings.contracts.dandelionVotingOld,
    abi: DandelionVotingOldABI,
    functionName: 'durationBlocks',
    args: [],
    chainId: mainnet.id
  })

  const { data: newDuration } = useContractRead({
    address: settings.contracts.dandelionVoting,
    abi: DandelionVotingABI,
    functionName: 'duration',
    args: [],
    chainId: polygon.id
  })

  useEffect(() => {
    const fetchExecutionBlockNumberTimestamps = async () => {
      try {
        const res = await Promise.all(
          oldVotesData
            .filter((_voteData) => _voteData)
            .map(({ startBlock }) => mainnetProvider.getBlock(startBlock.add(oldDurationBlocks).toNumber()))
        )

        setOldEndBlockNumberTimestamps(
          res
            .map((_block) => _block?.timestamp)
            .sort((_b, _a) => _a - _b)
            .reverse()
        )
      } catch (_err) {
        console.error(_err)
      }
    }

    if (oldVotesData && oldDurationBlocks) {
      fetchExecutionBlockNumberTimestamps()
    }
  }, [oldVotesData, mainnetProvider, polygonProvider, oldDurationBlocks])

  useEffect(() => {
    const fetchExecutionBlockLogs = async () => {
      try {
        const [
          {
            data: { result: resultEtherscan }
          },
          {
            data: { result: resultPolygonscan }
          }
        ] = await Promise.all([
          axios.get(
            `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=16090616&toBlock=latest&address=${settings.contracts.dandelionVotingOld}&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
          ), // 16090616 block of the first votes containing a script
          axios.get(
            `https://api.polygonscan.com/api?module=logs&action=getLogs&fromBlock=16090616&toBlock=latest&address=${settings.contracts.dandelionVoting}&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&apikey=${process.env.REACT_APP_POLYGONSCAN_API_KEY}`
          )
        ])

        const getActions = async (_data, _provider) => {
          const eventsVoteIds = _data.reduce((_acc, _event) => {
            const voteId = ethers.BigNumber.from(ethers.utils.hexStripZeros(_event.topics[1])).toNumber()
            _acc[voteId] = _event
            return _acc
          }, {})

          const transactions = await Promise.all(
            Object.values(eventsVoteIds).map(({ transactionHash }) => _provider.getTransactionReceipt(transactionHash))
          )

          return Object.keys(eventsVoteIds).reduce((_acc, _voteId, _index) => {
            const transaction = transactions[_index]
            _acc[_voteId] = extractActionsFromTransaction(transaction).filter((_action) => _action)
            return _acc
          }, {})
        }

        setOldVoteActions(await getActions(resultEtherscan, mainnetProvider))
        setNewVoteActions(await getActions(resultPolygonscan, polygonProvider))
      } catch (_err) {
        console.error(_err)
      }
    }

    fetchExecutionBlockLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const oldProposals =
      oldVotesData?.length > 0 &&
      etherscanProposals.length === oldVotesData.length &&
      oldVotesData[0] &&
      oldDurationBlocks
        ? etherscanProposals.map((_proposal, _index) =>
            prepareOldProposal(
              _proposal,
              oldVotesData[_index],
              oldVotesActions && oldVotesActions[_index + 1] ? oldVotesActions[_index + 1] : [],
              oldEndlockNumberTimestamps[_index],
              mainnet.id,
              0,
              oldDurationBlocks
            )
          )
        : []

    const newProposals =
      newVotesData?.length > 0 && polygonscanProposals.length === newVotesData.length && newVotesData[0] && newDuration
        ? polygonscanProposals.map((_proposal, _index) =>
            prepareNewProposal(
              _proposal,
              newVotesData[_index],
              newVotesActions && newVotesActions[_index + 1] ? newVotesActions[_index + 1] : [],
              polygon.id,
              etherscanProposals.length,
              newDuration
            )
          )
        : []
    setProposals([...oldProposals, ...newProposals])
  }, [
    etherscanProposals,
    polygonscanProposals,
    oldVotesData,
    newVotesData,
    daoPntTotalSupply,
    currentBlockNumber,
    oldEndlockNumberTimestamps,
    oldVotesActions,
    newVotesActions,
    setProposals,
    oldDurationBlocks,
    newDuration
  ])
}

const useProposals = () => {
  const { proposals } = useContext(ProposalsContext)
  const { address } = useAccount()

  const oldProposals = useMemo(() => proposals.filter(({ chainId }) => chainId === 1), [proposals])
  const newProposals = useMemo(() => proposals.filter(({ chainId }) => chainId === 137), [proposals])

  const { data: oldVoterStatesData } = useContractReads({
    contracts: oldProposals.map(({ effectiveId }) => ({
      address: settings.contracts.dandelionVotingOld,
      abi: DandelionVotingOldABI,
      functionName: 'getVoterState',
      args: [effectiveId, address],
      chainId: mainnet.id
    }))
  })

  const { data: newVoterStatesData } = useContractReads({
    contracts: newProposals.map(({ effectiveId }) => ({
      address: settings.contracts.dandelionVoting,
      abi: DandelionVotingABI,
      functionName: 'getVoterState',
      args: [effectiveId, address],
      chainId: polygon.id
    }))
  })

  const prepareVote = (_proposal, _vote) => {
    let formattedVote
    switch (_vote) {
      case 0:
        formattedVote = 'NOT VOTED'
        break
      case 1:
        formattedVote = 'YES'
        break
      case 2:
        formattedVote = 'NO'
        break
      default:
        formattedVote = '-'
    }

    return {
      ..._proposal,
      vote: _vote,
      formattedVote
    }
  }

  const oldProposalsWithVote = useMemo(
    () =>
      oldProposals.map((_proposal, _index) =>
        prepareVote(_proposal, oldVoterStatesData ? oldVoterStatesData[_index] : null)
      ),
    [oldProposals, oldVoterStatesData]
  )

  const newProposalsWithVote = useMemo(
    () =>
      newProposals.map((_proposal, _index) =>
        prepareVote(_proposal, newVoterStatesData ? newVoterStatesData[_index] : null)
      ),
    [newProposals, newVoterStatesData]
  )

  return useMemo(
    () => [...oldProposalsWithVote, ...newProposalsWithVote].sort((_a, _b) => _b.id - _a.id),
    [oldProposalsWithVote, newProposalsWithVote]
  )
}

const useCreateProposal = () => {
  const { daoPntBalance } = useBalances()
  const { address } = useAccount()
  const [metadata, setMetadata] = useState('')
  const [script, setScript] = useState('')
  const [showScript, setShowScript] = useState(false)
  const [ipfsMultihash, setIpfsMultihash] = useState('')

  const { data } = useContractReads({
    contracts: [
      {
        address: settings.contracts.acl,
        abi: ACLAbi,
        functionName: 'hasPermission',
        args: [address, settings.contracts.dandelionVoting, getRole('CREATE_VOTES_ROLE'), '0x'],
        chainId: polygon.id
      },
      {
        address: settings.contracts.dandelionVoting,
        abi: DandelionVotingABI,
        functionName: 'minOpenVoteAmount',
        args: [],
        chainId: polygon.id
      }
    ]
  })

  const { hasPermission, minOpenVoteAmount } = useMemo(
    () => ({
      hasPermission: data && data[0] ? data[0] : false,
      minOpenVoteAmount: data && data[1] ? data[1] : '0'
    }),
    [data]
  )

  const isScriptValid = useMemo(() => isValidHexString(script), [script])
  const hasPermissionOrEnoughBalance = useMemo(
    () =>
      hasPermission ||
      BigNumber(daoPntBalance).isGreaterThanOrEqualTo(BigNumber(minOpenVoteAmount?.toString()).dividedBy(10 ** 18)),
    [hasPermission, minOpenVoteAmount, daoPntBalance]
  )

  const canCreateProposal = useMemo(
    () =>
      hasPermissionOrEnoughBalance && metadata.length > 0
        ? showScript
          ? isScriptValid && metadata.length > 0
          : true
        : false,
    [isScriptValid, showScript, hasPermissionOrEnoughBalance, metadata]
  )

  const { config: newProposalConfig } = usePrepareContractWrite({
    address: settings.contracts.dandelionVoting,
    abi: DandelionVotingABI,
    functionName: 'newVote',
    args: [
      showScript && isScriptValid ? script : '0x',
      ipfsMultihash.length > 0 ? `${metadata} https://ipfs.io/ipfs/${ipfsMultihash}` : metadata,
      false
    ],
    enabled: canCreateProposal
  })
  const {
    write: createProposal,
    error: createProposalError,
    data: createProposalData,
    isLoading
  } = useContractWrite(newProposalConfig)

  return {
    canCreateProposal,
    createProposal,
    createProposalData,
    createProposalError,
    hasPermission,
    hasPermissionOrEnoughBalance,
    ipfsMultihash,
    isLoading,
    isScriptValid,
    metadata,
    minOpenVoteAmount,
    script,
    setIpfsMultihash,
    setMetadata,
    setScript,
    setShowScript,
    showScript
  }
}

export { useCreateProposal, useFetchProposals, useProposals }
