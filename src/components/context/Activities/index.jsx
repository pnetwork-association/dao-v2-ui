import React, { createContext, useCallback, useState } from 'react'

export const ActivitiesContext = createContext({
  activities: [],
  cacheActivities: () => null,
  setActivities: () => null,
  lastBlock: 0,
  setLastBlock: () => null
})

const ActivitiesProvider = ({ children }) => {
  const [activities, setActivities] = useState([])
  const [lastBlock, setLastBlock] = useState(0)

  const cacheActivities = useCallback(
    (_activities) => {
      setActivities([...activities, ..._activities])
    },
    [activities]
  )

  const value = { activities, cacheActivities, lastBlock, setActivities, setLastBlock }
  return <ActivitiesContext.Provider value={value}>{children}</ActivitiesContext.Provider>
}

export default ActivitiesProvider
