import { ethers } from 'ethers'
import { ethPNTContract } from './utils'
import settings from '../../settings'

const changeInflationOwner = ({ presetParams, setPresetParams }) => ({
  id: 'changeInflationOwner',
  name: 'Change ethPNT inflation owner',
  description: 'Request to change the inflationOwner for ethPNT',
  args: [
    {
      id: 'input-receiver-address',
      name: 'receiverAddress',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'New Inflation owner ...',
        value: presetParams[0] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            0: _e.target.value
          })
      }
    }
  ],
  prepare: async () => {
    const params = Object.values(presetParams)
    if (params.length === 0) return null

    if (!ethers.utils.isAddress(params[0])) throw new Error('Inserted destination address is not valid')

    const ethPNTAsset = settings.assets.find((asset) => asset.symbol == 'ethPNT')
    if (!ethPNTAsset) throw new Error('ethPNT asset config not found!')
    const ethPNTAddress = ethPNTAsset.address

    return [
      {
        to: ethPNTAddress,
        calldata: ethPNTContract.encodeFunctionData('whitelistInflationRecipient', [params[0]])
      },
      {
        to: ethPNTAddress,
        calldata: ethPNTContract.encodeFunctionData('setInflationOwner', [params[0]])
      }
    ]
  }
})

export default changeInflationOwner
