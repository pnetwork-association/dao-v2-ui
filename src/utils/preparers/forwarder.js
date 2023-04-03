import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'

import settings from '../../settings'

const encode = (...params) => new ethers.utils.AbiCoder().encode(...params)

const subtractFee = (_amount) => {
  const amountBn = BigNumber(_amount.toString())
  return amountBn.minus(amountBn.multipliedBy(0.001)).toFixed()
}

const getForwarderLendUserData = ({ amount, duration, receiverAddress }) => {
  const erc20Interface = new ethers.utils.Interface(['function approve(address spender, uint256 amount)'])
  const stakingManagerInterface = new ethers.utils.Interface([
    'function lend(address receiver, uint256 amount, uint64 duration)'
  ])
  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [settings.contracts.pntOnPolygon, settings.contracts.lendingManager],
      [
        erc20Interface.encodeFunctionData('approve', [settings.contracts.lendingManager, amountWithoutFees]),
        stakingManagerInterface.encodeFunctionData('lend', [receiverAddress, amountWithoutFees, duration])
      ]
    ]
  )
}

const getForwarderStakeUserData = ({ amount, duration, receiverAddress }) => {
  const erc20Interface = new ethers.utils.Interface(['function approve(address spender, uint256 amount)'])
  const stakingManagerInterface = new ethers.utils.Interface([
    'function stake(address receiver, uint256 amount, uint64 duration)'
  ])

  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [settings.contracts.pntOnPolygon, settings.contracts.stakingManager],
      [
        erc20Interface.encodeFunctionData('approve', [settings.contracts.stakingManager, amountWithoutFees]),
        stakingManagerInterface.encodeFunctionData('stake', [receiverAddress, amountWithoutFees, duration])
      ]
    ]
  )
}

const getForwarderUnstakeUserData = ({
  amount,
  chainId,
  receiverAddress,
  contractAddress = settings.contracts.stakingManager
}) => {
  const stakingManagerInterface = new ethers.utils.Interface([
    'function unstake(address owner, uint256 amount, bytes4 chainId)'
  ])

  encode(
    ['address[]', 'bytes[]'],
    [[contractAddress], [stakingManagerInterface.encodeFunctionData('unstake', [receiverAddress, amount, chainId])]]
  )
}

const getForwarderUpdateSentinelRegistrationByStakingUserData = ({ amount, duration, ownerAddress, signature }) => {
  const erc20Interface = new ethers.utils.Interface(['function approve(address spender, uint256 amount)'])
  const registrationManagerInterface = new ethers.utils.Interface([
    'function updateSentinelRegistrationByStaking(address owner, uint256 amount, uint64 duration, bytes signature)'
  ])

  const amountWithoutFees = subtractFee(amount)

  return encode(
    ['address[]', 'bytes[]'],
    [
      [settings.contracts.pntOnPolygon, settings.contracts.registrationManager],
      [
        erc20Interface.encodeFunctionData('approve', [settings.contracts.registrationManager, amountWithoutFees]),
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

const getForwarderVoteUserData = ({ voterAddress, id, vote }) => {
  const dandelionVotingInterface = new ethers.utils.Interface([
    'function delegateVote(address voter, uint256 _voteId, bool _supports)'
  ])
  return encode(
    ['address[]', 'bytes[]'],
    [
      [settings.contracts.dandelionVoting],
      [dandelionVotingInterface.encodeFunctionData('delegateVote', [voterAddress, id, vote])]
    ]
  )
}

const getForwarderUpdateSentinelRegistrationByBorrowingUserData = ({ ownerAddress, numberOfEpochs, signature }) => {
  const registrationManagerInterface = new ethers.utils.Interface([
    'function updateSentinelRegistrationByBorrowing(address owner, uint16 numberOfEpochs, bytes signature)'
  ])
  return encode(
    ['address[]', 'bytes[]'],
    [
      [settings.contracts.registrationManager],
      [
        registrationManagerInterface.encodeFunctionData('updateSentinelRegistrationByBorrowing', [
          ownerAddress,
          numberOfEpochs,
          signature
        ])
      ]
    ]
  )
}

const getForwarderIncreaseDurationLendUserData = ({ duration }) => {
  const borrowingManagerInterface = new ethers.utils.Interface(['function increaseDuration(uint64 duration)'])

  encode(
    ['address[]', 'bytes[]'],
    [
      [settings.contracts.lendingManager],
      [borrowingManagerInterface.encodeFunctionData('increaseDuration', [duration])]
    ]
  )
}

const getForwarderIncreaseStakingSentinelRegistrationDurationUserData = ({ duration }) => {
  const registrationManagerInterface = new ethers.utils.Interface([
    'function increaseSentinelRegistrationDuration(uint64 duration)'
  ])

  encode(
    ['address[]', 'bytes[]'],
    [
      [settings.contracts.lendingManager],
      [registrationManagerInterface.encodeFunctionData('increaseSentinelRegistrationDuration', [duration])]
    ]
  )
}

export {
  getForwarderIncreaseDurationLendUserData,
  getForwarderIncreaseStakingSentinelRegistrationDurationUserData,
  getForwarderLendUserData,
  getForwarderStakeUserData,
  getForwarderUnstakeUserData,
  getForwarderUpdateSentinelRegistrationByBorrowingUserData,
  getForwarderUpdateSentinelRegistrationByStakingUserData,
  getForwarderVoteUserData
}
