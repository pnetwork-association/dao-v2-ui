import { ethers } from 'ethers'

import { ethPNTContract, forwarder, rewardsManager, prepareInflationData, prepareInflationProposal } from './utils'
import settings from '../../settings'

const withdrawInflationAndDepositRewards = ({ presetParams, setPresetParams }) => ({
  id: 'withdrawInflationAndDepositRewards',
  name: 'Withdraw Inflation and Deposit Rewards',
  description: 'Withdraw requested inflated ethPNT amount to the treasury and deposit rewards for epoch',
  args: [
    {
      id: 'input-amount',
      name: 'amount',
      component: 'Input',
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
    }
  ],
  prepare: async () => {
    if (Object.values(presetParams).length < 2) return null
    const amount = presetParams[0]
    const epoch = presetParams[1]

    const inflationData = prepareInflationData(amount)
    const inflationProposal = await prepareInflationProposal(
      inflationData.ethPNTAddress,
      settings.contracts.dandelionVoting,
      inflationData.rawAmount
    )

    const approve = {
      to: inflationData.ethPNTAddress,
      calldata: ethPNTContract.encodeFunctionData('approve', [
        settings.contracts.forwarderEthPNT,
        inflationData.rawAmount
      ])
    }

    const depositRewards = new ethers.utils.AbiCoder().encode(
      ['address[]', 'bytes[]'],
      [
        [settings.contracts.pntOnGnosis, settings.contracts.rewardsManagerOnGnosis],
        [
          ethPNTContract.encodeFunctionData('approve', [settings.contracts.rewardsManagerOnGnosis, amount]),
          rewardsManager.encodeFunctionData('depositForEpoch', [epoch, amount])
        ]
      ]
    )

    const forwarderCall = {
      to: settings.contracts.forwarderEthPNT,
      calldata: forwarder.encodeFunctionData('call', [
        amount,
        settings.contracts.forwarderOnGnosis,
        depositRewards,
        settings.pnetworkIds.gnosis
      ])
    }

    return [...inflationProposal, approve, forwarderCall]
  }
})

export default withdrawInflationAndDepositRewards
