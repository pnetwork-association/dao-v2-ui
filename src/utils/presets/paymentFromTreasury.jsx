import { erc20Abi, isAddress, getContract, encodeFunctionData } from 'viem'
import BigNumber from 'bignumber.js'
import { GoVerified } from 'react-icons/go'

import settings from '../../settings'
import VaultABI from '../abis/Vault.json'
import { removeCommas } from '../amount'

const paymentFromTreasury = ({ presetParams, setPresetParams, client, theme }) => ({
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
      component: 'IconedInput',
      props: {
        icon: isAddress(presetParams[1]) ? <GoVerified color={theme.green} /> : null,
        inputProps: {
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
      }
    },
    {
      id: 'input-amount',
      name: 'amount',
      component: 'NumericFormat',
      props: {
        type: 'text',
        thousandSeparator: true,
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
      const erc20 = getContract({
        address: addressParam,
        abi: erc20Abi,
        client: client
      })
      decimals = await erc20.read.decimals()
    }

    params[2] = BigNumber(removeCommas(params[2]))
      .multipliedBy(10 ** decimals)
      .toFixed()

    return {
      to: settings.contracts.financeVault,
      calldata: encodeFunctionData({
        abi: VaultABI,
        functionName: 'transfer',
        args: params
      })
    }
  }
})

export default paymentFromTreasury
