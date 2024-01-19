import settings from '../../settings'
import { prepareInflationData, prepareInflationProposal } from './utils'

const withdrawInflationToAssociation = ({ presetParams, setPresetParams }) => ({
  id: 'withdrawInflationToAssociation',
  name: 'Withdraw Inflation to pNetwork Association',
  description: 'Withdraw requested inflated ethPNT amount from the treasury to pNetwork Association',
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
    if (params.length < 1) return null
    const inflationData = prepareInflationData(params[0])

    return prepareInflationProposal(
      inflationData.ethPNTAddress,
      settings.contracts.pNetworkAssociationGnosisSafeAddress,
      inflationData.rawAmount
    )
  }
})

export default withdrawInflationToAssociation
