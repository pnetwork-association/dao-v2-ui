import _ from 'lodash'
import { ethers } from 'ethers'

import {
  prepareInflationData,
  prepareWithdrawInflation,
  prepareTransfer,
  getInputFields,
  checkAddressList
} from './utils'

const inputList = (item, index, presetParams, setPresetParams) => {
  const receiverAddressIndex = item
  const AmountIndex = item + 1
  return [
    {
      id: `input-receiver-address ${index}`,
      name: 'receiverAddress',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: `Receiver address ${index} ...`,
        value: presetParams[receiverAddressIndex] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            [receiverAddressIndex]: _e.target.value
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
        placeholder: `Amount for address ${index} ...`,
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
      id: 'input-number-of-receivers',
      name: 'receiverAddress',
      component: 'Input',
      props: {
        style: {
          fontSize: 15
        },
        placeholder: 'Number of receivers ...',
        value: presetParams[0] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            0: _e.target.value
          })
      }
    }
  ]
}

const getAddressList = (presetParams) =>
  _.filter(presetParams, (element, index) => {
    return index % 2 === 0
  })

const getAmountList = (presetParams) =>
  _.filter(presetParams, (element, index) => {
    return index % 2 !== 0
  })

const withdrawInflationToRecipients = ({ presetParams, setPresetParams }) => ({
  id: 'withdrawInflationToRecipients',
  name: 'Withdraw Inflation To Multiple Recipients',
  description: 'Withdraw requested inflated ethPNT amount from the treasury',
  args: getInputFields(presetParams[0], presetParams, setPresetParams, defaultInput, 1, inputList, 2),
  prepare: async () => {
    const params = Object.values(presetParams)
    if (params.length < 3) return null

    const numberOfRecipients = params[0]
    const recipientsList = getAddressList(_.tail(params))
    const stringAmountList = getAmountList(_.tail(params))
    const amountList = _.map(stringAmountList, _.parseInt)

    if (numberOfRecipients != recipientsList.length) throw new Error('Recipient List is not correct')
    if (numberOfRecipients != amountList.length) throw new Error('Amount List is not correct')
    checkAddressList(recipientsList)

    const totalAmount = _.sum(amountList)
    const { rawAmount: rawTotalAmount, ethPNTAddress } = prepareInflationData(totalAmount)
    const withdrawInflation = prepareWithdrawInflation(ethPNTAddress, rawTotalAmount)

    const transferAmounts = _.flattenDeep(
      recipientsList.map((recipient, index) => {
        const { rawAmount } = prepareInflationData(amountList[index])
        return prepareTransfer(ethPNTAddress, recipient, rawAmount)
      })
    )

    return [...withdrawInflation, ...transferAmounts]
  }
})

export default withdrawInflationToRecipients
