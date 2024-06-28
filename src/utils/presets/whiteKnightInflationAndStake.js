import { ethers } from 'ethers'

import { prepareInflationData, prepareInflationProposal, ethPNTContract, stakingManagerContract } from './utils'
import settings from '../../settings'

const MONTH_IN_SECONDS = 2629746

const whiteKnightInflationAndStake = ({ presetParams, setPresetParams }) => ({
  id: 'whiteKnightInflationAndStake',
  name: 'Withdraw Inflation To White Knight',
  description:
    'Withdraw inflation to white knight address and stake for 6 months. Steps: \
    1 - withdraw inflation to pNetwork Association \
    2 - approve inflated PNT spending for staking manager \
    3 - stake PNT to White Knight Account with 6 months duration.',
  args: [
    {
      id: 'input-receiver-address',
      name: 'receiverAddress',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'White Knight address ...',
        value: presetParams[1] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            1: _e.target.value
          })
      }
    },
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
    const params = Object.values(presetParams)
    if (params.length < 2) return null

    const inflationData = prepareInflationData(params[1])

    if (!ethers.utils.isAddress(params[0])) throw new Error('Inserted destination address is not valid')

    const inflationProposal = await prepareInflationProposal(
      inflationData.ethPNTAddress,
      settings.contracts.dandelionVoting,
      inflationData.rawAmount
    )

    const approve = {
      to: inflationData.ethPNTAddress,
      calldata: ethPNTContract.encodeFunctionData('approve', [
        settings.contracts.stakingManager,
        inflationData.rawAmount
      ])
    }

    const stake = {
      to: settings.contracts.stakingManager,
      calldata: stakingManagerContract.encodeFunctionData('stake', [
        inflationData.rawAmount,
        MONTH_IN_SECONDS * 6,
        params[0]
      ])
    }

    return [...inflationProposal, approve, stake]
  }
})

export default whiteKnightInflationAndStake
