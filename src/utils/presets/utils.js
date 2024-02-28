import { encodeFunctionData } from 'viem'

import EthPNTABI from '../abis/EthPNT.json'
import pNetworkV2VaultABI from '../abis/PNetworkV2Vault.json'
import pTokenV2ABI from '../abis/PTokenV2.json'
import settings from '../../settings'

export const prepareInflationData = (amount) => {
  const ethPNTAsset = settings.assets.find((asset) => asset.symbol === 'ethPNT')
  if (!ethPNTAsset) throw new Error('ethPNT asset config not found!')
  const ethPNTAddress = ethPNTAsset.address
  if (!ethPNTAddress) throw new Error('ethPNT asset address not found!')
  const ethPNTDecimals = ethPNTAsset.decimals
  if (!ethPNTDecimals) throw new Error('ethPNT asset decimals not found!')

  const rawAmount = BigInt(amount) * 10n ** BigInt(ethPNTDecimals)

  return {
    rawAmount: rawAmount,
    ethPNTAddress: ethPNTAddress
  }
}

export const prepareCrossChainInflationProposal = (
  _ethPNTAddress,
  _receiverAddress,
  _rawAmount,
  _destinationNetworkId
) => [
  [_ethPNTAddress, _ethPNTAddress, settings.contracts.pTokensVault],
  [
    encodeFunctionData({
      abi: EthPNTABI,
      functionName: 'withdrawInflation',
      args: [settings.contracts.crossExecutor, _rawAmount]
    }),
    encodeFunctionData({
      abi: EthPNTABI,
      functionName: 'approve',
      args: [settings.contracts.pTokensVault, _rawAmount]
    }),
    encodeFunctionData({
      abi: pNetworkV2VaultABI,
      functionName: 'pegIn',
      args: [_rawAmount, _ethPNTAddress, _receiverAddress, '0x', _destinationNetworkId]
    })
  ]
]

export const crossExecute = (_executorContract, _executionNetworkId, _calls) => {
  return {
    to: settings.contracts.pntOnGnosis,
    calldata: encodeFunctionData({
      abi: pTokenV2ABI,
      functionName: 'redeem',
      args: [1, _calls, _executorContract, _executionNetworkId]
    })
  }
}
