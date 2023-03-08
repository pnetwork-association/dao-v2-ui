import { bsc, mainnet, polygon } from 'wagmi/chains'
import { erc20ABI } from 'wagmi'
import settings from '../../settings'

import ForwarderABI from '../abis/Forwarder.json'
import StakingManagerABI from '../abis/StakingManager.json'
import { getForwarderStakeUserData, getForwarderUnstakeUserData } from './forwarder'
import { pNetworkChainIds } from '../../contants'

const prepareContractReadAllowanceApproveStake = ({ activeChainId, address }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnMainnet],
        chainId: mainnet.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, settings.contracts.stakingManager],
        chainId: polygon.id
      }
    }
    case bsc.id: {
      return {
        address: settings.contracts.pntOnBsc,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnBsc],
        chainId: bsc.id
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteApproveStake = ({ activeChainId, amount, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20ABI,
        functionName: 'approve',
        args: [settings.contracts.forwarderOnMainnet, amount],
        enabled,
        chainId: mainnet.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20ABI,
        functionName: 'approve',
        args: [settings.contracts.stakingManager, amount],
        enabled,
        chainId: polygon.id
      }
    }
    case bsc.id: {
      return {
        address: settings.contracts.pntOnBsc,
        abi: erc20ABI,
        functionName: 'approve',
        args: [settings.contracts.forwarderOnBsc, amount],
        enabled,
        chainId: bsc.id
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteStake = ({ activeChainId, amount, duration, receiver, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      const userData =
        amount && duration && receiver
          ? getForwarderStakeUserData({
              amount,
              duration,
              receiverAddress: receiver
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnMainnet,
        abi: ForwarderABI,
        functionName: 'call',
        args: [amount, settings.contracts.forwarderOnPolygon, userData, pNetworkChainIds.polygon],
        enabled,
        chainId: mainnet.id
      }
    }
    case bsc.id: {
      const userData =
        amount && duration && receiver
          ? getForwarderStakeUserData({
              amount,
              duration,
              receiverAddress: receiver
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnBsc,
        abi: ForwarderABI,
        functionName: 'call',
        args: [amount, settings.contracts.forwarderOnPolygon, userData, pNetworkChainIds.polygon],
        enabled,
        chainId: bsc.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.stakingManager,
        abi: StakingManagerABI,
        functionName: 'stake',
        args: [receiver, amount, duration],
        enabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteUnstake = ({ activeChainId, amount, chainId, receiver, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      const userData =
        amount && chainId && receiver
          ? getForwarderUnstakeUserData({
              amount,
              chainId,
              receiverAddress: receiver
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnMainnet,
        abi: ForwarderABI,
        functionName: 'call',
        args: [0, settings.contracts.forwarderOnPolygon, userData, pNetworkChainIds.polygon],
        enabled,
        chainId: mainnet.id
      }
    }
    case bsc.id: {
      const userData =
        amount && chainId && receiver
          ? getForwarderUnstakeUserData({
              amount,
              chainId,
              receiverAddress: receiver
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnBsc,
        abi: ForwarderABI,
        functionName: 'call',
        args: [0, settings.contracts.forwarderOnPolygon, userData, pNetworkChainIds.polygon],
        enabled,
        chainId: bsc.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.stakingManager,
        abi: StakingManagerABI,
        functionName: 'unstake',
        args: [amount],
        enabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

export {
  prepareContractReadAllowanceApproveStake,
  prepareContractWriteApproveStake,
  prepareContractWriteStake,
  prepareContractWriteUnstake
}
