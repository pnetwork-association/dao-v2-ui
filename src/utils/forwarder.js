import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'

const encode = (...params) => new ethers.utils.AbiCoder().encode(...params)

const subtractFee = (_amount) => {
  const amountBn = BigNumber(_amount.toString())
  return amountBn.minus(amountBn.multipliedBy(0.001)).toFixed()
}

const getForwarderLendUserData = ({
  amount,
  duration,
  pntOnPolygonAddress,
  receiverAddress,
  borrowingManagerAddress
}) => {
  const erc20Interface = new ethers.utils.Interface(['function approve(address spender, uint256 amount)'])
  const stakingManagerInterface = new ethers.utils.Interface([
    'function lend(address receiver, uint256 amount, uint64 duration)'
  ])
  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [pntOnPolygonAddress, borrowingManagerAddress],
      [
        erc20Interface.encodeFunctionData('approve', [borrowingManagerAddress, amountWithoutFees]),
        stakingManagerInterface.encodeFunctionData('lend', [receiverAddress, amountWithoutFees, duration])
      ]
    ]
  )
}

const getForwarderStakeUserData = ({
  amount,
  duration,
  pntOnPolygonAddress,
  receiverAddress,
  stakingManagerAddress
}) => {
  const erc20Interface = new ethers.utils.Interface(['function approve(address spender, uint256 amount)'])
  const stakingManagerInterface = new ethers.utils.Interface([
    'function stake(address receiver, uint256 amount, uint64 duration)'
  ])

  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [pntOnPolygonAddress, stakingManagerAddress],
      [
        erc20Interface.encodeFunctionData('approve', [stakingManagerAddress, amountWithoutFees]),
        stakingManagerInterface.encodeFunctionData('stake', [receiverAddress, amountWithoutFees, duration])
      ]
    ]
  )
}

const getForwarderUpdateSentinelRegistrationByStakingUserData = ({
  amount,
  duration,
  pntOnPolygonAddress,
  ownerAddress,
  registrationManagerAddress,
  signature
}) => {
  const erc20Interface = new ethers.utils.Interface(['function approve(address spender, uint256 amount)'])
  const registrationManagerInterface = new ethers.utils.Interface([
    'function updateSentinelRegistrationByStaking(address receiver, uint256 amount, uint64 duration, bytes signature)'
  ])

  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [pntOnPolygonAddress, registrationManagerAddress],
      [
        erc20Interface.encodeFunctionData('approve', [registrationManagerAddress, amountWithoutFees]),
        registrationManagerInterface.encodeFunctionData('updateSentinelRegistrationByStaking', [
          ownerAddress,
          amountWithoutFees,
          duration,
          signature
        ])
      ]
    ]
  )
}

export { getForwarderLendUserData, getForwarderStakeUserData, getForwarderUpdateSentinelRegistrationByStakingUserData }
