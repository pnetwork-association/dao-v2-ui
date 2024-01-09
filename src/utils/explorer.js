import { bsc, gnosis, mainnet, polygon } from 'wagmi/chains'

import settings from '../settings'

const getExplorerUrlByChainId = (_chainId) => {
  switch (_chainId) {
    case polygon.id:
      return settings.explorers.polygon
    case bsc.id:
      return settings.explorers.bsc
    case gnosis.id:
      return settings.explorers.gnosis
    default:
      return settings.explorers.mainnet
  }
}

const normalizeExplorer = (_explorer) =>
  _explorer[_explorer.length - 1] === '/' ? _explorer.slice(0, _explorer.length - 1) : _explorer

const getAddressExplorerUrl = (_address, _opts = {}) => {
  const { chainId = mainnet.id } = _opts
  return `${normalizeExplorer(getExplorerUrlByChainId(chainId))}/address/${_address}`
}

export { getExplorerUrlByChainId, getAddressExplorerUrl }
