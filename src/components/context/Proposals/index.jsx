import React, { createContext, useEffect, useRef, useState } from 'react'
import { readContract, readContracts, getProvider } from '@wagmi/core'
import axios from 'axios'
import moment from 'moment'
import { mainnet, polygon } from 'wagmi/chains'
import { ethers } from 'ethers'

import { prepareNewProposal, prepareOldProposal } from '../../../utils/proposals'
import { hexToAscii } from '../../../utils/format'
import { extractActionsFromTransaction } from '../../../utils/logs'
import { extrapolateProposalData } from '../../../utils/proposals'
import settings from '../../../settings'
import DandelionVotingOldABI from '../../../utils/abis/DandelionVotingOld.json'
import DandelionVotingABI from '../../../utils/abis/DandelionVoting.json'

const fetchProposals = async ({ setProposals }) => {
  const mainnetProvider = getProvider({ chainId: mainnet.id })
  const polygonProvider = getProvider({ chainId: polygon.id })

  const fetchEtherscanAndPolygonscanProposals = async () => {
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
          `https://api.polygonscan.com/api?module=logs&action=getLogs&fromBlock=41096385&toBlock=latest&address=${settings.contracts.dandelionVoting}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${process.env.REACT_APP_POLYGONSCAN_API_KEY}`
        )
      ])

      return {
        etherscanProposals: resultEtherscan.map((_proposal, _id) => {
          const data = extrapolateProposalData(hexToAscii(_proposal.data))
          return {
            id: _id + 1,
            formattedOpenDate: moment.unix(_proposal.timeStamp).format('MMM DD YYYY - HH:mm:ss'),
            timestamp: _proposal.timeStamp,
            ...data
          }
        }),
        polygonscanProposals: resultPolygonscan.map((_proposal, _id) => {
          const data = extrapolateProposalData(hexToAscii(_proposal.data))
          return {
            id: _id + 1,
            formattedOpenDate: moment.unix(_proposal.timeStamp).format('MMM DD YYYY - HH:mm:ss'),
            timestamp: _proposal.timeStamp,
            ...data
          }
        })
      }
    } catch (_err) {
      console.error(_err)
    }
  }
  const { etherscanProposals, polygonscanProposals } = await fetchEtherscanAndPolygonscanProposals()

  const oldVotesData = await readContracts({
    contracts: etherscanProposals.map(({ id }) => ({
      address: settings.contracts.dandelionVotingOld,
      abi: DandelionVotingOldABI,
      functionName: 'getVote',
      args: [id],
      chainId: mainnet.id
    }))
  })

  const newVotesData = await readContracts({
    contracts: polygonscanProposals.map(({ id }) => ({
      address: settings.contracts.dandelionVoting,
      abi: DandelionVotingABI,
      functionName: 'getVote',
      args: [id],
      chainId: polygon.id
    }))
  })

  const oldDurationBlocks = await readContract({
    address: settings.contracts.dandelionVotingOld,
    abi: DandelionVotingOldABI,
    functionName: 'durationBlocks',
    args: [],
    chainId: mainnet.id
  })

  const newDuration = await readContract({
    address: settings.contracts.dandelionVoting,
    abi: DandelionVotingABI,
    functionName: 'duration',
    args: [],
    chainId: polygon.id
  })

  const fetchExecutionBlockNumberTimestamps = async () => {
    try {
      const res = await Promise.all(
        oldVotesData
          .filter((_voteData) => _voteData)
          .map(({ startBlock }) => mainnetProvider.getBlock(startBlock.add(oldDurationBlocks).toNumber()))
      )

      return res
        .map((_block) => _block?.timestamp)
        .sort((_b, _a) => _a - _b)
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

      return {
        oldVotesActions: await getActions(resultEtherscan, mainnetProvider),
        newVotesActions: await getActions(resultPolygonscan, polygonProvider)
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
