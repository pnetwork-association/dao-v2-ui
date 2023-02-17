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

import settings from '../settings'
import DandelionVotingABI from '../utils/abis/DandelionVoting'
import { formatAssetAmount } from '../utils/amount'
import { hexToAscii } from '../utils/format'
import { extractActionsFromTransaction } from '../utils/logs'
import { extrapolateProposalData } from '../utils/proposals'
import { useBalances } from './use-balances'
import ACLAbi from '../utils/abis/ACL.json'
import { getRole } from '../utils/role'
import { isValidHexString } from '../utils/format'

import { ProposalsContext } from '../components/context/Proposals'

// hook used only by ProposalsProvider in order to store immediately the votes
const useFetchProposals = ({ setProposals }) => {
  const [etherscanProposals, setEtherscanProposals] = useState([])
  const [executionBlockNumberTimestamps, setExecutionBlockNumberTimestamps] = useState([])
  const [votesActions, setVoteActions] = useState({})
  const provider = useProvider()
  const fetched = useRef(false)

  const { data: daoPntTotalSupply } = useContractRead({
    address: settings.contracts.daoPnt,
    abi: erc20ABI,
    functionName: 'totalSupply',
    args: []
  })

  const { data: currentBlockNumber } = useBlockNumber()

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const {
          data: { result }
        } = await axios.get(
          `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=365841&toBlock=latest&address=${settings.contracts.dandelionVoting}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
        )

        setEtherscanProposals(
          result.map((_proposal, _id) => {
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

  const { data: votesData } = useContractReads({
    contracts: etherscanProposals.map(({ id }) => ({
      address: settings.contracts.dandelionVoting,
      abi: DandelionVotingABI,
      functionName: 'getVote',
      args: [id]
    }))
  })

  useEffect(() => {
    const fetchExecutionBlockNumberTimestamps = async () => {
      try {
        const res = await Promise.all(
          votesData.map(({ executionBlock }) => provider.getBlock(executionBlock.toNumber()))
        )
        const timestamps = res
          .map((_block) => _block?.timestamp)
          .sort((_b, _a) => _a - _b)
          .reverse()
        setExecutionBlockNumberTimestamps(timestamps)
      } catch (_err) {
        console.error(_err)
      }
    }

    if (votesData) {
      fetchExecutionBlockNumberTimestamps()
    }
  }, [votesData, provider])

  useEffect(() => {
    const fetchExecutionBlockLogs = async () => {
      try {
        const {
          data: { result }
        } = await axios.get(
          `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=16090616&toBlock=latest&address=${settings.contracts.dandelionVoting}&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
        ) // 16090616 block of the first votes containing a script

        const eventsVoteIds = result.reduce((_acc, _event) => {
          const voteId = ethers.BigNumber.from(ethers.utils.hexStripZeros(_event.topics[1])).toNumber()
          _acc[voteId] = _event
          return _acc
        }, {})

        const transactions = await Promise.all(
          Object.values(eventsVoteIds).map(({ transactionHash }) => provider.getTransactionReceipt(transactionHash))
        )

        const actions = Object.keys(eventsVoteIds).reduce((_acc, _voteId, _index) => {
          const transaction = transactions[_index]
          _acc[_voteId] = extractActionsFromTransaction(transaction).filter((_action) => _action)
          return _acc
        }, {})

        setVoteActions(actions)
      } catch (_err) {
        console.error(_err)
      }
    }

    fetchExecutionBlockLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setProposals(
      votesData?.length > 0 && etherscanProposals.length === votesData.length
        ? etherscanProposals.map((_proposal, _index) => {
            const voteData = votesData[_index]
            const { executed, executionBlock, open, script, snapshotBlock, startBlock } = voteData

            const votingPower = BigNumber(voteData.votingPower.toString()).dividedBy(10 ** 18)
            const no = BigNumber(voteData.nay.toString()).dividedBy(10 ** 18)
            const yes = BigNumber(voteData.yea.toString()).dividedBy(10 ** 18)

            const votingPnt = yes.plus(no)
            const percentageYea = yes.dividedBy(votingPnt).multipliedBy(100)
            const percentageNay = no.dividedBy(votingPnt).multipliedBy(100)

            const quorum = yes.dividedBy(votingPower)
            const minAcceptQuorum = BigNumber(voteData.minAcceptQuorum.toString()).dividedBy(10 ** 18)

            const quorumReached = quorum.isGreaterThan(minAcceptQuorum)
            const passed = percentageYea.isGreaterThan(51) && quorumReached

            const countdown =
              currentBlockNumber < executionBlock.toNumber()
                ? (executionBlock.toNumber() - currentBlockNumber) * 13
                : -1

            const formattedCloseDate =
              countdown > 0
                ? `~${moment.unix(moment().unix() + countdown).format('MMM DD YYYY - HH:mm:ss')}`
                : executionBlockNumberTimestamps[_index]
                ? moment.unix(executionBlockNumberTimestamps[_index]).format('MMM DD YYYY - HH:mm:ss')
                : null

            return {
              actions: votesActions && votesActions[_index + 1] ? votesActions[_index + 1] : [],
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
              minAcceptQuorum: minAcceptQuorum.toFixed(),
              no: no.toFixed(),
              open,
              passed,
              quorum: quorum.toFixed(),
              quorumReached,
              snapshotBlock: snapshotBlock.toNumber(),
              startBlock: startBlock.toNumber(),
              script,
              votingPnt,
              votingPower: votingPower.toFixed(),
              yes: yes.toFixed(),
              ..._proposal
            }
          })
        : []
    )
  }, [
    etherscanProposals,
    votesData,
    daoPntTotalSupply,
    currentBlockNumber,
    executionBlockNumberTimestamps,
    votesActions,
    setProposals
  ])
}

const useProposals = () => {
  const { proposals } = useContext(ProposalsContext)
  const { address } = useAccount()

  const { data: voterStatesData } = useContractReads({
    contracts: proposals.map(({ id }) => ({
      address: settings.contracts.dandelionVoting,
      abi: DandelionVotingABI,
      functionName: 'getVoterState',
      args: [id, address]
    }))
  })

  const proposalsWithVote = useMemo(
    () =>
      proposals
        .map((_proposal, _index) => {
          const vote = voterStatesData ? voterStatesData[_index] : null
          let formattedVote
          switch (vote) {
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
            vote,
            formattedVote
          }
        })
        .sort((_a, _b) => _b.id - _a.id),
    [proposals, voterStatesData]
  )

  return proposalsWithVote
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
        args: [address, settings.contracts.dandelionVoting, getRole('CREATE_VOTES_ROLE'), '0x']
      },
      {
        address: settings.contracts.dandelionVoting,
        abi: DandelionVotingABI,
        functionName: 'minOpenVoteAmount',
        args: []
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
