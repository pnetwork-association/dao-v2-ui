import { ethers } from 'ethers'

import { prepareInflationData, prepareInflationProposal } from './utils'
import settings from '../../settings'
import { prepareChangeInflationOwnerProposal } from './changeInflationOwner'
import { prepareDepositRewardsProposal } from './withdrawInflationAndDepositRewards'

const withdrawInflationAndDepositRewardsAndChangeInflationOwner = ({ presetParams, setPresetParams }) => ({
  id: 'withdrawInflationAndDepositRewardsAndChangeInflationOwner',
  name: 'Withdraw Inflation and Deposit Rewards and Change Inflation Owner',
  description:
    'Request to withdraw requested inflated ethPNT amount to the treasury and deposit rewards for the choosen epoch and change the inflationOwner for ethPNT',
  args: [
    {
      id: 'input-amount',
      name: 'amount',
      component: 'InputAmountRewards',
      props: {
        type: 'number',
        style: {
          fontSize: 15
        },
        placeholder: 'Amount ...',
        value: presetParams[0] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            0: _e.target.value
          })
      }
    },
    {
      id: 'input-epoch',
      name: 'epoch',
      component: 'Input',
      props: {
        type: 'number',
        style: {
          fontSize: 15
        },
        placeholder: 'Epoch ...',
        value: presetParams[1] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            1: _e.target.value
          })
      }
    },
    {
      id: 'input-receiver-address',
      name: 'receiverAddress',
      component: 'InputNewInflationOwner',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'New Inflation owner address...',
        value: presetParams[2] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            2: _e.target.value
          })
      }
    }
  ],
  prepare: async () => {
    if (Object.values(presetParams).length < 3) return null
    const amount = presetParams[0]
    const epoch = presetParams[1]
    const newInflationOwnerAddress = presetParams[2]

    if (!ethers.utils.isAddress(newInflationOwnerAddress)) throw new Error('Inserted destination address is not valid')

    const inflationData = prepareInflationData(amount)
    const withdrawInflation = await prepareInflationProposal(
      inflationData.ethPNTAddress,
      settings.contracts.dandelionVoting,
      inflationData.rawAmount
    )

    const depositRewards = prepareDepositRewardsProposal(inflationData.ethPNTAddress, inflationData.rawAmount, epoch)

    const changeInflationOwner = prepareChangeInflationOwnerProposal(
      inflationData.ethPNTAddress,
      newInflationOwnerAddress
    )

    return [...withdrawInflation, ...depositRewards, ...changeInflationOwner]
  }
})

export default withdrawInflationAndDepositRewardsAndChangeInflationOwner
