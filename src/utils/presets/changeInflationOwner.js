import { ethers } from 'ethers'
import { ethPNTContract } from './utils'
import settings from '../../settings'

export const prepareChangeInflationOwnerProposal = (ethPNTAddress, destinationAddress) => {
  return [
    {
      to: ethPNTAddress,
      calldata: ethPNTContract.encodeFunctionData('whitelistInflationRecipient', [destinationAddress])
    },
    {
      to: ethPNTAddress,
      calldata: ethPNTContract.encodeFunctionData('setInflationOwner', [destinationAddress])
    }
  ]
}

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
    if (Object.values(presetParams).length === 0) return null
    const newInflationOwnerAddress = presetParams[0]

    if (!ethers.utils.isAddress(newInflationOwnerAddress)) throw new Error('Inserted destination address is not valid')

    const ethPNTAsset = settings.assets.find((asset) => asset.symbol == 'ethPNT')
    if (!ethPNTAsset) throw new Error('ethPNT asset config not found!')
    const ethPNTAddress = ethPNTAsset.address

    return prepareChangeInflationOwnerProposal(ethPNTAddress, newInflationOwnerAddress)
  }
})

export default changeInflationOwner
