import React, { Fragment, useCallback, useContext, useEffect, useMemo } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Chart } from 'react-chartjs-2'
import styled, { ThemeContext } from 'styled-components'

import { useEpochs } from '../../../hooks/use-epochs'
import { useOverview } from '../../../hooks/use-overview'
import { useBorrowingSentinelProspectus, useRegisterSentinel } from '../../../hooks/use-registration-manager'
import settings from '../../../settings'
import { range } from '../../../utils/time'
import { toastifyTransaction } from '../../../utils/transaction'
import { formatAssetAmount } from '../../../utils/amount'

import Button from '../../base/Button'
import InputAmount from '../../base/InputAmount'
import Line from '../../base/Line'
import Modal from '../../base/Modal'
import Radio from '../../base/Radio'
import Slider from '../../base/Slider'
import Text from '../../base/Text'
import TextArea from '../../base/TextArea'

const ChartContainer = styled.div`
  display: inline-block;
  position: relative;
  width: 100%;
  height: 350px;
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
          return `${_context.dataset.label} ${formatAssetAmount(_context.parsed.y, 'USD', { decimals: 2 })}`
        }
      }
    }
  },
  scales: {
    estimatedRevenues: {
      type: 'linear',
      display: true,
      min: 0,
      position: 'left',
      title: {
        display: true,
        text: 'Estimated Revenues (USD)'
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

const RegisterSentinelModal = ({ show, onClose }) => {
  const theme = useContext(ThemeContext)
  const { formattedDaoPntBalance, formattedPntBalance, pntBalance } = useOverview()
  const { currentEpoch, formattedCurrentEpoch } = useEpochs()
  const {
    amount,
    approve,
    approveData,
    approveEnabled,
    epochs,
    isApproving,
    isUpdatingSentinelRegistrationByBorrowing,
    isUpdatingSentinelRegistrationByStaking,
    setAmount,
    setEpochs,
    setSignature,
    setType,
    signature,
    type,
    updateSentinelRegistrationByBorrowing,
    updateSentinelRegistrationByBorrowingData,
    updateSentinelRegistrationByBorrowingEnabled,
    updateSentinelRegistrationByStaking,
    updateSentinelRegistrationByStakingData,
    updateSentinelRegistrationByStakingEnabled
  } = useRegisterSentinel()

  const {
    endEpoch,
    epochsRevenues: prospectusBorrowingEpochsRevenues,
    setEpochs: setProspectusBorrowingEpochs
  } = useBorrowingSentinelProspectus()

  useEffect(() => {
    if (approveData) {
      toastifyTransaction(approveData)
    }
  }, [approveData])

  useEffect(() => {
    if (updateSentinelRegistrationByStakingData) {
      toastifyTransaction(updateSentinelRegistrationByStakingData)
    }
  }, [updateSentinelRegistrationByStakingData])

  useEffect(() => {
    if (updateSentinelRegistrationByBorrowingData) {
      toastifyTransaction(updateSentinelRegistrationByBorrowingData)
    }
  }, [updateSentinelRegistrationByBorrowingData])

  const onMax = useCallback(() => {
    setAmount(pntBalance)
  }, [pntBalance, setAmount])

  useEffect(() => {
    if (!show) {
      setEpochs(1)
      setProspectusBorrowingEpochs(1)
      setAmount(0)
    }
  }, [show, setEpochs, setAmount, setProspectusBorrowingEpochs])

  const onChangeType = useCallback(
    (_type) => {
      setAmount(0)
      setType(_type)
      setProspectusBorrowingEpochs(1)
    },
    [setAmount, setType, setProspectusBorrowingEpochs]
  )

  const onChangeBorrowingEpochs = useCallback(
    (_epochs) => {
      setEpochs(_epochs)
      setProspectusBorrowingEpochs(_epochs)
    },
    [setEpochs, setProspectusBorrowingEpochs]
  )

  const chartEpochs = useMemo(() => {
    if (!(currentEpoch || currentEpoch === 0) || !(endEpoch || endEpoch === 0)) return []

    if (endEpoch - currentEpoch < 6) {
      return range(currentEpoch + 1, currentEpoch + 8)
    }

    return range(currentEpoch + 1, endEpoch)
  }, [currentEpoch, endEpoch])

  const chartData = useMemo(() => {
    return {
      labels: chartEpochs.map((_epoch) => `Epoch #${_epoch + currentEpoch}`),
      datasets: [
        {
          label: 'Revenues',
          data: prospectusBorrowingEpochsRevenues,
          backgroundColor: prospectusBorrowingEpochsRevenues.map((_val) => {
            if (_val < settings.registrationManager.estimatedSentinelRunningCost) return theme.lightRed
            return theme.lightGreen
          }),
          type: 'bar',
          spanGaps: true,
          yAxisID: 'estimatedRevenues'
        }
      ]
    }
  }, [chartEpochs, prospectusBorrowingEpochsRevenues, currentEpoch, theme])

  return (
    <Modal show={show} title="Register Sentinel" onClose={onClose} size="xl">
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
          <Text>Estimated running Sentinel cost</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{settings.registrationManager.estimatedSentinelRunningCost} USD</Text>
        </Col>
      </Row>
      <Line />
      <Row className="mt-2">
        <Col xs={6} lg={2}>
          <Radio
            id="radio-stake"
            name="stake-borrow-group"
            label="Stake"
            checked={type === 'stake'}
            onChange={() => onChangeType('stake')}
          />
        </Col>
        <Col xs={6} lg={2}>
          <Radio
            id="radio-borrow"
            name="stake-borrow-group"
            label="Borrow"
            checked={type === 'borrow'}
            onChange={() => onChangeType('borrow')}
          />
        </Col>
      </Row>
      <Line />
      {type === 'stake' && (
        <Fragment>
          <Row className="mt-2">
            <Col>
              <InputAmount onMax={onMax} value={amount} onChange={(_e) => setAmount(_e.target.value)} />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col xs={6}>
              <Text>Number of epochs</Text>
            </Col>
            <Col xs={6} className="text-end">
              <Text variant={'text2'}>{epochs} epochs</Text>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col>
              <Slider
                min={1}
                max={24}
                defaultValue={epochs}
                value={epochs}
                onChange={(_epochs) => setEpochs(_epochs)}
              />
            </Col>
          </Row>
        </Fragment>
      )}
      {type === 'borrow' && (
        <Fragment>
          <Row className="mt-2">
            <Col xs={6}>
              <Text>Number of epochs</Text>
            </Col>
            <Col xs={6} className="text-end">
              <Text variant={'text2'}>{epochs} epochs</Text>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col>
              <Slider min={1} max={24} defaultValue={epochs} value={epochs} onChange={onChangeBorrowingEpochs} />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col xs={12}>
              <ChartContainer className="mt-2">
                <Chart options={chartOptions} data={chartData} />
              </ChartContainer>
            </Col>
          </Row>
        </Fragment>
      )}
      <Row className="mt-2">
        <Col xs={6}>
          <Text>Registration starts at epoch</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{currentEpoch || currentEpoch === 0 ? `#${currentEpoch + 1}` : '-'}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Text>Registration ends at epoch</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{currentEpoch || currentEpoch === 0 ? `#${currentEpoch + epochs}` : '-'}</Text>
        </Col>
      </Row>
      <Line />
      <Row>
        <Col xs={6}>
          <Text>Sentinel signature</Text>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>
          <TextArea rows="3" value={signature} onChange={(_e) => setSignature(_e.target.value)} />
        </Col>
      </Row>
      {type === 'stake' && (
        <Row className="mt-2">
          <Col>
            <Button disabled={!approveEnabled} loading={isApproving} onClick={() => approve?.()}>
              Approve
            </Button>
          </Col>
        </Row>
      )}
      <Row className="mt-2 mb-2">
        <Col>
          {type === 'stake' && (
            <Button
              disabled={!updateSentinelRegistrationByStakingEnabled}
              loading={isUpdatingSentinelRegistrationByStaking}
              onClick={() => updateSentinelRegistrationByStaking?.()}
            >
              Stake & Register
            </Button>
          )}
          {type === 'borrow' && (
            <Button
              disabled={!updateSentinelRegistrationByBorrowingEnabled}
              loading={isUpdatingSentinelRegistrationByBorrowing}
              onClick={() => updateSentinelRegistrationByBorrowing?.()}
            >
              Borrow & Register
            </Button>
          )}
        </Col>
      </Row>
    </Modal>
  )
}

export default RegisterSentinelModal
