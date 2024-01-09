import React, { createContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import BigNumber from 'bignumber.js'
import { getBlock, getClient, waitForTransactionReceipt } from '@wagmi/core'
import { gnosis, mainnet, polygon } from 'wagmi/chains'

import { prepareNewProposal, prepareOldProposal } from '../../../utils/proposals'
import { hexToAscii } from '../../../utils/format'
import { extractActionsFromTransaction } from '../../../utils/logs'
import { extrapolateProposalData } from '../../../utils/proposals'
import settings from '../../../settings'
import DandelionVotingOldABI from '../../../utils/abis/DandelionVotingOld.json'
import DandelionVotingABI from '../../../utils/abis/DandelionVoting.json'
import wagmiConfig from '../../../utils/wagmiConfig'
import { getContract, trim } from 'viem'

const fetchProposals = async ({ setProposals }) => {
  const mainnetClient = getClient(wagmiConfig, { chainId: mainnet.id })
  const polygonClient = getClient(wagmiConfig, { chainId: polygon.id })
  const gnosisClient = getClient(wagmiConfig, { chainId: gnosis.id })

  const _fetchProposals = async () => {
    try {
      const [
        {
          data: { result: resultEtherscan }
        },
        {
          data: { result: resultPolygonscan }
        },
        {
          data: { result: resultGnosisscan }
        }
      ] = await Promise.all([
        axios.get(
          `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=365841&toBlock=latest&address=${settings.contracts.dandelionVotingV1}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
        ),
        axios.get(
          `https://api.polygonscan.com/api?module=logs&action=getLogs&fromBlock=41096385&toBlock=latest&address=${settings.contracts.dandelionVotingV2}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${process.env.REACT_APP_POLYGONSCAN_API_KEY}`
        ),
        axios.get(
          `https://api.gnosisscan.io/api?module=logs&action=getLogs&fromBlock=41096385&toBlock=latest&address=${settings.contracts.dandelionVotingV3}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${process.env.REACT_APP_GNOSISSCAN_API_KEY}`
        )
      ])

      return {
        etherscanProposals: resultEtherscan.map((_proposal, _id) => {
          const voteId = _id + 1
          const data = extrapolateProposalData(hexToAscii(_proposal.data))

          // NOTE: add missing url for vote 27
          if (voteId === 27) {
            data.url = 'https://ipfs.io/ipfs/QmUfjePnbdq5SeKTWFaaVmF1yLHDs66jSstgkVDAfVBUCr'
          }

          return {
            id: voteId,
            idText: `PIP-${voteId}`,
            formattedOpenDate: moment.unix(_proposal.timeStamp).format('MMM DD YYYY - HH:mm:ss'),
            timestamp: BigNumber(_proposal.timeStamp).toNumber(),
            ...data
          }
        }),
        polygonscanProposals: resultPolygonscan.map((_proposal, _id) => {
          const voteId = _id + 1
          const data = extrapolateProposalData(hexToAscii(_proposal.data))

          return {
            id: _id + 1,
            idText: `PGP-${voteId}`,
            formattedOpenDate: moment.unix(_proposal.timeStamp).format('MMM DD YYYY - HH:mm:ss'),
            timestamp: BigNumber(_proposal.timeStamp).toNumber(),
            ...data
          }
        }),
        gnosisscanProposals: resultGnosisscan.map((_proposal, _id) => {
          const voteId = _id + 1
          const data = extrapolateProposalData(hexToAscii(_proposal.data))

          return {
            id: _id + 1,
            idText: `PGP-${voteId}`,
            formattedOpenDate: moment.unix(_proposal.timeStamp).format('MMM DD YYYY - HH:mm:ss'),
            timestamp: BigNumber(_proposal.timeStamp).toNumber(),
            ...data
          }
        })
      }
    } catch (_err) {
      console.error(_err)
    }
  }
  const { etherscanProposals, polygonscanProposals, gnosisscanProposals } = await _fetchProposals()

  const dandelionVotingV1 = getContract({
    address: settings.contracts.dandelionVotingV1,
    abi: DandelionVotingOldABI,
    client: mainnetClient
  })
  const dandelionVotingV2 = getContract({
    address: settings.contracts.dandelionVotingV2,
    abi: DandelionVotingABI,
    client: polygonClient
  })
  const dandelionVotingV3 = getContract({
    address: settings.contracts.dandelionVotingV3,
    abi: DandelionVotingABI,
    client: gnosisClient
  })
  const v1VotesData = await Promise.all(etherscanProposals.map(({ id }) => dandelionVotingV1.read.getVote([id])))
  const v2VotesData = await Promise.all(polygonscanProposals.map(({ id }) => dandelionVotingV2.read.getVote([id])))
  const v3VotesData = await Promise.all(gnosisscanProposals.map(({ id }) => dandelionVotingV3.read.getVote([id])))
  const v1DurationBlocks = await dandelionVotingV1.read.durationBlocks()
  const v2Duration = await dandelionVotingV2.read.duration()
  const v3Duration = await dandelionVotingV3.read.duration()

  const fetchExecutionBlockNumberTimestamps = async () => {
    try {
      const res = await Promise.all(
        v1VotesData
          .filter((_voteData) => _voteData)
          .map((_voteData) =>
            getBlock(wagmiConfig, {
              chainId: mainnet.id,
              blockNumber: _voteData[2] + v1DurationBlocks
            })
          )
      )

      return res
        .map((_block) => _block?.timestamp)
        .sort((_b, _a) => Number(_a - _b))
        .reverse()
    } catch (_err) {
      console.error(_err)
    }
  }
  const v1EndlockNumberTimestamps = await fetchExecutionBlockNumberTimestamps()

  const fetchExecutionBlockLogs = async () => {
    try {
      const [
        {
          data: { result: resultEtherscan }
        },
        {
          data: { result: resultPolygonscan }
        },
        {
          data: { result: resultGnosisscan }
        }
      ] = await Promise.all([
        axios.get(
          `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=16090616&toBlock=latest&address=${
            settings.contracts.dandelionVotingV1
          }&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&apikey=${
            import.meta.env.VITE_REACT_APP_ETHERSCAN_API_KEY
          }`
        ), // 16090616 block of the first votes containing a script
        axios.get(
          `https://api.polygonscan.com/api?module=logs&action=getLogs&fromBlock=16090616&toBlock=latest&address=${
            settings.contracts.dandelionVotingV2
          }&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&apikey=${
            import.meta.env.VITE_REACT_APP_POLYGONSCAN_API_KEY
          }`
        ),
        axios.get(
          `https://api.gnosisscan.io/api?module=logs&action=getLogs&fromBlock=16090616&toBlock=latest&address=${
            settings.contracts.dandelionVotingV3
          }&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&apikey=${
            import.meta.env.VITE_REACT_APP_GNOSISSCAN_API_KEY
          }`
        )
      ])

      const getActions = async (_data, _chain) => {
        const eventsVoteIds = _data.reduce((_acc, _event) => {
          const voteId = BigInt(trim(_event.topics[1]))
          _acc[voteId] = _event
          return _acc
        }, {})

        const transactions = await Promise.all(
          Object.values(eventsVoteIds).map(({ transactionHash }) =>
            waitForTransactionReceipt(wagmiConfig, {
              chainId: _chain.id,
              hash: transactionHash
            })
          )
        )

        return Object.keys(eventsVoteIds).reduce((_acc, _voteId, _index) => {
          const transaction = transactions[_index]
          _acc[_voteId] = extractActionsFromTransaction(transaction).filter((_action) => _action)
          return _acc
        }, {})
      }
      return {
        v1VotesActions: await getActions(resultEtherscan, mainnet),
        v2VotesActions: await getActions(resultPolygonscan, polygon),
        v3VotesActions: await getActions(resultGnosisscan, gnosis)
      }
    } catch (_err) {
      console.error(_err)
    }
  }
  const { v1VotesActions, v2VotesActions, v3VotesActions } = await fetchExecutionBlockLogs()

  const daoV1Proposals =
    v1VotesData?.length > 0 && etherscanProposals.length === v1VotesData.length && v1VotesData[0] && v1DurationBlocks
      ? etherscanProposals.map((_proposal, _index) =>
          prepareOldProposal(
            _proposal,
            v1VotesData[_index],
            v1VotesActions && v1VotesActions[_index + 1] ? v1VotesActions[_index + 1] : [],
            v1EndlockNumberTimestamps[_index],
            mainnet.id,
            0,
            v1DurationBlocks
          )
        )
      : []

  const daoV2Proposals =
    v2VotesData?.length > 0 && polygonscanProposals.length === v2VotesData.length && v2VotesData[0] && v2Duration
      ? polygonscanProposals.map((_proposal, _index) =>
          prepareNewProposal(
            _proposal,
            v2VotesData[_index],
            v2VotesActions && v2VotesActions[_index + 1] ? v2VotesActions[_index + 1] : [],
            polygon.id,
            etherscanProposals.length,
            v2Duration
          )
        )
      : []

  const daoV3Proposals =
    v3VotesData?.length > 0 && polygonscanProposals.length === v3VotesData.length && v3VotesData[0] && v3Duration
      ? gnosisscanProposals.map((_proposal, _index) =>
          prepareNewProposal(
            _proposal,
            v3VotesData[_index],
            v3VotesActions && v2VotesActions[_index + 1] ? v3VotesActions[_index + 1] : [],
            gnosis.id,
            gnosisscanProposals.length,
            v3Duration
          )
        )
      : []

  setProposals([...daoV1Proposals, ...daoV2Proposals, ...daoV3Proposals])
}

export const ProposalsContext = createContext({
  proposals: [],
  setProposals: () => null
})

const ProposalsProvider = ({ children }) => {
  const [proposals, setProposals] = useState([])
  const fetched = useRef(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        fetched.current = true
        await fetchProposals({ setProposals })
      } catch (_err) {
        console.error(_err)
      }
    }
    if (!fetched.current) {
      fetch()
    }
  }, [])

  return (
    <ProposalsContext.Provider
      value={{
        proposals,
        setProposals
      }}
    >
      {children}
    </ProposalsContext.Provider>
  )
}

export default ProposalsProvider
