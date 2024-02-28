import { ethers } from 'ethers'
import { erc20ABI } from 'wagmi'
import { readContract } from '@wagmi/core'

import { getEthPNTAsset, getRawAmount, pNetworkV2Vault } from './utils'
import settings from '../../settings'

const migrateTreasuryFunds = ({ presetParams, setPresetParams }) => ({
  id: 'migrateTreasuryFunds',
  name: 'Migrate Treasury Funds',
  description: 'Pegin Treasury funds to new chain',
  args: [
    {
      id: 'select-token-address',
      name: 'tokenAddress',
      component: 'AssetSelection',
      props: {
        onSelect: (_address) =>
          setPresetParams({
            ...presetParams,
            0: _address
          })
      }
    },
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
        value: presetParams[1] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            1: _e.target.value
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
            2: _chainId
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
        placeholder: 'New Treasury Address (receiver address) ...',
        value: presetParams[3] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            3: _e.target.value
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
        value: presetParams[4] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            4: _e.target.value
          })
      }
    }
  ],
  prepare: async () => {
    if (Object.values(presetParams).length < 2) return null
    const assetAddress = presetParams[0] ? presetParams[0] : getEthPNTAsset().address
    const amount = presetParams[1]
    const destinationChainId = !presetParams[2] ? settings.chains[0].chainId : presetParams[2]
    const destinationAddress = presetParams[3]
    const userData = presetParams[4] ? presetParams[4] : '0x'

    if (!ethers.utils.isAddress(destinationAddress)) throw new Error('Inserted destination address is not valid')

    const assetDecimals = await readContract({
      address: assetAddress,
      abi: erc20ABI,
      functionName: 'decimals'
    })

    const rawAmount = getRawAmount(amount, assetDecimals)

    const pegin = {
      to: settings.contracts.pNetworkV2EthereumVaultAddess,
      calldata: pNetworkV2Vault.encodeFunctionData('pegIn(uint256, address, string, bytes, bytes4)', [
        rawAmount,
        assetAddress,
        destinationAddress,
        ethers.utils.arrayify(userData),
        destinationChainId
      ])
    }

    return [pegin]
  }
})

export default migrateTreasuryFunds
