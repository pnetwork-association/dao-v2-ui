import { bsc, mainnet, polygon } from 'wagmi/chains'
import { erc20ABI } from 'wagmi'
import settings from '../../settings'

import ForwarderABI from '../abis/Forwarder.json'
import StakingManagerABI from '../abis/StakingManager.json'
import {
  getForwarderUpdateSentinelRegistrationByStakingUserData,
  getForwarderUpdateSentinelRegistrationByBorrowingUserData
} from './forwarder'
import { pNetworkChainIds } from '../../contants'

const prepareContractReadAllowanceApproveUpdateSentinelRegistrationByStaking = ({ activeChainId, address }) => {
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
        args: [address, settings.contracts.registrationManager],
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

const prepareContractWriteApproveUpdateSentinelRegistrationByStaking = ({ activeChainId, amount, approveEnabled }) => {
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
        args: [settings.contracts.registrationManager, amount],
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

const prepareContractWriteUpdateSentinelRegistrationByStaking = ({
  activeChainId,
  amount,
  duration,
  receiver,
  signature,
  enabled
}) => {
  switch (activeChainId) {
    case mainnet.id: {
      const userData =
        amount && duration && receiver
          ? getForwarderUpdateSentinelRegistrationByStakingUserData({
              amount,
              duration,
              ownerAddress: receiver,
              signature
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
          ? getForwarderUpdateSentinelRegistrationByStakingUserData({
              amount,
              duration,
              ownerAddress: receiver,
              signature
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

const prepareContractWriteUpdateSentinelRegistrationByBorrowing = ({
  activeChainId,
  numberOfEpochs,
  receiver,
  signature,
  enabled
}) => {
  switch (activeChainId) {
    case mainnet.id: {
      const userData =
        signature && numberOfEpochs && receiver
          ? getForwarderUpdateSentinelRegistrationByBorrowingUserData({
              ownerAddress: receiver,
              numberOfEpochs,
              signature
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
        signature && numberOfEpochs && receiver
          ? getForwarderUpdateSentinelRegistrationByBorrowingUserData({
              ownerAddress: receiver,
              numberOfEpochs,
              signature
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
        address: settings.contracts.registrationManager,
        abi: StakingManagerABI,
        functionName: 'updateSentinelRegistrationByBorrowing',
        args: [numberOfEpochs, signature],
        enabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

export {
  prepareContractReadAllowanceApproveUpdateSentinelRegistrationByStaking,
  prepareContractWriteApproveUpdateSentinelRegistrationByStaking,
  prepareContractWriteUpdateSentinelRegistrationByBorrowing,
  prepareContractWriteUpdateSentinelRegistrationByStaking
}
