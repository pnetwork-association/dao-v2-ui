import _ from 'lodash'
import { ethers } from 'ethers'

import { checkAddressList, computeRawAmount, getInputFields, isContract, prepareTransfer } from './utils'
import settings from '../../settings'
import BigNumber from 'bignumber.js'

const inputList = (item, index, presetParams, setPresetParams) => {
  const tokenIndex = item
  const AmountIndex = item + 1
  return [
    {
      id: `select-token-address ${index}`,
      name: 'tokenAddress',
      component: 'AssetSelection',
      props: {
        onSelect: (_address) =>
          setPresetParams({
            ...presetParams,
            [tokenIndex]: _address
          })
      }
    },
    {
      id: `input-amount ${index}`,
      name: 'amount',
      component: 'Input',
      props: {
        type: 'number',
        style: {
          fontSize: 15
        },
        placeholder: `Amount for token ${index} ...`,
        value: presetParams[AmountIndex] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            [AmountIndex]: _e.target.value
          })
      }
    }
  ]
}

const defaultInput = (presetParams, setPresetParams) => {
  return [
    {
      id: 'input-erc20-receiver-address',
      name: 'receiverAddress',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'ERC20 tokens receiver address ...',
        value: presetParams[0] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            0: _e.target.value
          })
      }
    },
    {
      id: 'input-native-receiver-address',
      name: 'receiverAddress',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'Native asset (ETH) receiver address ...',
        value: presetParams[1] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            1: _e.target.value
          })
      }
    },
    {
      id: 'input-number-of-tokens',
      name: 'number-of-tokens',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'Number of tokens to payout...',
        value: presetParams[2] || '',
        onChange: (_e) =>
          setPresetParams({
            0: presetParams[0],
            1: presetParams[1],
            2: _e.target.value
          })
      }
    }
  ]
}

const getTokenList = (data, numberOfTokens) => {
  const indexesOfTokens = Array.from({ length: numberOfTokens }, (_, i) => 3 + i * 2)
  return _.map(indexesOfTokens, (key) => _.get(data, key, settings.assets[0].address))
}

const getAmountList = (data, numberOfTokens) => {
  const indexesOfAmounts = Array.from({ length: numberOfTokens }, (_, i) => 4 + i * 2)
  return _.at(data, indexesOfAmounts)
}

function getDecimalsByAddress(address) {
  const asset = _.find(settings.assets, { address })
  if (!asset) throw new Error('asset not found for address: ' + address)
  return asset.decimals
}

const paymentsFromTreasury = ({ presetParams, setPresetParams, provider }) => ({
  id: 'paymentsFromTreasury',
  name: 'Payment from treasury of multiple tokens',
  description:
    'Execute a payment from the treasury using multiple tokens. For technical reason native assets (ETH) can only be sent to a normal account (no contract)',
  args: getInputFields(presetParams[2], presetParams, setPresetParams, defaultInput, 3, inputList, 2),
  prepare: async () => {
    let params = Object.values(presetParams)
    if (params.length < 4) return null

    const erc20RecipientAddress = presetParams[0]
    const NativeRecipientAddress = presetParams[1]
    checkAddressList([erc20RecipientAddress])
    checkAddressList([NativeRecipientAddress])
    if (await isContract(NativeRecipientAddress))
      throw new Error(
        'Native asset (ETH) receiver address is a contract. Only normal accounts (no contract) can receive native assets.'
      )

    const numberOfTokens = presetParams[2]
    const tokensList = getTokenList(presetParams, numberOfTokens)
    const amountList = getAmountList(presetParams, numberOfTokens)

    const transferAmounts = _.flattenDeep(
      tokensList.map((tokenAddress, index) => {
        const decimals = getDecimalsByAddress(tokenAddress)
        const rawAmount = computeRawAmount(amountList[index], decimals)
        const address =
          tokenAddress === '0x0000000000000000000000000000000000000000' ? NativeRecipientAddress : erc20RecipientAddress
        return prepareTransfer(tokenAddress, address, rawAmount)
      })
    )

    return [...transferAmounts]
  }
})

export default paymentsFromTreasury
