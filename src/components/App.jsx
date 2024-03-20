import React, { useMemo, useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { styleRainbowKit } from '../theme/rainbow-configs'

import ActivitiesProvider from './context/Activities'
import CryptoCompareProvider from './context/CryptoCompare'
import ProposalsProvider from './context/Proposals'
import EventsProvider from './context/Events'
import Avatar from './base/Avatar'
import Overview from './pages/Overview'
import Staking from './pages/Staking'
import Lending from './pages/Lending'
import Nodes from './pages/Nodes'
import Rewards from './pages/Rewards/rewards'
import Disclaimer from './complex/Disclaimer'
import SettingsDrawer from './complex/Settings'
import wagmiConfig from '../utils/wagmiConfig'

const router = createHashRouter([
  {
    path: '/',
    element: <Overview />
  },
  {
    path: '/staking',
    element: <Staking />
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
    path: '/rewards',
    element: <Rewards />
  }
])

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
