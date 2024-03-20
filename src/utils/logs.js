import { trim } from 'viem'
import { getBlock } from '@wagmi/core'
import moment from 'moment'
import BigNumber from 'bignumber.js'

import { getNickname } from './nicknames'
import { parseSeconds } from './time'
import { formatAssetAmount } from './amount'
import wagmiConfig from './wagmiConfig'

const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const getBlockTimestamp = async (blockNumber) => {
  try {
    const block = await getBlock(wagmiConfig, { blockNumber })
    return block.timestamp
  } catch (_err) {
    console.error(_err.message)
    return null
  }
}

const extractActionsFromTransaction = (_transaction) => {
  const { logs } = _transaction

  const actions = logs.map(({ topics, data, address }, _index) => {
    switch (topics[0]) {
      case TRANSFER:
        const from = trim(topics[1], 32)
        const to = trim(topics[2], 32)
        const value = data

        return {
          address,
          from,
          fromNickname: getNickname(from),
          name: 'Transfer',
          to,
          toNickname: getNickname(to),
          value
        }
      default:
        return null
    }
  })

  return actions
}

const extractActivityFromEvents = async (_events) => {
  const blocksTimestamp = await Promise.all(_events.map(({ blockNumber }) => getBlockTimestamp(blockNumber)))
  return _events
    .map(({ args, eventName }) => ({ data: args, eventName }))
    .map(({ data, eventName }, _index) => {
      const timestamp = blocksTimestamp[_index]
      const formattedDateFromNow = moment.unix(timestamp.toString()).fromNow()

      if (eventName === 'Staked') {
        const { amount, duration, receiver } = data
        const am = BigNumber(amount?.toString())
          .dividedBy(10 ** 18)
          .toFixed()
        return {
          amount: am,
          duration: Number(duration),
          formattedAmount: formatAssetAmount(am, 'PNT', { decimals: 2 }),
          formattedDate: moment.unix(timestamp.toString()).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          formattedDuration: parseSeconds(Number(duration)),
          receiver,
          receiverNickname: getNickname(receiver),
          timestamp,
          type: 'Staked'
        }
      }

      if (eventName === 'Unstaked') {
        const { amount, receiver } = data
        const am = BigNumber(amount?.toString())
          .dividedBy(10 ** 18)
          .toFixed()

        return {
          amount: am,
          formattedAmount: formatAssetAmount(am, 'PNT'),
          formattedDate: moment.unix(timestamp.toString()).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          receiver,
          receiverNickname: getNickname(receiver),
          timestamp,
          type: 'Unstaked'
        }
      }

      if (eventName === 'Lended') {
        const { amount, endEpoch, lender, startEpoch } = data
        const am = BigNumber(amount?.toString())
          .dividedBy(10 ** 18)
          .toFixed()

        return {
          amount: am,
          endEpoch: Number(endEpoch),
          formattedAmount: formatAssetAmount(am, 'PNT'),
          formattedDate: moment.unix(timestamp.toString()).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          lender,
          lenderNickname: getNickname(lender),
          startEpoch: Number(startEpoch),
          timestamp,
          type: 'Lended'
        }
      }

      if (eventName === 'StartVote') {
        const { creator, metadata, voteId } = data
        return {
          creator,
          creatorNickname: getNickname(creator),
          formattedDate: moment.unix(timestamp.toString()).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          metadata: metadata,
          timestamp,
          type: 'StartVote',
          voteId
        }
      }

      if (eventName === 'CastVote') {
        const { voter, voteId, supports } = data
        return {
          voter,
          voterNickname: getNickname(voter),
          formattedDate: moment.unix(timestamp.toString()).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          supports,
          timestamp,
          type: 'CastVote',
          voteId: voteId.toNumber()
        }
      }

      if (eventName === 'DurationIncreased') {
        const { lender, endEpoch } = data
        return {
          lender,
          lenderNickname: getNickname(lender),
          endEpoch,
          formattedDate: moment.unix(timestamp.toString()).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          timestamp,
          type: 'DurationIncreased'
        }
      }

      if (eventName === 'SentinelRegistrationUpdated') {
        const { owner, startEpoch, endEpoch, sentinel, kind, amount } = data
        return {
          amount,
          formattedDate: moment.unix(timestamp.toString()).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          kind,
          numberOfEpochs: endEpoch - startEpoch + 1,
          owner,
          ownerNickname: getNickname(owner),
          sentinel,
          sentinelNickname: getNickname(sentinel),
          timestamp,
          type: 'SentinelRegistrationUpdated'
        }
      }

      return null
    })
    .filter((_val) => _val)
}

export { extractActionsFromTransaction, extractActivityFromEvents }
