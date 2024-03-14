import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

import settings from '../settings'

const subtractFee = (_amount) => {
  const amountBn = BigNumber(_amount.toString())
  return amountBn.minus(amountBn.multipliedBy(0.001)).toFixed()
}

const encode = (...params) => new ethers.utils.AbiCoder().encode(...params)

export const getForwarderStakeUserData = ({ amount, duration, receiverAddress }) => {
  const erc20Interface = new ethers.utils.Interface(['function approve(address spender, uint256 amount)'])
  const stakingManagerInterface = new ethers.utils.Interface([
    'function stake(address receiver, uint256 amount, uint64 duration)'
  ])

  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [settings.contracts.pntOnGnosis, settings.contracts.stakingManagerOnGnosis],
      [
        erc20Interface.encodeFunctionData('approve', [settings.contracts.stakingManagerOnGnosis, amountWithoutFees]),
        stakingManagerInterface.encodeFunctionData('stake', [receiverAddress, amountWithoutFees, duration])
      ]
    ]
  )
}
