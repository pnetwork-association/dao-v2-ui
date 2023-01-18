import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { Col, Row } from 'react-bootstrap'
import { toast } from 'react-toastify'
import styled, { ThemeContext } from 'styled-components'
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import BigNumber from 'bignumber.js'

import { useBalances } from '../../../hooks/use-balances'
import {
  useAccountLendedAmountInTheCurrentEpoch,
  useAccountLendedAmountInTheNextEpochOf,
  useLend,
  useEstimateApy
} from '../../../hooks/use-borrowing-manager'
import { useEpochs } from '../../../hooks/use-epochs'
import { range, SECONDS_IN_ONE_DAY } from '../../../utils/time'
import { toastifyTransaction } from '../../../utils/transaction'

import AdvancedInput from '../../base/AdvancedInput'
import Button from '../../base/Button'
import Line from '../../base/Line'
import MiniButton from '../../base/MiniButton'
import Modal from '../../base/Modal'
import Slider from '../../base/Slider'
import Text from '../../base/Text'

const MaxButton = styled(MiniButton)`
  margin-left: 0.75rem;

  @media (max-width: 767.98px) {
    bottom: 157px;
  }
`

const ChartContainer = styled.div`
  display: inline-block;
  position: relative;
  width: 100%;
  height: 250px;
`

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  fill: false,
  interaction: {
    intersect: false
  },
  radius: 0,
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
  scales: {
    y: {
      type: 'linear',
      display: true,
      min: 0,
      position: 'left',
      title: {
        display: true,
        text: 'Your pool weight (%)'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      min: 0,
      suggestedMax: 30,
      grid: {
        drawOnChartArea: false
      },
      title: {
        display: true,
        text: 'Avg APY (estimated)'
      }
    }
  }
}

// const skipped = (ctx, value) => (ctx.p0.skip || ctx.p1.skip ? value : undefined)
// const down = (ctx, value) => (ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined)

const LendModal = ({ show, onClose }) => {
  const theme = useContext(ThemeContext)
  const { currentEpoch, epochDuration, formattedCurrentEpoch, formattedEpochDuration } = useEpochs()
  const { pntBalance, formattedPntBalance, formattedDaoPntBalance } = useBalances()
  const {
    amount,
    approve,
    approveData,
    approveEnabled,
    approveError,
    duration,
    isApproving,
    isLending,
    lend,
    lendData,
    lendEnabled,
    lendError,
    setAmount,
    setDuration,
    setEpochs
  } = useLend()
  const { formattedValue: formattedLendedAmountCurrentEpoch } = useAccountLendedAmountInTheCurrentEpoch()
  const { formattedValue: formattedLendedAmountNextEpoch } = useAccountLendedAmountInTheNextEpochOf()
  const {
    apy,
    setAmount: setAmountEstimatedApy,
    setDuration: setDurationEstimateApy,
    formattedApy,
    formattedStartEpoch,
    formattedEndEpoch,
    endEpoch,
    startEpoch,
    userWeightPercentages
  } = useEstimateApy()

  const chartEpochs = useMemo(() => {
    if (!(currentEpoch || currentEpoch === 0) || !(endEpoch || endEpoch === 0)) return []

    if (endEpoch - currentEpoch < 6) {
      return range(currentEpoch, currentEpoch + 7)
    }

    return range(currentEpoch, endEpoch + 1)
  }, [currentEpoch, endEpoch])

  const chartData = useMemo(() => {
    let effectiveUserWeightPercentages = userWeightPercentages.filter((_, _epoch) => _epoch >= currentEpoch)

    if (startEpoch > currentEpoch) {
      effectiveUserWeightPercentages = [0, ...effectiveUserWeightPercentages]
    }

    return {
      labels: chartEpochs.map((_epoch) => `Epoch #${_epoch}`),
      datasets: [
        {
          label: 'Pool Weight',
          data: effectiveUserWeightPercentages.map((_val) => _val * 100),
          borderColor: 'rgb(75, 192, 192)',
          type: 'bar',
          /*segment: {
            borderColor: (ctx) => skipped(ctx, 'red') || down(ctx, 'yellow'),
            borderDash: (ctx) => skipped(ctx, [6, 6])
          },*/
          spanGaps: true
        },
        {
          type: 'line',
          label: 'Avg APY',
          borderColor: 'rgb(75, 192, 192)',
          yAxisID: 'y1',
          data: !BigNumber(apy).isNaN() ? Array(chartEpochs.length).fill(apy) : null,
          borderDash: [6, 6]
        }
      ]
    }
  }, [chartEpochs, userWeightPercentages, currentEpoch, startEpoch, apy])

  useEffect(() => {
    if (lendError) {
      if (!lendError.message.includes('user rejected transaction')) {
        toast.error(lendError.message)
      }
    }

    if (approveError) {
      if (!approveError.message.includes('user rejected transaction')) {
        toast.error(approveError.message)
      }
    }
  }, [approveError, lendError])

  useEffect(() => {
    if (approveData) {
      toastifyTransaction(approveData)
    }
  }, [approveData])

  useEffect(() => {
    if (lendData) {
      toastifyTransaction(lendData)
    }
  }, [lendData])

  useEffect(() => {
    if (!show) {
      setAmount('0')
      setAmountEstimatedApy('0')
      setDuration(7)
    }
  }, [show, setAmount, setDuration, setAmountEstimatedApy])

  const onMax = useCallback(() => {
    setAmount(pntBalance)
    setAmountEstimatedApy(pntBalance)
  }, [pntBalance, setAmount, setAmountEstimatedApy])

  const onChangeDuration = useCallback(
    (_days) => {
      setDuration(_days)
      setDurationEstimateApy(_days)
      const newEpochs = Math.floor((_days * SECONDS_IN_ONE_DAY) / epochDuration) - 1
      setEpochs(newEpochs < currentEpoch ? currentEpoch : newEpochs)
    },
    [epochDuration, currentEpoch, setDuration, setEpochs, setDurationEstimateApy]
  )

  const onChangeAmount = useCallback(
    (_e) => {
      const newAmount = _e.target.value
      setAmount(newAmount)
      setAmountEstimatedApy(newAmount)
    },
    [setAmount, setAmountEstimatedApy]
  )

  return (
    <Modal show={show} title="Lend PNT in pNetwork DAO" onClose={onClose} size="xl">
      <Row className="mt-2">
        <Col xs={6}>
          <Text>PNT balance</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{formattedPntBalance}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Text>daoPNT balance</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{formattedDaoPntBalance}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <Text>Current epoch</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{formattedCurrentEpoch}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <Text>Lended PNT for the current epoch</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{formattedLendedAmountCurrentEpoch}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <Text>Lended PNT for the next epoch</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{formattedLendedAmountNextEpoch}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <Text>Epoch duration</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{formattedEpochDuration}</Text>
        </Col>
      </Row>
      <Line />
      <Row className="mt-3">
        <Col>
          <AdvancedInput
            contentLeft={<MaxButton onClick={onMax}>MAX</MaxButton>}
            value={amount}
            onChange={onChangeAmount}
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col xs={6}>
          <Text>Lock time</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{duration} days</Text>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Slider min={7} max={730} defaultValue={duration} value={duration} onChange={onChangeDuration} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col xs={6}>
          <Text>APY</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{formattedApy}</Text>
        </Col>
      </Row>
      <Row>
        <Col>
          <ChartContainer className="mt-2">
            <Chart type="bar" data={chartData} options={chartOptions} />
          </ChartContainer>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col xs={6}>
          <Text>Number of epochs</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{endEpoch - startEpoch + 1}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Text>Lending starts at epoch</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{formattedStartEpoch}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Text>Lending ends at epoch</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{formattedEndEpoch}</Text>
        </Col>
      </Row>
      {/*<Row className="mt-1">
        <Col>
          <ReceiverInput
            placeholder="receiver here ...."
            value={receiver}
            onChange={(_e) => setReceiver(_e.target.value)}
          />
        </Col>
          </Row>*/}
      <Row className="mt-3">
        <Col>
          <Button disabled={!approveEnabled} onClick={() => approve?.()} loading={isApproving}>
            Approve
          </Button>
        </Col>
      </Row>
      <Row className="mt-2 mb-2">
        <Col>
          <Button disabled={!lendEnabled} loading={isLending} onClick={() => lend?.()}>
            Lend
          </Button>
        </Col>
      </Row>
      {/*<Row className="mt-2 mb-2">
        <Col className="text-center">
          <InfoText>
            Withdrawals from pNetwork DAO are subjected to a cooldown. Withdrawals will become available after 7 days
            from staking.
          </InfoText>
        </Col>
        </Row>*/}
    </Modal>
  )
}

export default LendModal
