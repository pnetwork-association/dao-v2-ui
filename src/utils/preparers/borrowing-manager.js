import { bsc, mainnet, polygon } from 'wagmi/chains'
import { erc20ABI } from 'wagmi'
import settings from '../../settings'

import ForwarderABI from '../abis/Forwarder.json'
import StakingManagerABI from '../abis/StakingManager.json'
import { getForwarderLendUserData } from '../forwarder'

const prepareContractReadAllowanceApproveLend = ({ activeChainId, address }) => {
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
        args: [address, settings.contracts.borrowingManager],
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

const prepareContractWriteApproveLend = ({ activeChainId, amount, approveEnabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20ABI,
        functionName: 'approve',
        args: [settings.contracts.forwarderOnMainnet, amount],
        enabled: approveEnabled,
        chainId: mainnet.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20ABI,
        functionName: 'approve',
        args: [settings.contracts.borrowingManager, amount],
        enabled: approveEnabled,
        chainId: polygon.id
      }
    }
    case bsc.id: {
      return {
        address: settings.contracts.pntOnBsc,
        abi: erc20ABI,
        functionName: 'approve',
        args: [settings.contracts.forwarderOnBsc, amount],
        enabled: approveEnabled,
        chainId: bsc.id
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteLend = ({ activeChainId, amount, duration, receiver, lendEnabled }) => {
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
        args: [amount, settings.contracts.forwarderOnPolygon, userData, '0x0075dd4c'],
        enabled: lendEnabled,
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
        args: [amount, settings.contracts.forwarderOnPolygon, userData, '0x0075dd4c'],
        enabled: lendEnabled,
        chainId: bsc.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.borrowingManager,
        abi: StakingManagerABI,
        functionName: 'lend',
        args: [receiver, amount, duration],
        enabled: lendEnabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

export { prepareContractReadAllowanceApproveLend, prepareContractWriteApproveLend, prepareContractWriteLend }
