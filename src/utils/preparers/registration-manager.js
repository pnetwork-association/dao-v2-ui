import { bsc, gnosis, mainnet, polygon } from 'wagmi/chains'
import { erc20Abi } from 'viem'
import settings from '../../settings'

import ForwarderABI from '../abis/Forwarder.json'
import RegistrationManagerABI from '../abis/RegistrationManager.json'
import {
  getForwarderUpdateSentinelRegistrationByStakingUserData,
  getForwarderUpdateSentinelRegistrationByBorrowingUserData,
  getForwarderIncreaseStakingSentinelRegistrationDurationUserData
} from './forwarder'
import { pNetworkNetworkIds } from '../../contants'
import { isValidHexString } from '../format'

const prepareContractReadAllowanceApproveUpdateSentinelRegistrationByStaking = ({ activeChainId, address }) => {
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
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, settings.contracts.registrationManager],
        chainId: gnosis.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, settings.contracts.registrationManager],
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

const prepareContractWriteApproveUpdateSentinelRegistrationByStaking = ({ activeChainId, amount, approveEnabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      return {
        address: settings.contracts.pntOnEthereum,
        abi: erc20Abi,
        functionName: 'approve',
        args: [settings.contracts.forwarderOnMainnet, amount],
        enabled: approveEnabled,
        chainId: mainnet.id
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.pntOnGnosis,
        abi: erc20ABI,
        functionName: 'approve',
        args: [settings.contracts.registrationManager, amount],
        enabled: approveEnabled,
        chainId: gnosis.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.pntOnPolygon,
        abi: erc20Abi,
        functionName: 'approve',
        args: [settings.contracts.registrationManager, amount],
        enabled: approveEnabled,
        chainId: polygon.id
      }
    }
    case bsc.id: {
      return {
        address: settings.contracts.pntOnBsc,
        abi: erc20Abi,
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
        amount && duration && receiver && isValidHexString(signature)
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
        args: [amount, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        enabled,
        chainId: mainnet.id
      }
    }
    case bsc.id: {
      const userData =
        amount && duration && receiver && isValidHexString(signature)
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
        args: [amount, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        enabled,
        chainId: bsc.id
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.registrationManager,
        abi: RegistrationManagerABI,
        functionName: 'updateSentinelRegistrationByStaking',
        args: [receiver, amount, duration, isValidHexString(signature) ? signature : '0x'],
        enabled,
        chainId: gnosis.id
      }
    }
    case polygon.id: {
      const userData =
        amount && duration && receiver && isValidHexString(signature)
          ? getForwarderUpdateSentinelRegistrationByStakingUserData({
              amount,
              duration,
              ownerAddress: receiver,
              signature
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnPolygon,
        abi: ForwarderABI,
        functionName: 'call',
        args: [amount, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
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
        isValidHexString(signature) && numberOfEpochs && receiver
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
        args: [0, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        enabled,
        chainId: mainnet.id
      }
    }
    case bsc.id: {
      const userData =
        isValidHexString(signature) && numberOfEpochs && receiver
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
        args: [0, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        enabled,
        chainId: bsc.id
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.registrationManager,
        abi: RegistrationManagerABI,
        functionName: 'updateSentinelRegistrationByBorrowing',
        args: [numberOfEpochs, signature],
        enabled,
        chainId: gnosis.id
      }
    }
    case polygon.id: {
      const userData =
        isValidHexString(signature) && numberOfEpochs && receiver
          ? getForwarderUpdateSentinelRegistrationByBorrowingUserData({
              ownerAddress: receiver,
              numberOfEpochs,
              signature
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnPolygon,
        abi: ForwarderABI,
        functionName: 'call',
        args: [0, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        enabled,
        chainId: polygon.id
      }
    }
    default:
      return {}
  }
}

export const prepareContractWriteIncreaseStakingSentinelRegistrationDuration = ({
  activeChainId,
  duration,
  enabled
}) => {
  switch (activeChainId) {
    case mainnet.id: {
      const userData =
        duration > 0
          ? getForwarderIncreaseStakingSentinelRegistrationDurationUserData({
              duration
            })
          : '0x'
      return {
        address: settings.contracts.forwarderOnMainnet,
        abi: ForwarderABI,
        functionName: 'call',
        args: [0, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        enabled,
        chainId: mainnet.id
      }
    }
    case bsc.id: {
      const userData =
        duration > 0
          ? getForwarderIncreaseStakingSentinelRegistrationDurationUserData({
              duration
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnBsc,
        abi: ForwarderABI,
        functionName: 'call',
        args: [0, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
        enabled,
        chainId: bsc.id
      }
    }
    case gnosis.id: {
      return {
        address: settings.contracts.registrationManager,
        abi: RegistrationManagerABI,
        functionName: 'increaseSentinelRegistrationDuration',
        args: [duration],
        enabled,
        chainId: gnosis.id
      }
    }
    case polygon.id: {
      const userData =
        duration > 0
          ? getForwarderIncreaseStakingSentinelRegistrationDurationUserData({
              duration
            })
          : '0x'

      return {
        address: settings.contracts.forwarderOnPolygon,
        abi: ForwarderABI,
        functionName: 'call',
        args: [0, settings.contracts.forwarderOnGnosis, userData, pNetworkNetworkIds.gnosis],
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
