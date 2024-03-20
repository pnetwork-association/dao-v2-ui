import { bsc, gnosis, mainnet, polygon } from 'wagmi/chains'
import { erc20Abi } from 'viem'
import settings from '../../settings'

import ForwarderABI from '../abis/Forwarder.json'
import LendingManagerABI from '../abis/LendingManager.json'
import { getForwarderLendUserData, getForwarderIncreaseDurationLendUserData } from './forwarder'
import { pNetworkNetworkIds } from '../../contants'

const prepareContractReadAllowanceApproveLend = ({ activeChainId, address, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnMainnet],
        chainId: mainnet.id,
        query: {
          enabled: enabled
        }
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.pntOnGnosis,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, settings.contracts.lendingManager],
        chainId: gnosis.id,
        query: {
          enabled: enabled
        }
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnPolygon],
        chainId: polygon.id,
        query: {
          enabled: enabled
        }
      }
    }
    case bsc.id: {
      return {
        address: settings.contracts.pntOnBsc,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnBsc],
        chainId: bsc.id,
        query: {
          enabled: enabled
        }
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
        abi: erc20Abi,
        functionName: 'approve',
        args: [settings.contracts.forwarderOnMainnet, amount],
        chainId: mainnet.id,
        query: {
          enabled: enabled
        }
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.pntOnGnosis,
        abi: erc20Abi,
        functionName: 'approve',
        args: [settings.contracts.lendingManager, amount],
        chainId: gnosis.id,
        query: {
          enabled: enabled
        }
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20Abi,
        functionName: 'approve',
        args: [settings.contracts.forwarderOnPolygon, amount],
        chainId: polygon.id,
        query: {
          enabled: enabled
        }
      }
    }
    case bsc.id: {
      return {
        address: settings.contracts.pntOnBsc,
        abi: erc20Abi,
        functionName: 'approve',
        args: [settings.contracts.forwarderOnBsc, amount],
        chainId: bsc.id,
        query: {
          enabled: enabled
        }
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
        args: [amount, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        chainId: mainnet.id,
        query: {
          enabled: enabled
        }
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
        args: [amount, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        chainId: bsc.id,
        query: {
          enabled: enabled
        }
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'lend',
        args: [receiver, amount, duration],
        chainId: gnosis.id,
        query: {
          enabled: enabled
        }
      }
    }
    case polygon.id: {
      const userData =
        amount && duration && receiver
          ? getForwarderLendUserData({
              amount,
              duration,
              receiverAddress: receiver
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnPolygon,
        abi: ForwarderABI,
        functionName: 'call',
        args: [amount, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        chainId: gnosis.id,
        query: {
          enabled: enabled
        }
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
        args: [0, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        chainId: mainnet.id,
        query: {
          enabled: enabled
        }
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
        args: [0, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        chainId: bsc.id,
        query: {
          enabled: enabled
        }
      }
    }
    case polygon.id: {
      const userData =
        duration > 0
          ? getForwarderIncreaseDurationLendUserData({
              duration
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnPolygon,
        abi: ForwarderABI,
        functionName: 'call',
        args: [0, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        chainId: polygon.id,
        query: {
          enabled: enabled
        }
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.lendingManager,
        abi: LendingManagerABI,
        functionName: 'increaseDuration',
        args: [duration],
        chainId: gnosis.id,
        query: {
          enabled: enabled
        }
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
