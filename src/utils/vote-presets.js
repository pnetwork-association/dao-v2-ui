import { ethers } from 'ethers'
import { erc20ABI } from 'wagmi'
import BigNumber from 'bignumber.js'

import VaultABI from './abis/Vault.json'
import settings from '../settings'

const getVotePresets = ({ presetParams, setPresetParams, provider }) => {
  return {
    paymentFromTreasury: {
      id: 'paymentFromTreasury',
      name: 'Payment from treasury',
      description: 'Execute a payment from the treasury',
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
          id: 'input-receiver-address',
          name: 'receiverAddress',
          component: 'Input',
          props: {
            style: {
              fontSize: 15
            },
            placeholder: 'Receiver address ...',
            value: presetParams[1] || '',
            onChange: (_e) =>
              setPresetParams({
                ...presetParams,
                1: _e.target.value
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
            value: presetParams[2] || '',
            onChange: (_e) =>
              setPresetParams({
                ...presetParams,
                2: _e.target.value
              })
          }
        }
      ],
      prepare: async () => {
        const Vault = new ethers.utils.Interface(VaultABI)
        let params = Object.values(presetParams)
        if (params.length < 2) return null

        // if presetParams[0] is null it means that the user did not change the selection
        if (!presetParams[0]) {
          params = [settings.assets[0].address, ...params]
        }

        const addressParam = params[0]
        const asset = settings.assets.find(({ address }) => address === addressParam)
        let decimals
        if (asset) {
          decimals = asset.decimals
        } else {
          // fetching decimals on chain
          const erc20 = new ethers.Contract(addressParam, erc20ABI, provider)
          decimals = await erc20.decimals()
        }

        params[2] = BigNumber(params[2])
          .multipliedBy(10 ** decimals)
          .toFixed()

        return [
          {
            to: settings.contracts.financeVault,
            calldata: Vault.encodeFunctionData('transfer', params)
          }
        ]
      }
    },
    custom: {
      id: 'custom',
      name: 'Custom - encoded script',
      description: 'Insert directly the execution script'
    }
  }
}

export { getVotePresets }
