import React, { createContext, useEffect, useState } from 'react'
import { useClient } from 'wagmi'
import { getContract } from 'viem'
import { gnosis } from 'wagmi/chains'

import settings from '../../../settings'
import LendingManagerABI from '../../../utils/abis/LendingManager.json'
import wagmiConfig from '../../../utils/wagmiConfig'

export const EventsContext = createContext({
  borrowedEvents: [],
  lendedEvents: [],
  setBorrowedEvents: () => null,
  setLendedEvents: () => null
})

const EventsProvider = ({ children }) => {
  const [lendedEvents, setLendedEvents] = useState([])
  const [borrowedEvents, setBorrowedEvents] = useState([])
  const client = useClient({ config: wagmiConfig, chainId: gnosis.id })

  const lendingManager = getContract({
    address: settings.contracts.lendingManager,
    abi: LendingManagerABI,
    client: client
  })

  useEffect(() => {
    const fetch = async () => {
      try {
        const events = await lendingManager.getEvents.Lended()
        setLendedEvents(events)
      } catch (_err) {
        console.error(_err)
      }

      try {
        setBorrowedEvents(await lendingManager.getEvents.Borrowed())
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
