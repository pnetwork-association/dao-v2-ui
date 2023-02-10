import { useContext, useMemo } from 'react'
import { Chart } from 'react-chartjs-2'
import { ThemeContext } from 'styled-components'

import { useStakingSentinelEstimatedRevenues } from '../../../hooks/use-fees-manager'
import { formatAssetAmount } from '../../../utils/amount'
import { range } from '../../../utils/time'

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
    earnedFees: {
      display: true,
      min: 0,
      position: 'left',
      title: {
        display: true,
        text: 'Estimated Earned Fees (USD)'
      },
      grid: {
        display: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

const StakingSentinelRevenuesChart = () => {
  const theme = useContext(ThemeContext)
  const { revenues, startEpoch, endEpoch } = useStakingSentinelEstimatedRevenues()

  const data = useMemo(() => {
    return {
      labels: range(startEpoch, endEpoch + 1).map((_epoch) => `Epoch ${_epoch}`),
      datasets: [
        {
          type: 'bar',
          backgroundColor: theme.text4,
          data: revenues,
          yAxisID: 'earnedFees',
          label: 'Estimated earned fees'
        }
      ]
    }
  }, [theme, revenues, startEpoch, endEpoch])

  return <Chart id="stakingSentinelsRevenuesChart" data={data} options={options} />
}

export default StakingSentinelRevenuesChart
