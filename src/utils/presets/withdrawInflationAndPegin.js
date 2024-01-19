import { ethers } from 'ethers'

import { ethPNTContract, pNetworkV2Vault, prepareInflationData, prepareInflationProposal } from './utils'
import settings from '../../settings'

const withdrawInflationAndPegin = ({ presetParams, setPresetParams }) => ({
  id: 'withdrawInflationAndPegin',
  name: 'Withdraw Inflation and Pegin',
  description: 'Withdraw requested inflated ethPNT amount to the treasury and Pegin to an account on a different chain',
  args: [
    {
      id: 'input-amount',
      name: 'amount',
      component: 'Input',
      props: {
        type: 'number',
        style: {
          fontSize: 15
        },
        placeholder: 'Amount ...',
        value: presetParams[0] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            0: _e.target.value
          })
      }
    },
    {
      id: 'select-chain',
      name: 'destinationChain',
      component: 'ChainSelection',
      props: {
        onSelect: (_chainId) =>
          setPresetParams({
            ...presetParams,
            1: _chainId
          })
      }
    },
    {
      id: 'input-receiver-address',
      name: 'receiverAddress',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'Receiver address ...',
        value: presetParams[2] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            2: _e.target.value
          })
      }
    },
    {
      id: 'input-user-data',
      name: 'userData',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'Optional User Data ...',
        value: presetParams[3] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            3: _e.target.value
          })
      }
    }
  ],
  prepare: async () => {
    if (Object.values(presetParams).length < 2) return null
    const amount = presetParams[0]
    const destinationChainId = !presetParams[1] ? settings.chains[0].chainId : presetParams[1]
    const destinationAddress = presetParams[2]
    const userData = presetParams[3] ? presetParams[3] : '0x'

    const inflationData = prepareInflationData(amount)
    const inflationProposal = await prepareInflationProposal(
      inflationData.ethPNTAddress,
      settings.contracts.dandelionVoting,
      inflationData.rawAmount
    )

    const approve = {
      to: inflationData.ethPNTAddress,
      calldata: ethPNTContract.encodeFunctionData('approve', [
        settings.contracts.pNetworkV2EthereumVaultAddess,
        inflationData.rawAmount
      ])
    }

    const pegin = {
      to: settings.contracts.pNetworkV2EthereumVaultAddess,
      calldata: pNetworkV2Vault.encodeFunctionData('pegIn(uint256, address, string, bytes, bytes4)', [
        inflationData.rawAmount,
        inflationData.ethPNTAddress,
        destinationAddress,
        ethers.utils.arrayify(userData),
        destinationChainId
      ])
    }

    return [...inflationProposal, approve, pegin]
  }
})

export default withdrawInflationAndPegin
