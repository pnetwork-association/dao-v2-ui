import React, { createContext, useEffect, useState } from 'react'
import { useContract, useProvider } from 'wagmi'
import { polygon } from 'wagmi/chains'

import settings from '../../../settings'
import LendingManagerABI from '../../../utils/abis/LendingManager.json'

export const EventsContext = createContext({
  lendedEvents: [],
  setLendedEvents: () => null
})

const EventsProvider = ({ children }) => {
  const [lendedEvents, setLendedEvents] = useState([])
  const provider = useProvider({ chainId: polygon.id })

  const lendingManager = useContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    signerOrProvider: provider
  })

  useEffect(() => {
    const fetch = async () => {
      try {
        setLendedEvents(await lendingManager.queryFilter('Lended'))
      } catch (_err) {
        console.error(_err)
      }
    }

    fetch()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <EventsContext.Provider
      value={{
        lendedEvents
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export default EventsProvider
