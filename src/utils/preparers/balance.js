import { mainnet, polygon, bsc } from 'wagmi/chains'
import settings from '../../settings'

const getPntAddressByChainId = (_chainId) => {
  switch (_chainId) {
    case mainnet.id:
      return settings.contracts.pntOnEthereum
    case polygon.id:
      return settings.contracts.pntOnPolygon
    case bsc.id:
      return settings.contracts.pntOnBsc
    default:
      return null
  }
}

export { getPntAddressByChainId }
