import axios from 'axios'
import { useEffect, useState } from 'react'
import { groupBy } from 'lodash'

const EPOCHS_ENDPOINT = 'https://pnetwork.watch/static/epoch-dash.json'

const calculateFee = ({ epochs, data, keyAppender = '' }, _isValid) => {
  let sum = []
  for (const epoch of epochs) {
    const element = data[`${epoch}${keyAppender}`]

    if (!_isValid(element)) {
      sum.push(0)
      continue
    }

    sum.push(
      Object.values(element.fees).reduce((_acc, { amount_usd }) => {
        _acc += amount_usd
        return _acc
      }, 0)
    )
  }
  return sum
}

/* In case the API is not updated to the current epoch it returns a corrupted JSON where the missing data
 * is reported as a space which prevents axios to decode the JSON directly.
 * This function detects that (the data is a string and not a object) replace the space with a NaN which is
 * interpreted by charts.js as null data.
 * In case the data is not string nor object returns null
 */
export const handlePartialData = (data) =>
  typeof data === 'object'
    ? data
    : typeof data === 'string'
    ? JSON.parse(data.replace(/: ,/g, ': "NaN",').replace(/: }/g, ': "NaN"}'))
    : null

export const getEpochsFromRawData = async () => {
  const { data: rawData } = await axios.get(EPOCHS_ENDPOINT)
  const { epochs: data } = handlePartialData(rawData)
  return data
}

const useSentinelsHistoricalData = () => {
  const [numberOfNodes, setNumberOfNodes] = useState([])
  const [epochs, setEpochs] = useState([])
  const [accruedNodesFees, setAccruedNodesFees] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEpochsFromRawData()
        if (data === null) throw new Error('Unrecongnized data type')
        const epochs = Object.keys(data).filter((_epoch) => !_epoch.includes('-'))
        setEpochs(epochs)

        const nodesByEpoch = Object.values(groupBy(Object.values(data), 'number')).map((_arr) => {
          return _arr.reduce((_acc, { nodes_count, type }) => {
            if (type === 'lender' || type === 'borrower') return _acc

            _acc += nodes_count
            return _acc
          }, 0)
        })

        setNumberOfNodes(nodesByEpoch)

        setAccruedNodesFees(
          calculateFee(
            {
              data,
              epochs
            },
            (_element) => !_element.type
          )
        )
      } catch (_err) {
        console.error(_err)
      }
    }

    fetchData()
  }, [])

  return {
    accruedNodesFees,
    epochs,
    numberOfNodes
  }
}

export { useSentinelsHistoricalData }
