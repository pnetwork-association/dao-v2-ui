import { prepareInflationData, prepareInflationProposal } from './utils'

const withdrawInflationToRecipient = ({ presetParams, setPresetParams }) => ({
  id: 'withdrawInflationToRecipient',
  name: 'Withdraw Inflation To Recipient',
  description: 'Withdraw requested inflated ethPNT amount from the treasury',
  args: [
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
    const params = Object.values(presetParams)
    if (params.length < 2) return null

    const inflationData = prepareInflationData(params[1])

    if (!ethers.utils.isAddress(params[0])) throw new Error('Inserted destination address is not valid')

    return prepareInflationProposal(inflationData.ethPNTAddress, params[0], inflationData.rawAmount)
  }
})

export default withdrawInflationToRecipient
