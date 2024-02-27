import changeInflationOwner from './presets/changeInflationOwner'
import createMerklIncentive from './presets/createMerklIncentive'
import paymentFromTreasury from './presets/paymentFromTreasury'
import withdrawInflationAndPegin from './presets/withdrawInflationAndPegin'
import withdrawInflationToAssociation from './presets/withdrawInflationToAssociation'
import withdrawInflationToRecipient from './presets/withdrawInflationToRecipient'

const getVotePresets = ({ presetParams, setPresetParams, provider }) => {
  return {
    paymentFromTreasury: paymentFromTreasury({ presetParams, setPresetParams, provider }),
    withdrawInflationToRecipient: withdrawInflationToRecipient({ presetParams, setPresetParams }),
    withdrawInflationToAssociation: withdrawInflationToAssociation({ presetParams, setPresetParams }),
    withdrawInflationAndPegin: withdrawInflationAndPegin({ presetParams, setPresetParams }),
    createMerklIncentive: createMerklIncentive({ presetParams, setPresetParams }),
    changeInflationOwner: changeInflationOwner({ presetParams, setPresetParams }),
    custom: {
      id: 'custom',
      name: 'Custom - encoded script',
      description: 'Insert directly the execution script'
    }
  }
}

export { getVotePresets }
