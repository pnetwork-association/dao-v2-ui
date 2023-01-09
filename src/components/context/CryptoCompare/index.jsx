import React, { createContext, useState } from 'react'

export const CryptoCompareContext = createContext({
  rates: null,
  setRates: null
})

const CryptoCompareProvider = ({ children }) => {
  const [rates, setRates] = useState({})

  const value = { rates, setRates }
  return <CryptoCompareContext.Provider value={value}>{children}</CryptoCompareContext.Provider>
}

export default CryptoCompareProvider
