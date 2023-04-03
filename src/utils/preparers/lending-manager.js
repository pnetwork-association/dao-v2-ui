import { bsc, mainnet, polygon } from 'wagmi/chains'
import { erc20ABI } from 'wagmi'
import settings from '../../settings'

import ForwarderABI from '../abis/Forwarder.json'
import BorrowingManagerABI from '../abis/LendingManager.json'
import { getForwarderLendUserData, getForwarderIncreaseDurationLendUserData } from './forwarder'
import { pNetworkChainIds } from '../../contants'

const prepareContractReadAllowanceApproveLend = ({ activeChainId, address, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnMainnet],
        chainId: mainnet.id,
        enabled
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, settings.contracts.lendingManager],
        chainId: polygon.id,
        enabled
      }
    }
    case bsc.id: {
      return {
        address: settings.contracts.pntOnBsc,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnBsc],
        chainId: bsc.id,
        enabled
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteApproveLend = ({ activeChainId, amount, enabled }) => {
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
        args: [settings.contracts.lendingManager, amount],
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

const prepareContractWriteLend = ({ activeChainId, amount, duration, receiver, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      const userData =
        amount && duration && receiver
          ? getForwarderLendUserData({
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
          ? getForwarderLendUserData({
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
        address: settings.contracts.lendingManager,
        abi: BorrowingManagerABI,
        functionName: 'lend',
        args: [receiver, amount, duration],
        enabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteIncreaseLendDuration = ({ activeChainId, duration, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      const userData =
        duration > 0
          ? getForwarderIncreaseDurationLendUserData({
              duration
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
        duration > 0
          ? getForwarderIncreaseDurationLendUserData({
              duration
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
        address: settings.contracts.lendingManager,
        abi: BorrowingManagerABI,
        functionName: 'increaseDuration',
        args: [duration],
        enabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

export {
  prepareContractReadAllowanceApproveLend,
  prepareContractWriteApproveLend,
  prepareContractWriteLend,
  prepareContractWriteIncreaseLendDuration
}