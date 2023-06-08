import { useMemo, useState, useContext } from 'react'
import { useAccount, useBalance, useContractReads, useContractWrite, usePrepareContractWrite } from 'wagmi'
import BigNumber from 'bignumber.js'
import { mainnet, polygon } from 'wagmi/chains'

import settings from '../settings'
import DandelionVotingABI from '../utils/abis/DandelionVoting'
import DandelionVotingOldABI from '../utils/abis/DandelionVotingOld'
import ACLAbi from '../utils/abis/ACL.json'
import { getRole } from '../utils/role'
import { isValidHexString, isValidMultiHash } from '../utils/format'

import { ProposalsContext } from '../components/context/Proposals'

const useProposals = () => {
  const { proposals } = useContext(ProposalsContext)
  const { address } = useAccount()

  const oldProposals = useMemo(() => proposals.filter(({ chainId }) => chainId === mainnet.id), [proposals])
  const newProposals = useMemo(() => proposals.filter(({ chainId }) => chainId === polygon.id), [proposals])

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

  return useMemo(() => {
    // if a new proposal (on polygon) is equal to an old one (on eth) it means that
    // the proposal has been opened on both chains (daov1 & daov2) so we have to
    // keep only the polygon one
    const effectiveOldProposals = oldProposalsWithVote.filter(
      ({ multihash: oldMultihash }) =>
        !newProposalsWithVote.find(({ multihash: newMultihash }) => {
          return oldMultihash === newMultihash
        })
    )

    let proposals = [...effectiveOldProposals, ...newProposalsWithVote]
    for (let i = 0; i < proposals.length; i++) {
      if (proposals[i + 1] && proposals[i + 1].id - proposals[i].id > 1) {
        proposals[i + 1] = {
          ...proposals[i + 1],
          id: proposals[i + 1].id - 1
        }
      }
    }

    return proposals.sort((_a, _b) => _b.id - _a.id)
  }, [oldProposalsWithVote, newProposalsWithVote])
}

const useCreateProposal = () => {
  const { address } = useAccount()
  const { data: daoPntBalance } = useBalance({
    token: settings.contracts.daoPnt,
    address,
    chainId: polygon.id
  })
  const [metadata, setMetadata] = useState('')
  const [script, setScript] = useState('')
  const [showScript, setShowScript] = useState(false)
  const [ipfsMultihash, setIpfsMultihash] = useState('')

  const { data } = useContractReads({
    watch: false,
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

  const isValidIpfsMultiHash = useMemo(() => isValidMultiHash(ipfsMultihash), [ipfsMultihash])
  const isScriptValid = useMemo(() => isValidHexString(script), [script])
  const hasPermissionOrEnoughBalance = useMemo(
    () => hasPermission || BigNumber(daoPntBalance).isGreaterThanOrEqualTo(minOpenVoteAmount),
    [hasPermission, minOpenVoteAmount, daoPntBalance]
  )

  const canCreateProposal = useMemo(
    () =>
      hasPermissionOrEnoughBalance && metadata.length > 0 && isValidIpfsMultiHash
        ? showScript
          ? isScriptValid && metadata.length > 0
          : true
        : false,
    [isScriptValid, showScript, hasPermissionOrEnoughBalance, metadata, isValidIpfsMultiHash]
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
    isValidIpfsMultiHash,
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

export { useCreateProposal, useProposals }
