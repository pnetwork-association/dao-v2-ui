import { ethers } from 'ethers'

const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const extractActionsFromTransaction = (_transaction) => {
  const { logs } = _transaction

  const actions = logs.map(({ topics, data, address }, _index) => {
    switch (topics[0]) {
      case TRANSFER:
        const from = topics[1]
        const to = topics[2]
        const value = data

        return {
          name: 'Transfer',
          from: ethers.utils.hexStripZeros(from, 32),
          to: ethers.utils.hexStripZeros(to, 32),
          value,
          address
        }
      default:
        return null
    }
  })

  return actions
}

export { extractActionsFromTransaction }
