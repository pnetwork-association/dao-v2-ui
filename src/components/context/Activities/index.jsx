import React, { createContext, useCallback, useState, useRef } from 'react'
import { Mutex } from 'async-mutex'

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
  const recursiveMode = useRef({
    StakingManager: true,
    LendingManager: true,
    DandelionVoting: true
  })
  const checkpoint = useRef(0)
  const mutex = useRef(new Mutex())

  const cacheActivities = useCallback(
    (_activities) => {
      setActivities([...activities, ..._activities])
    },
    [activities]
  )

  const value = {
    activities,
    cacheActivities,
    checkpoint,
    lastBlock,
    mutex,
    recursiveMode,
    setActivities,
    setLastBlock
  }
  return <ActivitiesContext.Provider value={value}>{children}</ActivitiesContext.Provider>
}

export default ActivitiesProvider
