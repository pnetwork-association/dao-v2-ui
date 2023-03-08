import { bsc, mainnet, polygon } from 'wagmi/chains'
import { erc20ABI } from 'wagmi'
import settings from '../../settings'

import ForwarderABI from '../abis/Forwarder.json'
import StakingManagerABI from '../abis/StakingManager.json'
import { getForwarderStakeUserData } from '../forwarder'

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

const prepareContractWriteApproveStake = ({ activeChainId, amount, approveEnabled }) => {
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
        args: [settings.contracts.stakingManager, amount],
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

const prepareContractWriteStake = ({ activeChainId, amount, duration, receiver, stakeEnabled }) => {
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
        args: [amount, settings.contracts.forwarderOnPolygon, userData, '0x0075dd4c'],
        enabled: stakeEnabled,
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
        args: [amount, settings.contracts.forwarderOnPolygon, userData, '0x0075dd4c'],
        enabled: stakeEnabled,
        chainId: bsc.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.stakingManager,
        abi: StakingManagerABI,
        functionName: 'stake',
        args: [receiver, amount, duration],
        enabled: stakeEnabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

export { prepareContractReadAllowanceApproveStake, prepareContractWriteApproveStake, prepareContractWriteStake }
