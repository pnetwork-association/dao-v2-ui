import { bsc, gnosis, mainnet, polygon } from 'wagmi/chains'
import { erc20Abi } from 'viem'
import settings from '../../settings'

import ForwarderABI from '../abis/Forwarder.json'
import StakingManagerABI from '../abis/StakingManager.json'
import { getForwarderStakeUserData, getForwarderUnstakeUserData } from './forwarder'
import { pNetworkNetworkIds } from '../../contants'

const prepareContractReadAllowanceApproveStake = ({ activeChainId, address }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnMainnet],
        chainId: mainnet.id
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.pntOnGnosis,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, settings.contracts.stakingManager],
        chainId: gnosis.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnPolygon],
        chainId: polygon.id
      }
    }
    case bsc.id: {
      return {
        address: settings.contracts.pntOnBsc,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, settings.contracts.forwarderOnBsc],
        chainId: bsc.id
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteApproveStake = ({ activeChainId, amount, account, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20Abi,
        functionName: 'approve',
        args: [settings.contracts.forwarderOnMainnet, amount],
        account: account,
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
        args: [settings.contracts.stakingManager, amount],
        account: account,
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
        account: account,
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
        account: account,
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
        args: [amount, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        chainId: bsc.id,
        query: {
          enabled: enabled
        }
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.stakingManager,
        abi: StakingManagerABI,
        functionName: 'stake',
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
          ? getForwarderStakeUserData({
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
        chainId: polygon.id,
        query: {
          enabled: enabled
        }
      }
    }
    default:
      return {}
  }
}

const prepareContractWriteUnstake = ({ activeChainId, amount, chainId, receiver, contractAddress, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      const userData =
        amount && chainId && receiver
          ? getForwarderUnstakeUserData({
              amount,
              chainId,
              receiverAddress: receiver,
              contractAddress
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
        amount && chainId && receiver
          ? getForwarderUnstakeUserData({
              amount,
              chainId,
              receiverAddress: receiver,
              contractAddress
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
    case gnosis.id: {
      return {
        address: contractAddress,
        abi: StakingManagerABI,
        functionName: 'unstake',
        args: [amount, chainId],
        chainId: gnosis.id,
        query: {
          enabled: enabled
        }
      }
    }
    case polygon.id: {
      const userData =
        amount && chainId && receiver
          ? getForwarderUnstakeUserData({
              amount,
              chainId,
              receiverAddress: receiver,
              contractAddress
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
