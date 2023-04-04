import { ethers } from 'ethers'
import moment from 'moment'
import BigNumber from 'bignumber.js'

import { getNickname } from './nicknames'
import { parseSeconds } from './time'
import { formatAssetAmount } from './amount'

const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const extractActionsFromTransaction = (_transaction) => {
  const { logs } = _transaction

  const actions = logs.map(({ topics, data, address }, _index) => {
    switch (topics[0]) {
      case TRANSFER:
        const from = ethers.utils.hexStripZeros(topics[1], 32)
        const to = ethers.utils.hexStripZeros(topics[2], 32)
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
  const blocks = await Promise.all(_events.map(({ getBlock }) => getBlock()))
  return _events
    .map(({ decode, data, event, topics }) => ({ data: decode(data, topics), event }))
    .map(({ data, event }, _index) => {
      const timestamp = blocks[_index].timestamp
      const formattedDateFromNow = moment.unix(timestamp).fromNow()

      if (event === 'Staked') {
        const { amount, duration, receiver } = data
        const am = BigNumber(amount?.toString())
          .dividedBy(10 ** 18)
          .toFixed()

        return {
          amount: am,
          duration: BigNumber(duration?.toString()).toNumber(),
          formattedAmount: formatAssetAmount(am, 'PNT'),
          formattedDate: moment.unix(timestamp).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          formattedDuration: parseSeconds(duration),
          receiver,
          receiverNickname: getNickname(receiver),
          timestamp,
          type: 'Staked'
        }
      }

      if (event === 'Unstaked') {
        const { amount, owner } = data
        const am = BigNumber(amount?.toString())
          .dividedBy(10 ** 18)
          .toFixed()

        return {
          amount: am,
          formattedAmount: formatAssetAmount(am, 'PNT'),
          formattedDate: moment.unix(timestamp).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          owner,
          ownerNickname: getNickname(owner),
          timestamp,
          type: 'Unstaked'
        }
      }

      if (event === 'Lended') {
        const { amount, endEpoch, lender, startEpoch } = data
        const am = BigNumber(amount?.toString())
          .dividedBy(10 ** 18)
          .toFixed()

        return {
          amount: am,
          endEpoch: endEpoch.toNumber(),
          formattedAmount: formatAssetAmount(am, 'PNT'),
          formattedDate: moment.unix(timestamp).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          lender,
          lenderNickname: getNickname(lender),
          startEpoch: startEpoch.toNumber(),
          timestamp,
          type: 'Lended'
        }
      }

      if (event === 'StartVote') {
        const { creator, metadata, voteId } = data
        return {
          creator,
          creatorNickname: getNickname(creator),
          formattedDate: moment.unix(timestamp).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          metadata: metadata,
          timestamp,
          type: 'StartVote',
          voteId
        }
      }

      if (event === 'CastVote') {
        const { voter, voteId, supports } = data
        return {
          voter,
          voterNickname: getNickname(voter),
          formattedDate: moment.unix(timestamp).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          supports,
          timestamp,
          type: 'CastVote',
          voteId: voteId.toNumber()
        }
      }

      if (event === 'DurationIncreased') {
        const { lender, endEpoch } = data
        return {
          lender,
          lenderNickname: getNickname(lender),
          endEpoch,
          formattedDate: moment.unix(timestamp).format('MMM DD - HH:mm'),
          formattedDateFromNow,
          timestamp,
          type: 'DurationIncreased'
        }
      }

      return null
    })
    .filter((_val) => _val)
}

export { extractActionsFromTransaction, extractActivityFromEvents }
