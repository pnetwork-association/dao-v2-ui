import { ethers } from 'ethers'
import { erc20ABI } from 'wagmi'
import BigNumber from 'bignumber.js'

import VaultABI from './abis/Vault.json'
import EthPNTABI from './abis/EthPNT.json'
import settings from '../settings'

const getVaultContract = () => new ethers.utils.Interface(VaultABI)
const getEthPNTContract = () => new ethers.utils.Interface(EthPNTABI)

const prepareInfaltionData = (amount) => {
  const Vault = getVaultContract()
  const EthPNT = getEthPNTContract()

  const ethPNTAsset = settings.assets.find((asset) => asset.symbol == 'ethPNT')
  if (!ethPNTAsset) throw new Error('ethPNT asset config not found!')
  const ethPNTAddress = ethPNTAsset.address
  if (!ethPNTAddress) throw new Error('ethPNT asset address not found!')
  const ethPNTDecimals = ethPNTAsset.decimals
  if (!ethPNTDecimals) throw new Error('ethPNT asset decimals not found!')

  const rawAmount = BigNumber(amount)
    .multipliedBy(10 ** ethPNTDecimals)
    .toFixed()

  return {
    Vault: Vault,
    EthPNT: EthPNT,
    rawAmount: rawAmount,
    ethPNTAddress: ethPNTAddress
  }
}

const prepareInflationProposal = async (Vault, EthPNT, ethPNTAddress, receiverAddress, rawAmount) => [
  {
    to: ethPNTAddress,
    calldata: EthPNT.encodeFunctionData('withdrawInflation', [settings.contracts.financeVault, rawAmount])
  },
  {
    to: settings.contracts.financeVault,
    calldata: Vault.encodeFunctionData('transfer', [ethPNTAddress, receiverAddress, rawAmount])
  }
]

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
    withdrawInflationToRecipient: {
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

        const inflationData = prepareInfaltionData(params[1])

        return prepareInflationProposal(
          inflationData.Vault,
          inflationData.EthPNT,
          inflationData.ethPNTAddress,
          params[0],
          inflationData.rawAmount
        )
      }
    },
    withdrawInflationToAssociation: {
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

        const inflationData = prepareInfaltionData(params[0])

        return prepareInflationProposal(
          inflationData.Vault,
          inflationData.EthPNT,
          inflationData.ethPNTAddress,
          settings.contracts.pNetworkAssociationGnosisSafeAddress,
          inflationData.rawAmount
        )
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
