import React, { createContext, useEffect, useState } from 'react'
import { useContract, useProvider } from 'wagmi'
import { polygon } from 'wagmi/chains'

import settings from '../../../settings'
import LendingManagerABI from '../../../utils/abis/LendingManager.json'

export const EventsContext = createContext({
  borrowedEvents: [],
  lendedEvents: [],
  setBorrowedEvents: () => null,
  setLendedEvents: () => null
})

const EventsProvider = ({ children }) => {
  const [lendedEvents, setLendedEvents] = useState([])
  const [borrowedEvents, setBorrowedEvents] = useState([])
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

      try {
        setBorrowedEvents(await lendingManager.queryFilter('Borrowed'))
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
        borrowedEvents,
        lendedEvents
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export default EventsProvider
