import { isAddress, encodeAbiParameters, parseAbiParameters } from 'viem'
import { GoVerified } from 'react-icons/go'

import { prepareInflationData, prepareCrossChainInflationProposal } from './utils'
import { crossExecute } from './utils'
import settings from '../../settings'

const withdrawInflationToGnosis = ({ presetParams, setPresetParams, theme }) => ({
  id: 'withdrawInflationToGnosis',
  name: 'Withdraw Inflation To Recipient in Gnosis',
  description: 'Withdraw requested inflated ethPNT amount from the treasury to Gnosis',
  args: [
    {
      id: 'input-receiver-address',
      name: 'receiverAddress',
      component: 'Input',
      props: {
        icon: isAddress(presetParams[0]) ? <GoVerified color={theme.green} /> : null,
        style: {
          fontSize: 15
        },
        placeholder: 'Receiver address on gnosis ...',
        value: presetParams[0] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            0: _e.target.value
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
    }
  ],
  prepare: async () => {
    const params = Object.values(presetParams)
    if (params.length < 2) return null

    const inflationData = prepareInflationData(params[1])

    if (!isAddress(params[0])) throw new Error('Inserted destination address is not valid')

    const inflationProposal = prepareCrossChainInflationProposal(
      inflationData.ethPNTAddress,
      params[0],
      inflationData.rawAmount,
      settings.pnetworkIds.gnosis
    )

    const encodedProposal = encodeAbiParameters(parseAbiParameters('address[], bytes[]'), inflationProposal)
    return crossExecute(settings.contracts.crossExecutor, settings.pnetworkIds.mainnet, encodedProposal)
  }
})

export default withdrawInflationToGnosis
