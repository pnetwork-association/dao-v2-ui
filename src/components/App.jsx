import React, { useMemo, useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { createConfig, WagmiProvider } from 'wagmi'
import { mainnet, polygon, bsc, gnosis } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { http } from '@wagmi/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
import settings from '../settings'

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

const web3Settings = getWeb3Settings()

export const wagmiConfig = createConfig({
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

const queryClient = new QueryClient()

const App = () => {
  const theme = useContext(ThemeContext)
  const rainbowTheme = useMemo(() => styleRainbowKit(theme), [theme])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme} avatar={Avatar}>
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
      </QueryClientProvider>
    </WagmiProvider>
  )
}
export default App
