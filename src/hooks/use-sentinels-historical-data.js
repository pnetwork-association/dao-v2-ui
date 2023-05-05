import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'

import { formatCurrency } from '../utils/amount'

const useSentinelsHistoricalData = () => {
  const [numberOfNodes, setNumberOfNodes] = useState([])
  const [epochs, setEpochs] = useState([])
  const [accruedFees, setAccruedFees] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { epochs }
        } = await axios.get('https://pnetwork.watch/api/datasources/proxy/3')
        setEpochs(Object.keys(epochs))
        setNumberOfNodes(Object.values(epochs).map(({ nodes_count }) => nodes_count))
        setAccruedFees(
          Object.values(epochs).map(({ fees }) =>
            Object.values(fees).reduce((_acc, { amount_usd }) => {
              _acc += amount_usd
              return _acc
            }, 0)
          )
        )
      } catch (_err) {
        console.error(_err)
      }
    }

    fetchData()
  }, [])

  return {
    accruedFees,
    epochs,
    numberOfNodes
  }
}

const useSentinelLastEpochReward = () => {
  const { accruedFees, numberOfNodes } = useSentinelsHistoricalData()

  return useMemo(() => {
    const lastEpochNumberOfNodes = numberOfNodes.length > 0 ? numberOfNodes[numberOfNodes.length - 1] : null
    let value =
      accruedFees.length > 0
        ? BigNumber(accruedFees[accruedFees.length - 1])
            .plus(accruedFees[accruedFees.length - 2])
            .plus(accruedFees[accruedFees.length - 3])
            .dividedBy(lastEpochNumberOfNodes * 3)
            .toFixed(2)
        : 0

    return {
      value,
      formattedValue: formatCurrency(value, '$')
    }
  }, [numberOfNodes, accruedFees])
}

export { useSentinelsHistoricalData, useSentinelLastEpochReward }
