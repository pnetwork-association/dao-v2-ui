import React, { createContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import BigNumber from 'bignumber.js'
import { getBlock, getClient, waitForTransactionReceipt } from '@wagmi/core'
import { gnosis, mainnet } from 'wagmi/chains'

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
  const gnosisClient = getClient(wagmiConfig, { chainId: gnosis.id })

  const fetchEtherscanAndGnosisscanProposals = async () => {
    try {
      const [
        {
          data: { result: resultEtherscan }
        },
        {
          data: { result: resultGnosisscan }
        }
      ] = await Promise.all([
        axios.get(
          `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=365841&toBlock=latest&address=${
            settings.contracts.dandelionVotingV1
          }&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${
            import.meta.env.VITE_REACT_APP_ETHERSCAN_API_KEY
          }`
        ),
        axios.get(
          `https://api.gnosisscan.io/api?module=logs&action=getLogs&fromBlock=41096385&toBlock=latest&address=${
            settings.contracts.dandelionVoting
          }&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${
            import.meta.env.VITE_REACT_APP_GNOSISSCAN_API_KEY
          }`
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
  const { etherscanProposals, gnosisscanProposals } = await fetchEtherscanAndGnosisscanProposals()

  const dandelionVotingV1_viem = getContract({
    address: settings.contracts.dandelionVotingV1,
    abi: DandelionVotingOldABI,
    client: mainnetClient
  })
  const dandelionVoting_viem = getContract({
    address: settings.contracts.dandelionVoting,
    abi: DandelionVotingABI,
    client: gnosisClient
  })

  const oldVotesData = await Promise.all(etherscanProposals.map(({ id }) => dandelionVotingV1_viem.read.getVote([id])))
  const newVotesData = await Promise.all(gnosisscanProposals.map(({ id }) => dandelionVoting_viem.read.getVote([id])))
  const oldDurationBlocks = await dandelionVotingV1_viem.read.durationBlocks()
  const newDuration = await dandelionVoting_viem.read.duration()

  const fetchExecutionBlockNumberTimestamps = async () => {
    try {
      const res = await Promise.all(
        oldVotesData
          .filter((_voteData) => _voteData)
          .map((_voteData) =>
            getBlock(wagmiConfig, {
              chainId: mainnet.id,
              blockNumber: _voteData[2] + oldDurationBlocks
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
  const oldEndlockNumberTimestamps = await fetchExecutionBlockNumberTimestamps()

  const fetchExecutionBlockLogs = async () => {
    try {
      const [
        {
          data: { result: resultEtherscan }
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
          `https://api.gnosisscan.io/api?module=logs&action=getLogs&fromBlock=16090616&toBlock=latest&address=${
            settings.contracts.dandelionVoting
          }&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&apikey=${
            import.meta.env.VITE_REACT_APP_GNOSISSCAN_API_KEY
          }`
        )
      ])

      const getActions = async (_data, _client) => {
        const eventsVoteIds = _data.reduce((_acc, _event) => {
          const voteId = BigInt(trim(_event.topics[1]))
          _acc[voteId] = _event
          return _acc
        }, {})

        const transactions = await Promise.all(
          Object.values(eventsVoteIds).map(({ transactionHash }) =>
            waitForTransactionReceipt(wagmiConfig, {
              chainId: _client.chain.id,
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
        oldVotesActions: await getActions(resultEtherscan, mainnetClient),
        newVotesActions: await getActions(resultGnosisscan, gnosisClient)
      }
    } catch (_err) {
      console.error(_err)
    }
  }
  const { oldVotesActions, newVotesActions } = await fetchExecutionBlockLogs()

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
    newVotesData?.length > 0 && gnosisscanProposals.length === newVotesData.length && newVotesData[0] && newDuration
      ? gnosisscanProposals.map((_proposal, _index) =>
          prepareNewProposal(
            _proposal,
            newVotesData[_index],
            newVotesActions && newVotesActions[_index + 1] ? newVotesActions[_index + 1] : [],
            gnosis.id,
            etherscanProposals.length,
            newDuration
          )
        )
      : []

  setProposals([...oldProposals, ...newProposals])
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
