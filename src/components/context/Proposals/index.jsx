import React, { createContext, useState } from 'react'

import { useFetchProposals } from '../../../hooks/use-proposals'

export const ProposalsContext = createContext({
  proposals: [],
  setProposals: () => null
})

const ProposalsProvider = ({ children }) => {
  const [proposals, setProposals] = useState([])
  useFetchProposals({ setProposals })
  return (
    <ProposalsContext.Provider
      value={{
        proposals,
        setProposals
      }}
    >
      {children}
    </ProposalsContext.Provider>
  )
}

export default ProposalsProvider
