import { bsc, mainnet, polygon } from 'wagmi/chains'
import settings from '../../settings'

import DandelionVotingABI from '../../utils/abis/DandelionVoting.json'
import ForwarderABI from '../abis/Forwarder.json'
import { getForwarderVoteUserData } from '../forwarder'

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
        args: [0, settings.contracts.forwarderOnPolygon, userData, '0x0075dd4c'],
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
        args: [0, settings.contracts.forwarderOnPolygon, userData, '0x0075dd4c'],
        enabled,
        chainId: bsc.id
      }
    }
    case polygon.id: {
      return {
        address: settings.contracts.dandelionVoting,
        abi: DandelionVotingABI,
        functionName: 'vote',
        args: [id, vote],
        enabled
      }
    }
    default:
      return {}
  }
}

export { prepareContractWriteVote }
