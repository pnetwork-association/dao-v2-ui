import { mainnet, bsc, polygon, gnosis } from 'wagmi/chains'
import { http } from '@wagmi/core'
import { getWeb3Settings } from 'react-web3-settings'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

import settings from '../settings'

const web3Settings = getWeb3Settings()

const wagmiConfig = getDefaultConfig({
  appName: 'DAO v3 dApp',
  projectId: `${import.meta.env.VITE_REACT_APP_WC2_PROJECT_ID}`,
  chains: [mainnet, gnosis, polygon, bsc],
  transports: {
    [mainnet.id]: http(
      web3Settings.rpcEndpoints && web3Settings.rpcEndpoints[0] !== ''
        ? web3Settings.rpcEndpoints[0]
        : `https://eth-mainnet.alchemyapi.io/v2/${import.meta.env.VITE_REACT_APP_ALCHEMY_ID}`
    ),
    [polygon.id]: http(
      web3Settings.rpcEndpoints && web3Settings.rpcEndpoints[1] !== ''
        ? web3Settings.rpcEndpoints[1]
        : `https://polygon-mainnet.alchemyapi.io/v2/${import.meta.env.VITE_REACT_APP_ALCHEMY_ID}`
    ),
    [bsc.id]: http(
      web3Settings.rpcEndpoints && web3Settings.rpcEndpoints[2] !== ''
        ? web3Settings.rpcEndpoints[2]
        : `https://bsc-dataseed1.binance.org/`
    ),
    [gnosis.id]: http(
      web3Settings.rpcEndpoints && web3Settings.rpcEndpoints[3] !== ''
        ? web3Settings.rpcEndpoints[3]
        : settings.rpc.gnosis
    )
  }
})

export default wagmiConfig
