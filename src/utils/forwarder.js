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
    'function lend(uint256 amount, uint64 duration, address receiver)'
  ])

  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [pntOnPolygonAddress, borrowingManagerAddress],
      [
        erc20Interface.encodeFunctionData('approve', [borrowingManagerAddress, amountWithoutFees]),
        stakingManagerInterface.encodeFunctionData('lend', [amountWithoutFees, duration, receiverAddress])
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
    'function stake(uint256 amount, uint64 duration, address receiver)'
  ])

  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [pntOnPolygonAddress, stakingManagerAddress],
      [
        erc20Interface.encodeFunctionData('approve', [stakingManagerAddress, amountWithoutFees]),
        stakingManagerInterface.encodeFunctionData('stake', [amountWithoutFees, duration, receiverAddress])
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
  const stakingManagerInterface = new ethers.utils.Interface([
    'function updateSentinelRegistrationByStaking(uint256 amount, uint64 duration, bytes signature, address receiver)'
  ])

  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [pntOnPolygonAddress, registrationManagerAddress],
      [
        erc20Interface.encodeFunctionData('approve', [registrationManagerAddress, amountWithoutFees]),
        stakingManagerInterface.encodeFunctionData('updateSentinelRegistrationByStaking', [
          amountWithoutFees,
          duration,
          signature,
          ownerAddress
        ])
      ]
    ]
  )
}

export { getForwarderLendUserData, getForwarderStakeUserData, getForwarderUpdateSentinelRegistrationByStakingUserData }
