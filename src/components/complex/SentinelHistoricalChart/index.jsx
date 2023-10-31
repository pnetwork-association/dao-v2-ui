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
          if (label === 'Number of nodes') {
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
  scale: {
    y: {
      ticks: {
        display: false
      }
    }
  },
  scales: {
    totalEarnedFees: {
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
    totalNumberOfNodes: {
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
        text: 'Total number of nodes'
      }
    },
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

  const { accruedNodesFees, epochs, numberOfNodes } = useSentinelsHistoricalData()

  const data = useMemo(() => {
    return {
      labels: epochs.slice(-10).map((_epoch) => `Epoch ${_epoch}`),
      datasets: [
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
          type: 'bar',
          backgroundColor: theme.blue,
          data: numberOfNodes.slice(-10),
          yAxisID: 'y',
          label: '# nodes',
          stack: '0'
        }
      ]
    }
  }, [accruedNodesFees, epochs, numberOfNodes, theme])

  return <Chart id="sentinelHistoricalChart" data={data} options={options} />
}

export default SentinelHistoricalChart
