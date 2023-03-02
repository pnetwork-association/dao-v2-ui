import { bsc, mainnet, polygon } from 'wagmi/chains'
import { erc20ABI } from 'wagmi'
import settings from '../../settings'

import PTokensVaultABI from '../abis/PTokensVault.json'
import PTokenABI from '../abis/PToken.json'
import StakingManagerABI from '../abis/StakingManager.json'
import { getForwarderStakeUserData } from '../forwarder'

const prepareContractReadAllowanceApproveStake = ({ activeChainId, address }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, settings.contracts.pTokensVault],
        chainId: mainnet.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pnt,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, settings.contracts.stakingManager],
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteApproveStake = ({ activeChainId, amount, approveEnabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20ABI,
        functionName: 'approve',
        args: [settings.contracts.pTokensVault, amount],
        enabled: approveEnabled,
        chainId: mainnet.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20ABI,
        functionName: 'approve',
        args: [settings.contracts.stakingManager, amount],
        enabled: approveEnabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteStake = ({ activeChainId, amount, duration, receiver, stakeEnabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      const peginData =
        amount && duration && receiver
          ? getForwarderStakeUserData({
              amount,
              duration,
              pntOnPolygonAddress: settings.contracts.pntOnPolygon,
              receiverAddress: receiver,
              stakingManagerAddress: settings.contracts.stakingManager
            })
          : '0x'

      return {
        address: settings.contracts.pTokensVault,
        abi: PTokensVaultABI,
        functionName: 'pegIn',
        args: [
          amount,
          settings.contracts.pntOnEthereum,
          settings.contracts.forwarderOnPolygon,
          peginData,
          '0x0075dd4c'
        ],
        enabled: stakeEnabled,
        chainId: mainnet.id
      }
    }
    case bsc.id: {
      const pegoutData =
        amount && duration && receiver
          ? getForwarderStakeUserData({
              amount,
              duration,
              pntOnPolygonAddress: settings.contracts.pntOnPolygon,
              receiverAddress: receiver,
              stakingManagerAddress: settings.contracts.stakingManager
            })
          : '0x'

      return {
        address: settings.contracts.pntOnBsc,
        abi: PTokenABI,
        functionName: 'redeem',
        args: [amount, pegoutData, settings.contracts.forwarderOnPolygon, '0x0075dd4c'],
        enabled: stakeEnabled,
        chainId: bsc.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.stakingManager,
        abi: StakingManagerABI,
        functionName: 'stake',
        args: [amount, duration, receiver],
        enabled: stakeEnabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

export { prepareContractReadAllowanceApproveStake, prepareContractWriteApproveStake, prepareContractWriteStake }
