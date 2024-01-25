import {
  dandelionVotingContract,
  distributionCreator,
  ethPNTContract,
  getCampaignPayloadFromParameters,
  pNetworkV2Vault,
  prepareInflationData,
  prepareInflationProposal
} from './utils'
import settings from '../../settings'

const propToken0PercentPreset = 45
const propToken1PercentPreset = 45
const propFeesPercentPreset = 10

const createMerklIncentive = ({ presetParams, setPresetParams }) => ({
  id: 'createMerklIncentive',
  name: 'Create Merkle Incentive',
  description: 'Inflate ethPNT and use the inflated amount to create a Merkle incentive plan',
  args: [
    {
      id: 'pool-address',
      name: 'pool-address',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'Pool address ...',
        value: presetParams[0] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            0: _e.target.value
          })
      }
    },
    {
      id: 'rewards',
      name: 'Rewards',
      component: 'Input',
      props: {
        type: 'number',
        style: {
          fontSize: 15
        },
        placeholder: 'Total Reward ...',
        value: presetParams[1] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            1: _e.target.value
          })
      }
    },
    {
      id: 'duration',
      name: 'duration-in-months',
      component: 'Input',
      props: {
        type: 'number',
        style: {
          fontSize: 15
        },
        placeholder: 'Duration in months ...',
        value: presetParams[2] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            2: _e.target.value
          })
      }
    },
    {
      id: 'distribution-formula',
      name: 'MerklDistributionFormula',
      component: 'MerklDistributionFormula',
      props: [
        {
          type: 'number',
          style: {
            fontSize: 15
          },
          placeholder: 'Insert percentage ...',
          value: presetParams[3] || propToken0PercentPreset,
          onChange: (_e) =>
            setPresetParams({
              ...presetParams,
              3: _e.target.value
            })
        },
        {
          type: 'number',
          style: {
            fontSize: 15
          },
          placeholder: 'Insert percentage ...',
          value: presetParams[4] || propToken1PercentPreset,
          onChange: (_e) =>
            setPresetParams({
              ...presetParams,
              4: _e.target.value
            })
        },
        {
          type: 'number',
          style: {
            fontSize: 15
          },
          placeholder: 'Insert percentage ...',
          value: presetParams[5] || propFeesPercentPreset,
          onChange: (_e) =>
            setPresetParams({
              ...presetParams,
              5: _e.target.value
            })
        }
      ]
    }
  ],
  prepare: async () => {
    if (Object.values(presetParams).length < 3) return null
    const poolAddress = presetParams[0]
    const totalReward = presetParams[1]
    const campaignDurationInMonths = presetParams[2]
    const propToken0Percent = presetParams[3] ? presetParams[3] : propToken0PercentPreset
    const propToken1Percent = presetParams[4] ? presetParams[4] : propToken1PercentPreset
    const propFeesPercent = presetParams[5] ? presetParams[5] : propFeesPercentPreset

    const inflationData = prepareInflationData(totalReward)

    const payload = await getCampaignPayloadFromParameters(
      poolAddress,
      inflationData.ethPNTAddress,
      inflationData.rawAmount,
      propToken0Percent,
      propToken1Percent,
      propFeesPercent,
      campaignDurationInMonths
    )

    const inflationProposal = await prepareInflationProposal(
      inflationData.ethPNTAddress,
      settings.contracts.dandelionVoting,
      inflationData.rawAmount
    )

    const approve = {
      to: inflationData.ethPNTAddress,
      calldata: ethPNTContract.encodeFunctionData('approve', [
        settings.contracts.merklDistributionCreatorAddress,
        inflationData.rawAmount
      ])
    }

    const createDistributionCalldata = {
      to: settings.contracts.merklDistributionCreatorAddress,
      calldata: distributionCreator.encodeFunctionData('createDistribution', [payload])
    }

    return [...inflationProposal, approve, createDistributionCalldata]
  }
})

export default createMerklIncentive
