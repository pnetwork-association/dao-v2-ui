import { getVotePresets } from '../vote-presets'
import { encodeCallScript } from '../voting-scripts'

describe('changeInflationOwner', () => {
  test('Should match the generated script', async () => {
    const presets = getVotePresets({
      presetParams: { 0: '0x0123456789012345678901234567890123456789' },
      setPresetParams: () => null,
      provider: () => null
    })
    const preset = presets['changeInflationOwner']
    const actions = await preset.prepare()
    const script = encodeCallScript(actions)

    const expectedScript =
      '0x00000001f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b20000002463d3e0f90000000000000000000000000123456789012345678901234567890123456789f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2000000246c5fbfa40000000000000000000000000123456789012345678901234567890123456789'

    expect(script).toStrictEqual(expectedScript)
  })
})
