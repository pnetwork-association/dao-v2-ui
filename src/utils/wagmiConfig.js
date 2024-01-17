import { createConfig } from 'wagmi'
import { mainnet, polygon, bsc, gnosis } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { http } from '@wagmi/core'
import { getWeb3Settings } from 'react-web3-settings'

import settings from '../settings'

const web3Settings = getWeb3Settings()

const wagmiConfig = createConfig({
    chains: [gnosis],
    connectors: [
      injected(),
      walletConnect({
        projectId: `${import.meta.env.VITE_REACT_APP_WC2_PROJECT_ID}`
      }),
      coinbaseWallet({
        appName: 'DAO v3 dApp'
      })
    ],
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
          : `https://bsc-mainnet.alchemyapi.io/v2/${import.meta.env.VITE_REACT_APP_ALCHEMY_ID}`
      ),
      [gnosis.id]: http(
        web3Settings.rpcEndpoints && web3Settings.rpcEndpoints[3] !== ''
          ? web3Settings.rpcEndpoints[3]
          : settings.rpc.gnosis
      )
    }
  })

  export default wagmiConfig
  