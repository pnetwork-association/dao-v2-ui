import { useContext, useEffect, useMemo } from 'react'
import axios from 'axios'

import { CryptoCompareContext } from '../components/context/CryptoCompare'

export function useRates(_symbols = [], _opts = {}) {
  const { apiKey } = _opts
  const { rates, setRates } = useContext(CryptoCompareContext)

  useEffect(() => {
    const fetchRates = async (_fsyms) => {
      try {
        const { data } = await axios.get(
          `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${_fsyms.join(',')}&tsyms=USD&api_key=${apiKey}`
        )

        const ratesToStore = Object.keys(data).reduce((_acc, _symbol) => {
          if (!data[_symbol]) return _acc
          _acc[_symbol] = data[_symbol]?.USD
          return _acc
        }, {})
        setRates({ ...rates, ...ratesToStore })
      } catch (_err) {
        console.error(_err)
      }
    }

    const cachedSymbols = Object.keys(rates)
    const symbolsNotCached = _symbols
      .map((_symbol) => _symbol.toUpperCase())
      .filter((_symbol) => !cachedSymbols.includes(_symbol))
    if (symbolsNotCached.length > 0) {
      fetchRates(symbolsNotCached)
    }
  }, [_symbols, apiKey, rates, setRates])

  return useMemo(
    () =>
      Object.keys(rates).reduce((_acc, _symbol) => {
        if (_symbols.includes(_symbol)) {
          _acc[_symbol] = rates[_symbol]
        }
        return _acc
      }, {}),
    [rates, _symbols]
  )
}
