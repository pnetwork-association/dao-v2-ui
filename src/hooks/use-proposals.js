import { useMemo, useState, useContext } from 'react'
import { useAccount, useBalance, useReadContracts, useWriteContract, useSimulateContract } from 'wagmi'
import BigNumber from 'bignumber.js'
import { gnosis, mainnet, polygon } from 'wagmi/chains'

import settings from '../settings'
import DandelionVotingABI from '../utils/abis/DandelionVoting'
import DandelionVotingOldABI from '../utils/abis/DandelionVotingOld'
import ACLAbi from '../utils/abis/ACL.json'
import { getRole } from '../utils/role'
import { isValidHexString, isValidMultiHash } from '../utils/format'

import { ProposalsContext } from '../components/context/Proposals'
import { formatAssetAmount } from '../utils/amount'

const useProposals = () => {
  const { proposals } = useContext(ProposalsContext)
  const { address } = useAccount()

  const daoV1Proposals = useMemo(() => proposals.filter(({ chainId }) => chainId === mainnet.id), [proposals])
  const daoV2Proposals = useMemo(() => proposals.filter(({ chainId }) => chainId === polygon.id), [proposals])
  const daoV3Proposals = useMemo(() => proposals.filter(({ chainId }) => chainId === gnosis.id), [proposals])

  const { data: v1VoterStatesData } = useReadContracts({
    contracts: daoV1Proposals.map(({ effectiveId }) => ({
      address: settings.contracts.dandelionVotingV1,
      abi: DandelionVotingOldABI,
      functionName: 'getVoterState',
      args: [effectiveId, address],
      chainId: mainnet.id
    }))
  })

  const { data: v2VoterStatesData } = useReadContracts({
    contracts: daoV2Proposals.map(({ effectiveId }) => ({
      address: settings.contracts.dandelionVotingV2,
      abi: DandelionVotingABI,
      functionName: 'getVoterState',
      args: [effectiveId, address],
      chainId: polygon.id
    }))
  })

  const { data: v3VoterStatesData } = useReadContracts({
    contracts: daoV3Proposals.map(({ effectiveId }) => ({
      address: settings.contracts.dandelionVotingV3,
      abi: DandelionVotingABI,
      functionName: 'getVoterState',
      args: [effectiveId, address],
      chainId: gnosis.id
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

  const daoV1ProposalsWithVote = useMemo(
    () =>
      daoV1Proposals.map((_proposal, _index) =>
        prepareVote(_proposal, v1VoterStatesData ? v1VoterStatesData[_index] : null)
      ),
    [daoV1Proposals, v1VoterStatesData]
  )

  const daoV2ProposalsWithVote = useMemo(
    () =>
      daoV2Proposals.map((_proposal, _index) =>
        prepareVote(_proposal, v2VoterStatesData ? v2VoterStatesData[_index] : null)
      ),
    [daoV2Proposals, v2VoterStatesData]
  )

  const daoV3ProposalsWithVote = useMemo(
    () =>
      daoV3Proposals.map((_proposal, _index) =>
        prepareVote(_proposal, v3VoterStatesData ? v3VoterStatesData[_index] : null)
      ),
    [daoV3Proposals, v3VoterStatesData]
  )

  return useMemo(() => {
    // if a new proposal (on polygon) is equal to an old one (on eth) it means that
    // the proposal has been opened on both chains (daov1 & daov2) so we have to
    // keep only the polygon one
    const effectiveDaoV1Proposals = daoV1ProposalsWithVote.filter(
      ({ multihash: oldMultihash }) =>
        !daoV2ProposalsWithVote.find(({ multihash: newMultihash }) => {
          return oldMultihash === newMultihash
        })
    )

    // If exists a PIP equal to a PGP, we have to indicate the exists also the PIP
    const effectiveDaoV2ProposalVotes = daoV2ProposalsWithVote.map((_proposal) => {
      const oldProposal = daoV1ProposalsWithVote.find(({ multihash: oldMultihash }) => {
        return oldMultihash === _proposal.multihash
      })

      if (!oldProposal) return _proposal

      const totalVotingPnt = _proposal.yes.plus(_proposal.no).plus(oldProposal.yes).plus(oldProposal.no)
      const totalYes = _proposal.yes.plus(oldProposal.yes)
      const totalNo = _proposal.no.plus(oldProposal.no)
      const percentageYea = totalYes.dividedBy(totalVotingPnt).multipliedBy(100)
      const percentageNay = totalNo.dividedBy(totalVotingPnt).multipliedBy(100)
      const totalYesPercentage = formatAssetAmount(percentageYea, '%', { decimals: 2 })
      const totalNoPercentage = formatAssetAmount(percentageNay, '%', { decimals: 2 })

      const minAcceptQuorum =
        _proposal.minAcceptQuorum > oldProposal.minAcceptQuorum
          ? _proposal.minAcceptQuorum
          : oldProposal.minAcceptQuorum

      const totalVotingPower = _proposal.votingPower.plus(oldProposal.votingPower)
      const totalQuorum = _proposal.yes.plus(oldProposal.yes).dividedBy(totalVotingPower)
      const biggestMinQuorum = minAcceptQuorum
      const totalQuorumReached = totalQuorum.isGreaterThan(biggestMinQuorum)
      const totalPassed = percentageYea.isGreaterThan(51) && totalQuorumReached
      const totalOpen = _proposal.open || oldProposal.open

      return {
        ..._proposal, // Copy properties from the original object
        formattedPercentageYea: totalYesPercentage,
        formattedPercentageNay: totalNoPercentage,
        quorumReached: totalQuorumReached,
        passed: totalPassed,
        open: totalOpen,
        idTextDouble: oldProposal.idText,
        votingPntDouble: oldProposal.votingPnt,
        formattedVotingPntDouble: oldProposal.formattedVotingPnt
      }
    })

    return [...effectiveDaoV1Proposals, ...effectiveDaoV2ProposalVotes, ...daoV3ProposalsWithVote].sort(
      (_a, _b) => _b.timestamp - _a.timestamp
    )
  }, [daoV1ProposalsWithVote, daoV2ProposalsWithVote])
}

const useCreateProposal = () => {
  const { address } = useAccount()
  const { data: daoPntBalance } = useBalance({
    token: settings.contracts.daoPnt,
    address,
    chainId: gnosis.id
  })
  const [metadata, setMetadata] = useState('')
  const [script, setScript] = useState('')
  const [showScript, setShowScript] = useState(false)
  const [ipfsMultihash, setIpfsMultihash] = useState('')

  const { data } = useReadContracts({
    watch: false,
    contracts: [
      {
        address: settings.contracts.acl,
        abi: ACLAbi,
        functionName: 'hasPermission',
        args: [address, settings.contracts.dandelionVotingV3, getRole('CREATE_VOTES_ROLE'), '0x'],
        chainId: gnosis.id
      },
      {
        address: settings.contracts.dandelionVotingV3,
        abi: DandelionVotingABI,
        functionName: 'minOpenVoteAmount',
        args: [],
        chainId: gnosis.id
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
  const hasPermissionOrEnoughBalance =
    hasPermission ||
    (daoPntBalance &&
      BigNumber(daoPntBalance.value.toString()).isGreaterThanOrEqualTo(BigNumber(minOpenVoteAmount.toString())))
  const canCreateProposal = useMemo(
    () =>
      hasPermissionOrEnoughBalance && metadata.length > 0 && isValidIpfsMultiHash
        ? showScript
          ? isScriptValid && metadata.length > 0
          : true
        : false,
    [isScriptValid, showScript, hasPermissionOrEnoughBalance, metadata, isValidIpfsMultiHash]
  )

  const { data: simulationNewProposalData } = useSimulateContract({
    address: settings.contracts.dandelionVotingV3,
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
    writeContract: callCreateProposal,
    error: createProposalError,
    data: createProposalData,
    isLoading
  } = useWriteContract()
  const createProposal = () => callCreateProposal(simulationNewProposalData?.request)

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
