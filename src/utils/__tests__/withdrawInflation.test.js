import { ethers } from 'ethers'

import { getVotePresets } from '../vote-presets'
import { encodeCallScript } from '../voting-scripts'
import { ethPNTContract, pNetworkV2Vault, vaultContract } from '../presets/utils'
import BigNumber from 'bignumber.js'

const DAO_V1_VOTING_ADDRESS = '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4'
const DAO_V1_TREASURY_ADDRESS = '0xDd92eb1478D3189707aB7F4a5aCE3a615cdD0476'
const ETHPNT_ADDRESS = '0xf4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2'
const PNETWORKV2_VAULT_ADDRESS = '0xe396757ec7e6ac7c8e5abe7285dde47b98f22db8'

describe('withdrawInflationAndPegin', () => {
  const getLiquidityPoolsPresetActions = (_destinationAddress, _amount, _userData, _destinationChainId) => {
    const withdrawInflationCalldata = ethPNTContract.encodeFunctionData('withdrawInflation', [
      DAO_V1_TREASURY_ADDRESS,
      _amount
    ])

    const transferCalldata = vaultContract.encodeFunctionData('transfer', [
      ETHPNT_ADDRESS,
      DAO_V1_VOTING_ADDRESS,
      _amount
    ])

    const approveCalldata = ethPNTContract.encodeFunctionData('approve', [PNETWORKV2_VAULT_ADDRESS, _amount])

    const pegInCalldata = pNetworkV2Vault.encodeFunctionData('pegIn(uint256, address, string, bytes, bytes4)', [
      _amount,
      ETHPNT_ADDRESS,
      _destinationAddress,
      _userData,
      _destinationChainId
    ])

    return [
      { to: ETHPNT_ADDRESS, calldata: withdrawInflationCalldata },
      { to: DAO_V1_TREASURY_ADDRESS, calldata: transferCalldata },
      { to: ETHPNT_ADDRESS, calldata: approveCalldata },
      { to: PNETWORKV2_VAULT_ADDRESS, calldata: pegInCalldata }
    ]
  }

  test.each([
    {
      presetParams: { 0: '1', 1: '0x00e4b170', 2: '0xb794f5ea0ba39494ce839613fffba74279579268', 3: '0x' },
      setPresetParams: () => null,
      provider: () => null,
      selectedPreset: 'withdrawInflationAndPegin'
    },
    {
      presetParams: { 0: '1', 2: '0xb794f5ea0ba39494ce839613fffba74279579268' },
      setPresetParams: () => null,
      provider: () => null,
      selectedPreset: 'withdrawInflationAndPegin'
    },
    {
      presetParams: { 0: '1', 1: '0x00f1918e', 2: '0xb794f5ea0ba39494ce839613fffba74279579268', 3: '0xdeadbeef' },
      setPresetParams: () => null,
      provider: () => null,
      selectedPreset: 'withdrawInflationAndPegin'
    }
  ])('Should generate an encoded script', async ({ presetParams, setPresetParams, provider, selectedPreset }) => {
    const presets = getVotePresets({ presetParams, setPresetParams, provider })
    const preset = presets[selectedPreset]
    const actions = await preset.prepare()
    const script = encodeCallScript(actions)

    const rawAmount = BigNumber(presetParams[0])
      .multipliedBy(10 ** 18)
      .toFixed()

    const userData = presetParams[3] ? presetParams[3] : '0x'
    const destinationChainId = presetParams[1] ? presetParams[1] : '0x00e4b170'

    const expectedActions = getLiquidityPoolsPresetActions(
      presetParams[2],
      rawAmount,
      ethers.utils.arrayify(userData),
      destinationChainId
    )
    const expectedScript = encodeCallScript(expectedActions)
    expect(script).toStrictEqual(expectedScript)
  })
})
