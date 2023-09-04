import moment from 'moment'
import { useContext, useMemo } from 'react'
import { Chart } from 'react-chartjs-2'
import { ThemeContext } from 'styled-components'

import { useHistoricalDaoPntTotalSupply } from '../../../hooks/use-staking-manager'

const options = {
  elements: { point: { radius: 0 } },
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: 'PNT staked in the DAO'
    },
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'right',
      min: 0,
      ticks: {
        display: true
      },
      grid: {
        display: false
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        autoSkip: true,
        maxTicksLimit: 20
      }
    }
  }
}

const HistoricalDaoPntTotalSupplyChart = () => {
  const { daoPntTotalSupply = [] } = useHistoricalDaoPntTotalSupply()

  const theme = useContext(ThemeContext)

  const data = useMemo(() => {
    const labels = daoPntTotalSupply.map((_val) => moment(_val[0]).format('MM/DD'))

    return {
      labels,
      datasets: [
        {
          type: 'line',
          backgroundColor: theme.primary1,
          borderColor: theme.primary1,
          data: daoPntTotalSupply.map((_val) => _val[1]),
          yAxisID: 'y',
          label: 'PNT'
        }
      ]
    }
  }, [theme, daoPntTotalSupply])

  return <Chart id="historicalDaoPntTotalSupply" data={data} options={options} />
}

export default HistoricalDaoPntTotalSupplyChart
