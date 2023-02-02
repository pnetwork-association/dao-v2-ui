import BigNumber from 'bignumber.js'
import { useContext, useMemo } from 'react'
import { Chart } from 'react-chartjs-2'
import { ThemeContext } from 'styled-components'
import { formatAssetAmount } from '../../../utils/amount'

const labels = ['Epoch 30', 'Epoch 31', 'Epoch 32', 'Epoch 33', 'Epoch 34', 'Epoch 35']

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

  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        /*{
          type: 'line',
          backgroundColor: theme.yellow,
          borderColor: theme.yellow,
          data: [25, 27, 27, 24, 23, 18].reverse(),
          yAxisID: 'apy',
          label: 'APY'
        },*/
        {
          type: 'bar',
          backgroundColor: theme.text4,
          fill: false,
          data: ['11500.00', '14800.00', '12800.00', '11600.00', '20900', '43300.00'].reverse(),
          yAxisID: 'totalEarnedFees',
          label: 'Accrued fees'
        },
        {
          type: 'bar',
          backgroundColor: theme.primary1,
          data: [25, 27, 27, 24, 23, 18].reverse(),
          yAxisID: 'totalNumberOfNodes',
          label: 'Number of nodes'
        }
      ]
    }
  }, [theme])

  return <Chart id="sentinelHistoricalChart" data={data} options={options} />
}

export default SentinelHistoricalChart
