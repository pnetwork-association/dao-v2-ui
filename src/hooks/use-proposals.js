import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { erc20ABI, useAccount, useBlockNumber, useContractRead, useContractReads } from 'wagmi'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import moment from 'moment'

import settings from '../settings'
import VotingABI from '../utils/abis/Voting'
import { formatAssetAmount } from '../utils/amount'
import { hexToAscii } from '../utils/format'
import { extractActionsFromTransaction } from '../utils/logs'
import { extrapolateProposalData } from '../utils/proposals'

const useProposals = () => {
  const [etherscanProposals, setEtherscanProposals] = useState([])
  const [executionBlockNumberTimestamps, setExecutionBlockNumberTimestamps] = useState([])
  const [votesActions, setVoteActions] = useState({})
  const { address } = useAccount()

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
          `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=365841&toBlock=latest&address=${settings.contracts.voting}&topic0=0x4d72fe0577a3a3f7da968d7b892779dde102519c25527b29cf7054f245c791b9&apikey=73VMNN33QYMXJ428F5KA69R35FNADTN94W`
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

    fetchProposals()
  }, [])

  const { data: votesData } = useContractReads({
    contracts: etherscanProposals.map(({ id }) => ({
      address: settings.contracts.voting,
      abi: VotingABI,
      functionName: 'getVote',
      args: [id]
    }))
  })

  useEffect(() => {
    const fetchExecutionBlockNumberTimestamps = async () => {
      try {
        const provider = new ethers.providers.InfuraProvider('homestead', process.env.REACT_APP_INFURA_KEY)
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

    fetchExecutionBlockNumberTimestamps()
  }, [votesData])

  useEffect(() => {
    const fetchExecutionBlockLogs = async () => {
      try {
        const validVotesData = votesData
          .map((_vote, _id) => ({
            ..._vote,
            id: _id + 1
          }))
          .filter(({ executed }) => executed)

        const res = await Promise.all(
          validVotesData.map(({ executionBlock, id }) => {
            return new Promise((_resolve, _reject) =>
              axios
                .get(
                  `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=${executionBlock.toNumber()}&toBlock=latest&address=${
                    settings.contracts.voting
                  }&topic0=0xbf8e2b108bb7c980e08903a8a46527699d5e84905a082d56dacb4150725c8cab&topic1=${ethers.utils.hexZeroPad(
                    ethers.utils.hexlify(id),
                    32
                  )}&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
                )
                .then(({ data }) => _resolve(data?.result[0]))
                .catch(_reject)
            )
          })
        )

        const provider = new ethers.providers.InfuraProvider('homestead', process.env.REACT_APP_INFURA_KEY)

        const transactions = await Promise.all(
          res.map(({ transactionHash }) => provider.getTransactionReceipt(transactionHash))
        )

        const actions = transactions
          .map((_transaction) => extractActionsFromTransaction(_transaction))
          .reduce((_acc, _actions, _index) => {
            _acc[validVotesData[_index]?.id] = _actions.filter((_action) => _action)
            return _acc
          }, {})

        setVoteActions(actions)
      } catch (_err) {
        console.error(_err)
      }
    }

    fetchExecutionBlockLogs()
  }, [votesData])

  const proposals = useMemo(() => {
    if (votesData?.length > 0 && etherscanProposals.length === votesData.length && votesData[0]) {
      return etherscanProposals.map((_proposal, _index) => {
        const voteData = votesData[_index]
        const { executed, executionBlock, open, script, snapshotBlock, startBlock } = voteData

        const votingPower = BigNumber(voteData.votingPower.toString()).dividedBy(10 ** 18)
        const no = BigNumber(voteData.nay.toString()).dividedBy(10 ** 18)
        const yes = BigNumber(voteData.yea.toString()).dividedBy(10 ** 18)

        const votingPnt = yes.plus(no)
        const percentageYea = yes.dividedBy(votingPnt).multipliedBy(100)
        const percentageNay = no.dividedBy(votingPnt).multipliedBy(100)

        const totalSupply = daoPntTotalSupply
          ? BigNumber(daoPntTotalSupply.toString()).dividedBy(10 ** 18)
          : BigNumber(null)
        const quorum = yes.dividedBy(totalSupply)
        const minAcceptQuorum = BigNumber(voteData.minAcceptQuorum.toString()).dividedBy(10 ** 18)

        const quorumReached = quorum.isGreaterThan(minAcceptQuorum)
        const passed = percentageYea.isGreaterThan(51) && quorumReached

        const countdown =
          currentBlockNumber < executionBlock.toNumber() ? (executionBlock.toNumber() - currentBlockNumber) * 13 : -1

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
    }

    return []
  }, [
    etherscanProposals,
    votesData,
    daoPntTotalSupply,
    currentBlockNumber,
    executionBlockNumberTimestamps,
    votesActions
  ])

  const { data: voterStatesData } = useContractReads({
    contracts: etherscanProposals.map(({ id }) => ({
      address: settings.contracts.voting,
      abi: VotingABI,
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

export { useProposals }
