import React, { useMemo, useContext, useEffect } from 'react'
import { ThemeContext } from 'styled-components'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createClient, WagmiConfig, createStorage } from 'wagmi'
import { mainnet, polygon, bsc, gnosis } from 'wagmi/chains'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { getWeb3Settings } from 'react-web3-settings'

import { styleRainbowKit } from '../theme/rainbow-configs'

import ActivitiesProvider from './context/Activities'
import CryptoCompareProvider from './context/CryptoCompare'
import ProposalsProvider from './context/Proposals'
import EventsProvider from './context/Events'
import Avatar from './base/Avatar'
import Overview from './pages/Overview'
import Lending from './pages/Lending'
import Nodes from './pages/Nodes'
import Staking from './pages/Staking'
import Disclaimer from './complex/Disclaimer'
import SettingsDrawer from './complex/Settings'

const router = createHashRouter([
  {
    path: '/',
    element: <Overview />
  },
  {
    path: '/lending',
    element: <Lending />
  },
  {
    path: '/nodes',
    element: <Nodes />
  },
  {
    path: '/staking',
    element: <Staking />
  }
])

const settings = getWeb3Settings()

const { chains, provider } = configureChains(
  [gnosis],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http:
          chain.id === mainnet.id
            ? settings.rpcEndpoints && settings.rpcEndpoints[0] !== ''
              ? settings.rpcEndpoints[0]
              : `https://eth-mainnet.alchemyapi.io/v2/${import.meta.env.VITE_REACT_APP_ALCHEMY_ID}`
            : chain.id === gnosis.id
            ? settings.rpcEndpoints && settings.rpcEndpoints[0] !== ''
              ? settings.rpcEndpoints[3]
              : `https://eth-mainnet.alchemyapi.io/v2/${import.meta.env.VITE_REACT_APP_ALCHEMY_ID}`
            : chain.id === polygon.id
            ? settings.rpcEndpoints && settings.rpcEndpoints[1] !== ''
              ? settings.rpcEndpoints[1]
              : `https://polygon-mainnet.alchemyapi.io/v2/${import.meta.env.VITE_REACT_APP_ALCHEMY_ID}`
            : chain.id === bsc.id
            ? settings.rpcEndpoints && settings.rpcEndpoints[2] !== ''
              ? settings.rpcEndpoints[2]
              : `https://bsc-mainnet.alchemyapi.io/v2/${import.meta.env.VITE_REACT_APP_ALCHEMY_ID}`
            : 'Unsupported Chain'
      })
    })
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'pNetwork DAO',
  chains,
  projectId: `${import.meta.env.VITE_REACT_APP_WC2_PROJECT_ID}`
})

const wagmiClient = createClient({
  persister: null,
  storage: createStorage({ storage: window.localStorage }),
  autoConnect: true,
  connectors,
  provider
})

const App = () => {
  const theme = useContext(ThemeContext)
  const rainbowTheme = useMemo(() => styleRainbowKit(theme), [theme])

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={rainbowTheme} avatar={Avatar}>
        <CryptoCompareProvider apiKey={import.meta.env.VITE_REACT_APP_CRYPTO_COMPARE_API_KEY}>
          <ActivitiesProvider>
            <ProposalsProvider>
              <EventsProvider>
                <SettingsDrawer>
                  <RouterProvider router={router} />
                </SettingsDrawer>
              </EventsProvider>
              <Disclaimer />
            </ProposalsProvider>
          </ActivitiesProvider>
        </CryptoCompareProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
export default App
