import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { groupBy } from 'lodash'

import { formatCurrency } from '../utils/amount'
import { useTotalNumberOfBorrowersInEpochs, useTotalNumberOfLendersInEpochs } from './use-lending-manager'

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

const useSentinelsHistoricalData = () => {
  const totalNumberOfLendersInEpochs = useTotalNumberOfLendersInEpochs()
  const totalNumberOfBorrowersInEpochs = useTotalNumberOfBorrowersInEpochs()
  const [numberOfNodes, setNumberOfNodes] = useState([])
  const [epochs, setEpochs] = useState([])
  const [numberOfLenders, setNumberOfLenders] = useState([])
  const [numberOfBorrowers, setNumberOfBorrowers] = useState([])
  const [accruedNodesFees, setAccruedNodesFees] = useState([])
  const [accruedLendersFees, setAccruedLendersFees] = useState([])
  const [accruedBorrowersFees, setAccruedBorrowersFees] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { epochs: data }
        } = await axios.get('https://pnetwork.watch/static/epoch-dash.json')
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

        setAccruedLendersFees(
          calculateFee(
            {
              data,
              epochs,
              keyAppender: '-lenders'
            },
            (_element) => _element?.type === 'lender'
          )
        )

        setAccruedBorrowersFees(
          calculateFee(
            {
              data,
              epochs,
              keyAppender: '-borrowers'
            },
            (_element) => _element?.type === 'borrower'
          )
        )
      } catch (_err) {
        console.error(_err)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const normalizedTotalNumberOfLenders = []
    for (const epoch of epochs) {
      normalizedTotalNumberOfLenders[epoch] = totalNumberOfLendersInEpochs[epoch - 38] || 0 // 38 = difference between old epochs count and the new one
    }
    setNumberOfLenders(normalizedTotalNumberOfLenders)
  }, [epochs, totalNumberOfLendersInEpochs])

  useEffect(() => {
    const normalizedTotalNumberOfBorrowers = []
    for (const epoch of epochs) {
      normalizedTotalNumberOfBorrowers[epoch] = totalNumberOfBorrowersInEpochs[epoch - 38] || 0 // 38 = difference between old epochs count and the new one
    }
    setNumberOfBorrowers(normalizedTotalNumberOfBorrowers)
  }, [epochs, totalNumberOfBorrowersInEpochs])

  return {
    accruedBorrowersFees,
    accruedNodesFees,
    accruedLendersFees,
    epochs,
    numberOfBorrowers,
    numberOfLenders,
    numberOfNodes
  }
}

const useSentinelLastEpochReward = () => {
  const { accruedNodesFees, numberOfNodes } = useSentinelsHistoricalData()

  return useMemo(() => {
    const lastEpochNumberOfNodes = numberOfNodes.length > 0 ? numberOfNodes[numberOfNodes.length - 1] : null
    let value =
      accruedNodesFees.length > 0
        ? BigNumber(accruedNodesFees[accruedNodesFees.length - 1])
            .plus(accruedNodesFees[accruedNodesFees.length - 2])
            .plus(accruedNodesFees[accruedNodesFees.length - 3])
            .dividedBy(lastEpochNumberOfNodes * 3)
            .toFixed(2)
        : 0

    return {
      value,
      formattedValue: formatCurrency(value, '$')
    }
  }, [numberOfNodes, accruedNodesFees])
}

export { useSentinelsHistoricalData, useSentinelLastEpochReward }
