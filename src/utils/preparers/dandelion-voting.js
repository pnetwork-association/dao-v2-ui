import { bsc, mainnet, gnosis, polygon } from 'wagmi/chains'
import settings from '../../settings'
import { pNetworkNetworkIds } from '../../contants'
import DandelionVotingABI from '../../utils/abis/DandelionVoting.json'
import ForwarderABI from '../abis/Forwarder.json'
import { getForwarderVoteUserData } from './forwarder'

const prepareContractWriteVote = ({ activeChainId, address, id, vote, enabled }) => {
  switch (activeChainId) {
    case mainnet.id: {
      const userData = address
        ? getForwarderVoteUserData({
            voterAddress: address,
            id,
            vote
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
      const userData = address
        ? getForwarderVoteUserData({
            voterAddress: address,
            id,
            vote
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
        address: settings.contracts.dandelionVotingV3,
        abi: DandelionVotingABI,
        functionName: 'vote',
        args: [id, vote],
        enabled
      }
    }
    case polygon.id: {
      const userData = address
        ? getForwarderVoteUserData({
            voterAddress: address,
            id,
            vote
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

export { prepareContractWriteVote }
