import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'

const encode = (...params) => new ethers.utils.AbiCoder().encode(...params)

const getForwarderStakeUserData = ({
  amount,
  duration,
  pntOnPolygonAddress,
  receiverAddress,
  stakingManagerAddress
}) => {
  const erc20Interface = new ethers.utils.Interface(['function approve(address spender, uint256 amount)'])
  const stakingManagerInterface = new ethers.utils.Interface([
    'function stake(uint256 amount, uint64 duration, address receiver)'
  ])

  const amountBn = BigNumber(amount.toString())
  const amountWithFees = amountBn.minus(amountBn.multipliedBy(0.001)).toFixed()

  return encode(
    ['address[]', 'bytes[]'],
    [
      [pntOnPolygonAddress, stakingManagerAddress],
      [
        erc20Interface.encodeFunctionData('approve', [stakingManagerAddress, amountWithFees]),
        stakingManagerInterface.encodeFunctionData('stake', [amountWithFees, duration, receiverAddress])
      ]
    ]
  )
}

export { getForwarderStakeUserData }
