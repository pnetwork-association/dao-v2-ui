import { getVotePresets } from '../vote-presets'
import { encodeCallScript } from '../voting-scripts'

describe('paymentFromTreasury', () => {
  test('Should match the generated script', async () => {
    const presets = getVotePresets({
      presetParams: {
        0: '0xf4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2',
        1: '0xf1f6568a76559d85cF68E6597fA587544184dD46',
        2: '1'
      },
      setPresetParams: () => null,
      client: () => null,
      theme: { green: '#0CCE6B' }
    })
    console.log('b')
    const preset = presets['paymentFromTreasury']
    const actions = await preset.prepare()
    const script = encodeCallScript(actions)

    const expectedScript =
      '0x00000001139ad01cacbbe51b4a2b099e52c47693ba87351b00000064beabacc8000000000000000000000000f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2000000000000000000000000f1f6568a76559d85cf68e6597fa587544184dd460000000000000000000000000000000000000000000000000de0b6b3a7640000'

    expect(script).toStrictEqual(expectedScript)
  })
})
