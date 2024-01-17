import React, { createContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import { gnosis, mainnet } from 'wagmi/chains'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { getWeb3Settings } from 'react-web3-settings'

import { prepareNewProposal, prepareOldProposal } from '../../../utils/proposals'
import { hexToAscii } from '../../../utils/format'
import { extractActionsFromTransaction } from '../../../utils/logs'
import { extrapolateProposalData } from '../../../utils/proposals'
import settings from '../../../settings'
import DandelionVotingOldABI from '../../../utils/abis/DandelionVotingOld.json'
import DandelionVotingABI from '../../../utils/abis/DandelionVoting.json'

const fetchProposals = async ({ setProposals }) => {
  const rpcSettings = getWeb3Settings()
  const mainnetProvider =
    rpcSettings.rpcEndpoints && rpcSettings.rpcEndpoints[0] !== ''
      ? new ethers.providers.JsonRpcProvider(rpcSettings.rpcEndpoints[0], mainnet.id)
      : new ethers.providers.AlchemyProvider(mainnet.id, import.meta.env.VITE_REACT_APP_ALCHEMY_ID)

  const gnosisProvider =
    rpcSettings.rpcEndpoints && rpcSettings.rpcEndpoints[3] !== ''
      ? new ethers.providers.JsonRpcProvider(rpcSettings.rpcEndpoints[3], gnosis.id)
      : new ethers.providers.JsonRpcProvider(settings.rpc.gnosis, gnosis.id)

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
          `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=365841&toBlock=latest&address=${settings.contracts.dandelionVotingV1}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${import.meta.env.VITE_REACT_APP_ETHERSCAN_API_KEY}`
        ),
        axios.get(
          `https://api.gnosisscan.io/api?module=logs&action=getLogs&fromBlock=41096385&toBlock=latest&address=${settings.contracts.dandelionVoting}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=${import.meta.env.VITE_REACT_APP_GNOSISSCAN_API_KEY}`
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

  const dandelionVotingV1 = new ethers.Contract(
    settings.contracts.dandelionVotingV1,
    DandelionVotingOldABI,
    mainnetProvider
  )
  const dandelionVotingNew = new ethers.Contract(
    settings.contracts.dandelionVoting,
    DandelionVotingABI,
    gnosisProvider
  )

  const oldVotesData = await Promise.all(etherscanProposals.map(({ id }) => dandelionVotingV1.getVote(id)))
  const newVotesData = await Promise.all(gnosisscanProposals.map(({ id }) => dandelionVotingNew.getVote(id)))
  const oldDurationBlocks = await dandelionVotingV1.durationBlocks()
  const newDuration = await dandelionVotingNew.duration()

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
          data: { result: resultGnosisscan }
        }
      ] = await Promise.all([
        axios.get(
          `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=16090616&toBlock=latest&address=${settings.contracts.dandelionVotingV1}&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&apikey=${import.meta.env.VITE_REACT_APP_ETHERSCAN_API_KEY}`
        ), // 16090616 block of the first votes containing a script
        axios.get(
           `https://api.gnosisscan.io/api?module=logs&action=getLogs&fromBlock=16090616&toBlock=latest&address=${settings.contracts.dandelionVoting}&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&apikey=${import.meta.env.VITE_REACT_APP_GNOSISSCAN_API_KEY}`
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
        newVotesActions: await getActions(resultGnosisscan, gnosisProvider)
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
