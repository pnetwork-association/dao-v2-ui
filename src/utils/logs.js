import { ethers } from 'ethers'

import { getNickname } from './nicknames'

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

export { extractActionsFromTransaction }
