import BigNumber from 'bignumber.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useContext, useMemo } from 'react'
import { ThemeContext } from 'styled-components'
import { Chart } from 'react-chartjs-2'

import { useApy, useUtilizationRatio } from '../../../hooks/use-borrowing-manager'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const UtilizationRatioChart = () => {
  const theme = useContext(ThemeContext)
  const utilizationRatioByEpochsRange = useUtilizationRatio()
  const { value: apy } = useApy()

  const labels = useMemo(
    () =>
      !utilizationRatioByEpochsRange
        ? []
        : Object.keys(utilizationRatioByEpochsRange).map((_epoch) => `Epoch ${_epoch}`),
    [utilizationRatioByEpochsRange]
  )

  const options = useMemo(
    () => ({
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (_context) => {
              const label = _context.dataset.label || ''
              const value = BigNumber(_context.parsed.y).toFixed(2)
              return `${label} ${value}%`
            }
          }
        }
      },
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          stacked: false,
          grid: {
            drawBorder: false,
            lineWidth: 0
          }
        },
        utilizationRatio: {
          display: true,
          position: 'left',
          stacked: false,
          grid: {
            drawBorder: false,
            lineWidth: 0
          },
          title: {
            display: true,
            text: 'Utilization Ratio (%)'
          }
        },
        apy: {
          display: true,
          min: 0,
          position: 'right',
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'APY (%)'
          }
        }
      }
    }),
    []
  )

  const data = useMemo(() => {
    const utilizationRatioByEpochsRangeValues = utilizationRatioByEpochsRange
      ? Object.values(utilizationRatioByEpochsRange)
      : []
    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'APY',
          data: !BigNumber(apy).isNaN() ? utilizationRatioByEpochsRangeValues.map(() => apy) : [],
          backgroundColor: theme.primary1,
          borderColor: theme.primary1,
          yAxisID: 'apy'
        },
        {
          type: 'bar',
          label: 'Utilization Ratio',
          data: utilizationRatioByEpochsRangeValues.map(({ value }) => value),
          backgroundColor: theme.text4,
          borderColor: theme.text4,
          yAxisID: 'utilizationRatio'
        }
      ]
    }
  }, [utilizationRatioByEpochsRange, theme, labels, apy])

  return <Chart options={options} data={data} />
}

export default UtilizationRatioChart
