import VaultABI from '../abis/Vault.json'
import EthPNTABI from '../abis/EthPNT.json'
import pNetworkV2VaultABI from '../abis/pNetworkV2Vault.json'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

import settings from '../../settings'

export const vaultContract = new ethers.utils.Interface(VaultABI)
export const ethPNTContract = new ethers.utils.Interface(EthPNTABI)
export const pNetworkV2Vault = new ethers.utils.Interface(pNetworkV2VaultABI)

export const prepareInflationData = (amount) => {
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
    rawAmount: rawAmount,
    ethPNTAddress: ethPNTAddress
  }
}

export const prepareInflationProposal = async (ethPNTAddress, receiverAddress, rawAmount) => [
  {
    to: ethPNTAddress,
    calldata: ethPNTContract.encodeFunctionData('withdrawInflation', [settings.contracts.financeVault, rawAmount])
  },
  {
    to: settings.contracts.financeVault,
    calldata: vaultContract.encodeFunctionData('transfer', [ethPNTAddress, receiverAddress, rawAmount])
  }
]
