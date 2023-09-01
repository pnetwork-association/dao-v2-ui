import BigNumber from 'bignumber.js'
import { useContext, useMemo } from 'react'
import { Chart } from 'react-chartjs-2'
import { ThemeContext } from 'styled-components'

import { formatAssetAmount } from '../../../utils/amount'
import { useSentinelsHistoricalData } from '../../../hooks/use-sentinels-historical-data'

const options = {
  fill: false,
  interaction: {
    intersect: false
  },
  plugins: {
    legend: {
      display: true
    },
    tooltip: {
      callbacks: {
        label: (_context) => {
          const label = _context.dataset.label || ''
          if (label === 'nodes' || label === 'borrowers' || label === 'lenders') {
            return `${label} ${_context.parsed.y}`
          }
          if (label === 'APY') {
            return `${label} ${BigNumber(_context.parsed.y).toFixed(2)}%`
          }
          return `${label} ${formatAssetAmount(_context.parsed.y, 'USD', { decimals: 2 })}`
        }
      }
    }
  },
  scales: {
    totalAccruedFees: {
      stacked: true,
      display: true,
      min: 0,
      position: 'left',
      title: {
        display: true,
        text: 'Total Earned Fees (USD)'
      },
      grid: {
        display: false
      }
    },
    y: {
      display: true,
      position: 'right',
      min: 0,
      grid: {
        display: false
      },
      ticks: {
        display: true
      },
      title: {
        display: true,
        text: ''
      }
    },
    /*apy: {
      display: true,
      min: 0,
      position: 'right',
      grid: {
        display: false
      }
    },*/
    x: {
      grid: {
        display: false
      },
      title: {
        display: true,
        text: 'Past epochs'
      }
    }
  }
}

const SentinelHistoricalChart = () => {
  const theme = useContext(ThemeContext)

  const {
    accruedBorrowersFees,
    accruedNodesFees,
    accruedLendersFees,
    epochs,
    numberOfBorrowers,
    numberOfLenders,
    numberOfNodes
  } = useSentinelsHistoricalData()

  const data = useMemo(() => {
    return {
      labels: epochs.slice(-10).map((_epoch) => `Epoch ${_epoch}`),
      datasets: [
        /*{
          type: 'line',
          backgroundColor: theme.yellow,
          borderColor: theme.yellow,
          data: [25, 27, 27, 24, 23, 18],
          yAxisID: 'apy',
          label: 'APY'
        },*/
        {
          type: 'line',
          backgroundColor: theme.green,
          data: accruedNodesFees.slice(-10),
          yAxisID: 'totalAccruedFees',
          label: 'nodes rewards',
          pointRadius: 7,
          borderColor: theme.green
        },
        {
          type: 'line',
          backgroundColor: theme.primary1,
          data: accruedBorrowersFees.slice(-10),
          yAxisID: 'totalAccruedFees',
          label: 'borrowers rewards',
          pointRadius: 7,
          borderColor: theme.primary1
        },
        {
          type: 'line',
          backgroundColor: theme.orange,
          data: accruedLendersFees.slice(-10),
          yAxisID: 'totalAccruedFees',
          label: 'lenders rewards',
          pointRadius: 7,
          borderColor: theme.orange
        },
        {
          type: 'bar',
          backgroundColor: theme.blue,
          data: numberOfNodes.slice(-10),
          yAxisID: 'y',
          label: '# nodes',
          stack: '0'
        },
        {
          type: 'bar',
          backgroundColor: theme.yellow,
          data: numberOfBorrowers.slice(-10),
          yAxisID: 'y',
          label: '# borrowers',
          stack: '0'
        },
        {
          type: 'bar',
          backgroundColor: theme.secondary1,
          data: numberOfLenders.slice(-10),
          yAxisID: 'y',
          label: '# lenders',
          stack: '1'
        }
      ]
    }
  }, [
    accruedNodesFees,
    accruedBorrowersFees,
    accruedLendersFees,
    epochs,
    numberOfNodes,
    numberOfLenders,
    numberOfBorrowers,
    theme
  ])

  return <Chart id="sentinelHistoricalChart" data={data} options={options} />
}

export default SentinelHistoricalChart
