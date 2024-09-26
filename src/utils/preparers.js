import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

import settings from '../settings'
import { rewardsManager } from './presets/utils'

export const subtractFee = (_amount) => {
  const amountBn = BigInt(_amount)
  const bp = 1000n
  return (amountBn * (1000000n - bp)) / 1000000n
}

const encode = (...params) => new ethers.utils.AbiCoder().encode(...params)

export const getForwarderDepositRewardsUserData = ({ amount, epoch }) => {
  const erc20Interface = new ethers.utils.Interface(['function approve(address spender, uint256 amount)'])

  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [settings.contracts.pntOnGnosis, settings.contracts.rewardsManagerOnGnosis],
      [
        erc20Interface.encodeFunctionData('approve', [settings.contracts.rewardsManagerOnGnosis, amountWithoutFees]),
        rewardsManager.encodeFunctionData('depositForEpoch', [epoch, amountWithoutFees])
      ]
    ]
  )
}

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
