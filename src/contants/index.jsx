import { mainnet, bsc, polygon, gnosis } from 'wagmi/chains'

export const STAKING_NODE = '0x01'
export const BORROWING_NODE = '0x02'

export const chainIdToIcon = {
  1: 'ethereum.svg',
  56: 'bsc.svg',
  137: 'polygon.svg',
  100: 'gnosis.svg'
}

export const chainIdToPnetworkChainId = {
  1: '0x005fe7f9',
  56: '0x00e4b170',
  100: '0x00f1918e',
  137: '0x0075dd4c'
}

export const pNetworkNetworkIds = {
  mainnet: '0x005fe7f9',
  bsc: '0x00e4b170',
  polygon: '0x0075dd4c',
  gnosis: '0x00f1918e'
}

export const chainIdToPNetworkNetworkId = {
  1: '0x005fe7f9',
  56: '0x00e4b170',
  100: '0x00f1918e',
  137: '0x0075dd4c'
}

export const chainIdToNetworkName = {
  1: mainnet.name,
  56: bsc.name,
  137: polygon.name,
  100: gnosis.name
}
