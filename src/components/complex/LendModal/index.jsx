import BigNumber from 'bignumber.js'
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Chart } from 'react-chartjs-2'
import { toast } from 'react-toastify'
import styled, { ThemeContext } from 'styled-components'
import { useChainId } from 'wagmi'
import { FaInfoCircle } from 'react-icons/fa'
import { gnosis } from 'wagmi/chains'

import { useBalances } from '../../../hooks/use-balances'
import { useEstimateApy, useLend } from '../../../hooks/use-lending-manager'
import { useEpochs } from '../../../hooks/use-epochs'
import { range, SECONDS_IN_ONE_DAY } from '../../../utils/time'
import { toastifyTransaction } from '../../../utils/transaction'
import { isValidError } from '../../../utils/errors'
import { useIsSafe } from '../../../hooks/use-safe-check'

import InputAmount from '../../base/InputAmount'
import Button from '../../base/Button'
import Line from '../../base/Line'
import Modal from '../../base/Modal'
import Slider from '../../base/Slider'
import Text from '../../base/Text'
import Tooltip from '../../base/Tooltip'
import InfoBox from '../../base/InfoBox'

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

// const skipped = (ctx, value) => (ctx.p0.skip || ctx.p1.skip ? value : undefined)
// const down = (ctx, value) => (ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined)

const LendModal = ({ show, onClose = () => null }) => {
  const theme = useContext(ThemeContext)
  const { currentEpoch, epochDuration, formattedCurrentEpoch, formattedEpochDuration } = useEpochs()
  const { formattedDaoPntBalance, formattedPntBalance, pntBalance } = useBalances()
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
  const {
    apy,
    endEpoch,
    formattedEndEpoch,
    formattedStartEpoch,
    setAmount: setAmountEstimatedApy,
    setDuration: setDurationEstimateApy,
    startEpoch,
    userWeightPercentages
  } = useEstimateApy()
  const activeChainId = useChainId()
  const isSafe = useIsSafe()
  const isAutoClosing = useRef(false)

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
    if (lendError && isValidError(lendError)) {
      toast.error(lendError.message)
    }

    if (approveError && isValidError(approveError)) {
      toast.error(approveError.message)
    }
  }, [approveError, lendError])

  useEffect(() => {
    if (approveData) {
      toastifyTransaction(approveData, { chainId: activeChainId })
    }
  }, [approveData, activeChainId])

  useEffect(() => {
    if (lendData) {
      toastifyTransaction(lendData, { chainId: activeChainId })
    }
  }, [lendData, activeChainId])

  useEffect(() => {
    if (lendData && !isAutoClosing.current) {
      isAutoClosing.current = true
      lendData.wait(1).then(onClose).catch(console.error)
    }
  }, [lendData, onClose])

  useEffect(() => {
    if (!show) {
      setAmount('0')
      setAmountEstimatedApy('0')
      setDuration(7)
    } else {
      isAutoClosing.current = false
    }
  }, [show, setAmount, setDuration, setAmountEstimatedApy])

  const onMax = useCallback(
    (_max) => {
      setAmount(_max)
      setAmountEstimatedApy(_max)
    },
    [setAmount, setAmountEstimatedApy]
  )

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

  const lendButtonText = useMemo(
    () => (BigNumber(amount).isGreaterThan(pntBalance) && !lendEnabled ? 'Insufficient amount' : 'Lend'),
    [amount, pntBalance, lendEnabled]
  )

  return (
    <Modal show={show} title="Lend PNT in pNetwork DAO" onClose={onClose} size="lg">
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
      <Line />
      <Row className="mt-3">
        <Col>
          <InputAmount max={pntBalance} value={amount} onChange={onChangeAmount} onMax={onMax} />
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
          <Tooltip id="apy-info-lend-tooltip" text={'todo'}>
            <Text id="apyInfo">
              &nbsp;
              <FaInfoCircle />
            </Text>
          </Tooltip>
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
      <Line />
      {isSafe && activeChainId !== gnosis.id && (
        <Row className="mt-2">
          <Col>
            <InfoBox>
              it looks like you are connected with a Gnosis Safe wallet. Make sure you control the same address on{' '}
              {gnosis.name} as well. Otherwise you can specify a destination address by clicking on the "show advanced
              options" button
            </InfoBox>
          </Col>
        </Row>
      )}
      <Row className="mt-3">
        <Col>
          <Button disabled={!approveEnabled} onClick={approve} loading={isApproving}>
            Approve
          </Button>
        </Col>
      </Row>
      <Row className="mt-2 mb-2">
        <Col>
          <Button disabled={!lendEnabled} loading={isLending} onClick={lend}>
            {lendButtonText}
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default LendModal
