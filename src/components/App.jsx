import React, { useMemo, useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains'
// import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { styleRainbowKit } from '../theme/rainbow-configs'

import Avatar from './base/Avatar'
import Overview from './pages/Overview'
import Lending from './pages/Lending'
import Sentinel from './pages/Sentinel'

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
    path: '/sentinel',
    element: <Sentinel />
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
        <RouterProvider router={router} />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
export default App
