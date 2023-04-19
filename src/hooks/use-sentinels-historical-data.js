import axios from 'axios'
import { useEffect, useState } from 'react'

const useSentinelsHistoricalData = () => {
  const [numberOfNodes, setNumberOfNodes] = useState([])
  const [epochs, setEpochs] = useState([])
  const [accruedFees, setAccruedFees] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { epochs }
        } = await axios.get('https://pnetwork.watch:4443/api/datasources/proxy/3')
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

export { useSentinelsHistoricalData }
