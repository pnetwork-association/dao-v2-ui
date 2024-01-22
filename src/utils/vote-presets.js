import paymentFromTreasury from './presets/paymentFromTreasury'

const getVotePresets = ({ presetParams, setPresetParams, client, theme }) => {
  return {
    paymentFromTreasury: paymentFromTreasury({ presetParams, setPresetParams, client, theme }),
    custom: {
      id: 'custom',
      name: 'Custom - encoded script',
      description: 'Insert directly the execution script'
    }
  }
}

export { getVotePresets }
