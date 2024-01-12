import BigNumber from 'bignumber.js'
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Chart } from 'react-chartjs-2'
import { toast } from 'react-toastify'
import styled, { ThemeContext } from 'styled-components'
import { useChainId } from 'wagmi'

import { useBalances } from '../../../hooks/use-balances'
import {
  useEstimateApyIncreaseDuration,
  useIncreaseLendDuration,
  useAccountLoanEndEpoch
} from '../../../hooks/use-lending-manager'
import { useEpochs } from '../../../hooks/use-epochs'
import { range } from '../../../utils/time'
import { toastifyTransaction } from '../../../utils/transaction'
import { isValidError } from '../../../utils/errors'

import Button from '../../base/Button'
import Line from '../../base/Line'
import Modal from '../../base/Modal'
import Slider from '../../base/Slider'
import Text from '../../base/Text'

const ChartContainer = styled.div`
  display: inline-block;
  position: relative;
  width: 100%;
  height: 250px;
`

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
    poolWeight: {
      type: 'linear',
      display: true,
      min: 0,
      position: 'left',
      title: {
        display: true,
        text: 'Your pool weight (%)'
      },
      grid: {
        display: false
      }
    },
    avgApy: {
      type: 'linear',
      display: true,
      position: 'right',
      min: 0,
      suggestedMax: 30,
      grid: {
        display: false
      },
      title: {
        display: true,
        text: 'Avg APY (estimated)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

const LendDurationModal = ({ show, onClose }) => {
  const theme = useContext(ThemeContext)
  const activeChainId = useChainId()
  const { currentEpoch, formattedCurrentEpoch, formattedEpochDuration } = useEpochs()
  const { formattedDaoPntBalance, formattedPntBalance } = useBalances()
  const {
    duration,
    increaseLendDuration,
    increaseLendDurationData,
    increaseLendDurationError,
    increaseLendDurationLoading,
    setDuration
  } = useIncreaseLendDuration()
  const { value: currentLoanEndEpoch, formattedValue: formattedCurrentLoanEndEpoch } = useAccountLoanEndEpoch()

  const {
    apy,
    endEpoch,
    formattedEndEpoch,
    formattedStartEpoch,
    setDuration: setDurationEstimateApy,
    startEpoch,
    userWeightPercentages
  } = useEstimateApyIncreaseDuration()

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
          type: 'line',
          label: 'Avg APY',
          borderColor: theme.primary1,
          yAxisID: 'avgApy',
          data: !BigNumber(apy?.value).isNaN() ? Array(chartEpochs.length).fill(apy?.value) : null,
          borderDash: [6, 6]
        },
        {
          label: 'Pool Weight',
          data: effectiveUserWeightPercentages.map((_val) => _val * 100),
          backgroundColor: theme.blue,
          type: 'bar',
          spanGaps: true,
          yAxisID: 'poolWeight'
        }
      ]
    }
  }, [chartEpochs, userWeightPercentages, currentEpoch, startEpoch, apy?.value, theme])

  useEffect(() => {
    if (increaseLendDurationError && isValidError(increaseLendDurationError)) {
      toast.error(increaseLendDurationError.message)
    }
  }, [increaseLendDurationError])

  useEffect(() => {
    if (increaseLendDurationData) {
      toastifyTransaction(increaseLendDurationData, { chainId: activeChainId })
    }
  }, [increaseLendDurationData, activeChainId])

  useEffect(() => {
    if (!show) {
      setDuration(0)
    }
  }, [show, setDuration])

  const onChangeDuration = useCallback(
    (_days) => {
      setDuration(_days)
      setDurationEstimateApy(_days)
    },
    [setDuration, setDurationEstimateApy]
  )

  return (
    <Modal show={show} title="Increase duration" onClose={onClose} size="xl">
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
          <Text>Epoch duration</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{formattedEpochDuration}</Text>
        </Col>
      </Row>
      {currentLoanEndEpoch >= currentEpoch && (
        <Row>
          <Col xs={8}>
            <Text>Your current loan ends at epoch</Text>
          </Col>
          <Col xs={4} className="text-end">
            <Text variant={'text2'}>{formattedCurrentLoanEndEpoch}</Text>
          </Col>
        </Row>
      )}
      <Line />
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
          <Slider min={0} max={730} defaultValue={duration} value={duration} onChange={onChangeDuration} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col xs={6}>
          <Text>APY</Text>
          <Text>&nbsp;*</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{apy?.formattedValue}</Text>
        </Col>
      </Row>
      <Row>
        <Col>
          <ChartContainer className="mt-2">
            {show && <Chart id="lendingEstimateApyChart" data={chartData} options={chartOptions} />}
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
      <Row className="mt-2 mb-2">
        <Col>
          <Button
            disabled={duration === 0}
            loading={increaseLendDurationLoading}
            onClick={increaseLendDuration}
          >
            Increase duration
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default LendDurationModal
