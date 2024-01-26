import { readContract } from '@wagmi/core'
import { BigNumber } from 'ethers'

import { getVotePresets } from '../vote-presets'
import { encodeCallScript } from '../voting-scripts'

jest.mock('@wagmi/core', () => ({
  readContract: jest.fn()
}))

describe('createMerklInflation', () => {
  test('Should match the generated script', async () => {
    readContract.mockReturnValueOnce(BigNumber.from(19939)).mockReturnValueOnce(BigNumber.from(3324))
    const now = jest.spyOn(Date, 'now').mockReturnValue(1706263938885)
    const presets = getVotePresets({
      presetParams: { 0: '0x35fa1ac87b9bc3baf1ca6f0ce5f8aa560c63336b', 1: '300000', 2: '3' },
      setPresetParams: () => null,
      provider: () => null
    })
    const preset = presets['createMerklIncentive']
    const actions = await preset.prepare()
    const script = encodeCallScript(actions)

    const expectedScript =
      '0x00000001f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2000000443352d49b000000000000000000000000dd92eb1478d3189707ab7f4a5ace3a615cdd0476000000000000000000000000000000000000000000003f870857a3e0e3800000dd92eb1478d3189707ab7f4a5ace3a615cdd047600000064beabacc8000000000000000000000000f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b20000000000000000000000002211bfd97b1c02ae8ac305d206e9780ba7d8bff4000000000000000000000000000000000000000000003f870857a3e0e3800000f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b200000044095ea7b30000000000000000000000008bb4c975ff3c250e0ceea271728547f3802b36fd000000000000000000000000000000000000000000003f870857a3e0e38000008bb4c975ff3c250e0ceea271728547f3802b36fd00000284b9d81abc00000000000000000000000000000000000000000000000000000000000000208f64e5520227fad5882d70fe4c16eeb6977ed4a82c26b6cd786e9e9dfd9d06fe00000000000000000000000035fa1ac87b9bc3baf1ca6f0ce5f8aa560c63336b000000000000000000000000f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2000000000000000000000000000000000000000000003f870857a3e0e380000000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001194000000000000000000000000000000000000000000000000000000000000119400000000000000000000000000000000000000000000000000000000000003e80000000000000000000000000000000000000000000000000000000065ba2a1300000000000000000000000000000000000000000000000000000000000007e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000208f64e5520227fad5882d70fe4c16eeb6977ed4a82c26b6cd786e9e9dfd9d06fe'

    expect(script).toStrictEqual(expectedScript)
  })

  test('Should match the generated script with custom distribution formula', async () => {
    readContract.mockReturnValueOnce(BigNumber.from(19939)).mockReturnValueOnce(BigNumber.from(3324))
    const now = jest.spyOn(Date, 'now').mockReturnValue(1706263938885)
    const presets = getVotePresets({
      presetParams: { 0: '0x35fa1ac87b9bc3baf1ca6f0ce5f8aa560c63336b', 1: '300000', 2: '3', 3: '65', 4: '15', 5: '20' },
      setPresetParams: () => null,
      provider: () => null
    })
    const preset = presets['createMerklIncentive']
    const actions = await preset.prepare()
    const script = encodeCallScript(actions)

    const expectedScript =
      '0x00000001f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2000000443352d49b000000000000000000000000dd92eb1478d3189707ab7f4a5ace3a615cdd0476000000000000000000000000000000000000000000003f870857a3e0e3800000dd92eb1478d3189707ab7f4a5ace3a615cdd047600000064beabacc8000000000000000000000000f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b20000000000000000000000002211bfd97b1c02ae8ac305d206e9780ba7d8bff4000000000000000000000000000000000000000000003f870857a3e0e3800000f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b200000044095ea7b30000000000000000000000008bb4c975ff3c250e0ceea271728547f3802b36fd000000000000000000000000000000000000000000003f870857a3e0e38000008bb4c975ff3c250e0ceea271728547f3802b36fd00000284b9d81abc00000000000000000000000000000000000000000000000000000000000000208f64e5520227fad5882d70fe4c16eeb6977ed4a82c26b6cd786e9e9dfd9d06fe00000000000000000000000035fa1ac87b9bc3baf1ca6f0ce5f8aa560c63336b000000000000000000000000f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2000000000000000000000000000000000000000000003f870857a3e0e380000000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000196400000000000000000000000000000000000000000000000000000000000005dc00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000065ba2a1300000000000000000000000000000000000000000000000000000000000007e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000208f64e5520227fad5882d70fe4c16eeb6977ed4a82c26b6cd786e9e9dfd9d06fe'

    expect(script).toStrictEqual(expectedScript)
  })
})
