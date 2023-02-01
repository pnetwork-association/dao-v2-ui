import React, { useMemo, useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains'
// import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { styleRainbowKit } from '../theme/rainbow-configs'

import ActivitiesProvider from './context/Activities'
import CryptoCompareProvider from './context/CryptoCompare'
import Avatar from './base/Avatar'
import Overview from './pages/Overview'
// import Lending from './pages/Lending'
// import Nodes from './pages/Nodes'
import Staking from './pages/Staking'

const router = createHashRouter([
  {
    path: '/',
    element: <Overview />
  },
  /*{
    path: '/lending',
    element: <Lending />
  },
  {
    path: '/nodes',
    element: <Nodes />
  },*/
  {
    path: '/staking',
    element: <Staking />
  }
])

// TODO remove it
mainnet.rpcUrls.default.http = ['http://localhost:8545']

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [/*alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),*/ publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'pNetwork DAO',
  chains
})

const wagmiClient = createClient({
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
        <CryptoCompareProvider apiKey={process.env.REACT_APP_CRYPTO_COMPARE_API_KEY}>
          <ActivitiesProvider>
            <RouterProvider router={router} />
          </ActivitiesProvider>
        </CryptoCompareProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
export default App
