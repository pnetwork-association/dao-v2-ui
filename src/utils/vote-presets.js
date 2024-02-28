import paymentFromTreasury from './presets/paymentFromTreasury'
import withdrawInflationToGnosis from './presets/withdrawInflationToGnosis'

const getVotePresets = ({ presetParams, setPresetParams, client, theme }) => {
  return {
    paymentFromTreasury: paymentFromTreasury({ presetParams, setPresetParams, client, theme }), // TODO update to new vault on gnosis when availbale
    withdrawInflationToGnosis: withdrawInflationToGnosis({ presetParams, setPresetParams, theme }),
    custom: {
      id: 'custom',
      name: 'Custom - encoded script',
      description: 'Insert directly the execution script'
    }
  }
}

export { getVotePresets }
