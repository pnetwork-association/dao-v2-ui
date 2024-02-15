import { encodeAbiParameters, encodeFunctionData, parseAbi, parseAbiParameters } from 'viem'
import BigNumber from 'bignumber.js'

import settings from '../../settings'

const subtractFee = (_amount) => {
  const amountBn = BigNumber(_amount.toString())
  return amountBn.minus(amountBn.multipliedBy(0.001)).toFixed()
}

const getForwarderLendUserData = ({ amount, duration, receiverAddress }) => {
  const amountWithoutFees = subtractFee(amount)

  return encodeAbiParameters(parseAbiParameters('address[], bytes[]'), [
    [settings.contracts.pntOnGnosis, settings.contracts.lendingManager],
    [
      encodeFunctionData({
        abi: parseAbi(['function approve(address spender, uint256 amount)']),
        functionName: 'approve',
        args: [settings.contracts.lendingManager, amountWithoutFees]
      }),
      encodeFunctionData({
        abi: parseAbi(['function lend(address receiver, uint256 amount, uint64 duration)']),
        functionName: 'lend',
        args: [receiverAddress, amountWithoutFees, duration]
      })
    ]
  ])
}

const getForwarderStakeUserData = ({ amount, duration, receiverAddress }) => {
  const amountWithoutFees = subtractFee(amount)

  return encodeAbiParameters(parseAbiParameters('address[], bytes[]'), [
    [settings.contracts.pntOnGnosis, settings.contracts.stakingManager],
    [
      encodeFunctionData({
        abi: parseAbi(['function approve(address spender, uint256 amount)']),
        functionName: 'approve',
        args: [settings.contracts.stakingManager, amountWithoutFees]
      }),
      encodeFunctionData({
        abi: parseAbi(['function stake(address receiver, uint256 amount, uint64 duration)']),
        functionName: 'stake',
        args: [receiverAddress, amountWithoutFees, duration]
      })
    ]
  ])
}

const getForwarderUnstakeUserData = ({
  amount,
  chainId,
  receiverAddress,
  contractAddress = settings.contracts.stakingManager
}) =>
  encodeAbiParameters(parseAbiParameters('address[], bytes[]'), [
    [contractAddress],
    [
      encodeFunctionData({
        abi: parseAbi(['function unstake(address owner, uint256 amount, bytes4 chainId)']),
        functionName: 'unstake',
        args: [receiverAddress, amount, chainId]
      })
    ]
  ])

const getForwarderUpdateSentinelRegistrationByStakingUserData = ({ amount, duration, ownerAddress, signature }) => {
  const amountWithoutFees = subtractFee(amount)

  return encodeAbiParameters(parseAbiParameters('address[], bytes[]'), [
    [settings.contracts.pntOnGnosis, settings.contracts.registrationManager],
    [
      encodeFunctionData({
        abi: parseAbi(['function approve(address spender, uint256 amount)']),
        functionName: 'approve',
        args: [settings.contracts.registrationManager, amountWithoutFees]
      }),
      encodeFunctionData({
        abi: parseAbi([
          'function updateSentinelRegistrationByStaking(address owner, uint256 amount, uint64 duration, bytes signature)'
        ]),
        functionName: 'updateSentinelRegistrationByStaking',
        args: [ownerAddress, amountWithoutFees, duration, signature]
      })
    ]
  ])
}

const getForwarderVoteUserData = ({ voterAddress, id, vote }) =>
  encodeAbiParameters(parseAbiParameters('address[], bytes[]'), [
    [settings.contracts.dandelionVotingV3],
    [
      encodeFunctionData({
        abi: parseAbi(['function delegateVote(address voter, uint256 _voteId, bool _supports)']),
        functionName: 'delegateVote',
        args: [voterAddress, id, vote]
      })
    ]
  ])

const getForwarderUpdateSentinelRegistrationByBorrowingUserData = ({ ownerAddress, numberOfEpochs, signature }) =>
  encodeAbiParameters(parseAbiParameters('address[], bytes[]'), [
    [settings.contracts.registrationManager],
    [
      encodeFunctionData({
        abi: parseAbi([
          'function updateSentinelRegistrationByBorrowing(address owner, uint16 numberOfEpochs, bytes signature)'
        ]),
        functionName: 'updateSentinelRegistrationByBorrowing',
        args: [ownerAddress, numberOfEpochs, signature]
      })
    ]
  ])

const getForwarderIncreaseDurationLendUserData = ({ duration }) =>
  encodeAbiParameters(parseAbiParameters('address[], bytes[]'), [
    [settings.contracts.lendingManager],
    [
      encodeFunctionData({
        abi: parseAbi(['function increaseDuration(uint64 duration)']),
        functionName: 'increaseDuration',
        args: [duration]
      })
    ]
  ])

const getForwarderIncreaseStakingSentinelRegistrationDurationUserData = ({ duration }) =>
  encodeAbiParameters(parseAbiParameters('address[], bytes[]'), [
    [settings.contracts.lendingManager],
    [
      encodeFunctionData({
        abi: parseAbi(['function increaseSentinelRegistrationDuration(uint64 duration)']),
        functionName: 'increaseSentinelRegistrationDuration',
        args: [duration]
      })
    ]
  ])

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
