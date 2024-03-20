import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Chart } from 'react-chartjs-2'
import styled, { ThemeContext } from 'styled-components'
import { useChainId } from 'wagmi'
import BigNumber from 'bignumber.js'
import { gnosis } from 'wagmi/chains'

import { useEpochs } from '../../../hooks/use-epochs'
import { useBalances } from '../../../hooks/use-balances'
import {
  useBorrowingSentinelProspectus,
  useEffectiveEpochsForSentinelRegistration,
  useRegisterSentinel,
  useSentinel
} from '../../../hooks/use-registration-manager'
import { useEpochsBorrowableAmount } from '../../../hooks/use-lending-manager'
import settings from '../../../settings'
import { range } from '../../../utils/time'
import { toastifyTransaction } from '../../../utils/transaction'
import { formatAssetAmount } from '../../../utils/amount'
import { STAKING_NODE, BORROWING_NODE } from '../../../contants'
import { useIsSafe } from '../../../hooks/use-safe-check'

import Button from '../../base/Button'
import InputAmount from '../../base/InputAmount'
import Line from '../../base/Line'
import Modal from '../../base/Modal'
import Slider from '../../base/Slider'
import Text from '../../base/Text'
import TextArea from '../../base/TextArea'
import A from '../../base/A'
import InfoBox from '../../base/InfoBox'

const ChartContainer = styled.div`
  display: inline-block;
  position: relative;
  width: 100%;
  height: 320px;
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
          const label = _context.dataset.labels[_context.parsed.x]
          return `${label} ${formatAssetAmount(_context.parsed.y, 'USD', { decimals: 2 })}`
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

const RegisterNodeModal = ({ show, onClose = () => null, type = 'stake' }) => {
  const theme = useContext(ThemeContext)
  const activeChainId = useChainId()
  const { formattedDaoPntBalance, formattedPntBalance, pntBalance } = useBalances()
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
    signature,
    updateSentinelRegistrationByBorrowing,
    updateSentinelRegistrationByBorrowingData,
    updateSentinelRegistrationByBorrowingEnabled,
    updateSentinelRegistrationByStaking,
    updateSentinelRegistrationByStakingData,
    updateSentinelRegistrationByStakingEnabled
  } = useRegisterSentinel({
    type
  })
  const isSafe = useIsSafe()
  const isAutoClosing = useRef(false)

  const { kind, endEpoch: currentEndEpoch = 0 } = useSentinel()
  const enabled = useMemo(() => {
    if (type === 'stake' && kind === STAKING_NODE) return true
    if (type === 'borrow' && kind === BORROWING_NODE) return true
  }, [type, kind])

  const {
    endEpoch,
    epochsRevenues: prospectusBorrowingEpochsRevenues,
    setEpochs: setProspectusBorrowingEpochs
  } = useBorrowingSentinelProspectus()

  useEffect(() => {
    if (approveData) {
      toastifyTransaction(approveData, { chainId: activeChainId })
    }
  }, [approveData, activeChainId])

  useEffect(() => {
    if (updateSentinelRegistrationByStakingData) {
      toastifyTransaction(updateSentinelRegistrationByStakingData, { chainId: activeChainId })
    }
  }, [updateSentinelRegistrationByStakingData, activeChainId])

  useEffect(() => {
    if (updateSentinelRegistrationByStakingData && !isAutoClosing.current) {
      isAutoClosing.current = true
      updateSentinelRegistrationByStakingData.wait(1).then(onClose).catch(console.error)
    }
  }, [updateSentinelRegistrationByStakingData, onClose])

  useEffect(() => {
    if (updateSentinelRegistrationByBorrowingData) {
      toastifyTransaction(updateSentinelRegistrationByBorrowingData, { chainId: activeChainId })
    }
  }, [updateSentinelRegistrationByBorrowingData, activeChainId])

  useEffect(() => {
    if (updateSentinelRegistrationByBorrowingData && !isAutoClosing.current) {
      isAutoClosing.current = true
      updateSentinelRegistrationByBorrowingData.wait(1).then(onClose).catch(console.error)
    }
  }, [updateSentinelRegistrationByBorrowingData, onClose])

  useEffect(() => {
    if (!show) {
      setEpochs(1)
      setProspectusBorrowingEpochs(1)
      setAmount(0)
      setSignature('')
    } else {
      isAutoClosing.current = false
    }
  }, [show, setEpochs, setAmount, setProspectusBorrowingEpochs, setSignature])

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

    return range(currentEpoch + 1, endEpoch + 1)
  }, [currentEpoch, endEpoch])

  const { epochsBorrowableAmount } = useEpochsBorrowableAmount()

  const chartData = useMemo(() => {
    return {
      labels: chartEpochs.map((_epoch) => `Epoch #${_epoch}`),
      datasets: [
        {
          labels: prospectusBorrowingEpochsRevenues.map((_val, _epoch) => {
            if (
              epochsBorrowableAmount[_epoch] &&
              epochsBorrowableAmount[_epoch].isLessThan(settings.registrationManager.minStakeAmount)
            )
              return 'Not Enough borrowable amount in the selected epoch. If the amount was available, the estimated revenues would be'

            return 'Revenues'
          }),
          data: prospectusBorrowingEpochsRevenues,
          backgroundColor: prospectusBorrowingEpochsRevenues.map((_val, _epoch) => {
            if (
              epochsBorrowableAmount[_epoch] &&
              epochsBorrowableAmount[_epoch].isLessThan(settings.registrationManager.minStakeAmount)
            )
              return '#FFCE55'
            if (_val < settings.registrationManager.estimatedSentinelRunningCost) return theme.lightRed
            return theme.lightGreen
          }),
          type: 'bar',
          spanGaps: true,
          yAxisID: 'estimatedRevenues'
        }
      ]
    }
  }, [chartEpochs, prospectusBorrowingEpochsRevenues, theme, epochsBorrowableAmount])

  const updateSentinelRegistrationByStakingButtonText = useMemo(
    () =>
      type === 'stake'
        ? BigNumber(amount).isGreaterThan(pntBalance) && !updateSentinelRegistrationByStakingEnabled
          ? 'Insufficient amount'
          : 'Stake & Register'
        : null,
    [type, amount, pntBalance, updateSentinelRegistrationByStakingEnabled]
  )

  const { startEpoch: effectiveStartEpoch, endEpoch: effectiveEndEpoch } = useEffectiveEpochsForSentinelRegistration({
    type,
    epochs,
    currentEndEpoch
  })

  const isThereEnoughBorrowableAmount = useMemo(() => {
    if (type === 'staking') return true

    for (let epoch = effectiveStartEpoch; epoch <= effectiveEndEpoch; epoch++) {
      if (
        epochsBorrowableAmount[epoch] &&
        epochsBorrowableAmount[epoch].isLessThan(settings.registrationManager.borrowAmount)
      )
        return false
    }
    return true
  }, [effectiveStartEpoch, effectiveEndEpoch, epochsBorrowableAmount, type])

  return (
    <Modal show={show} title="Register Node" onClose={onClose} size="lg">
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
          <Text>Your registration ends at epoch</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{enabled ? `#${currentEndEpoch}` : '-'}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <Text>Estimated running Node cost</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{settings.registrationManager.estimatedSentinelRunningCost} USD</Text>
        </Col>
      </Row>
      <Line />
      {type === 'stake' && (
        <Fragment>
          <Row className="mt-1">
            <Col>
              <InputAmount
                max={pntBalance}
                value={amount}
                onChange={(_e) => setAmount(_e.target.value)}
                onMax={(_max) => setAmount(_max)}
              />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col xs={6}>
              <Text>Number of epochs</Text>
            </Col>
            <Col xs={6} className="text-end">
              <Text variant={'text2'}>{epochs}</Text>
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
          <Row className="mt-1">
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
        <Col xs={8}>
          <Text>Registration ends at epoch</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{effectiveEndEpoch ? `#${effectiveEndEpoch}` : '-'}</Text>
        </Col>
      </Row>
      <Line />
      <Row>
        <Col xs={6}>
          <Text>Node signature</Text>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>
          <TextArea rows="3" value={signature} onChange={(_e) => setSignature(_e.target.value)} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Text size="sm">
            Learn more about nodes and how to become a pNetwork node operator in the dedicated section of the Wiki:{' '}
            <A href={settings.links.docs} target="_blank" size="sm">
              {settings.links.docs}
            </A>{' '}
          </Text>
        </Col>
      </Row>
      {isSafe && activeChainId !== gnosis.id && (
        <Row className="mt-2">
          <Col>
            <InfoBox>
              it looks like you are connected with a Gnosis Safe wallet. Make sure you control the same address on{' '}
              {gnosis.name} as well.
            </InfoBox>
          </Col>
        </Row>
      )}
      {type === 'stake' && (
        <Row className="mt-3">
          <Col>
            <Button disabled={!approveEnabled} loading={isApproving} onClick={approve}>
              Approve
            </Button>
          </Col>
        </Row>
      )}
      <Row className={`mt-${type === 'borrow' ? 3 : 2} mb-2`}>
        <Col>
          {type === 'stake' && (
            <Button
              disabled={!updateSentinelRegistrationByStakingEnabled}
              loading={isUpdatingSentinelRegistrationByStaking}
              onClick={updateSentinelRegistrationByStaking}
            >
              {updateSentinelRegistrationByStakingButtonText}
            </Button>
          )}
          {type === 'borrow' && (
            <Fragment>
              <Button
                disabled={!updateSentinelRegistrationByBorrowingEnabled || !isThereEnoughBorrowableAmount}
                loading={isUpdatingSentinelRegistrationByBorrowing}
                onClick={updateSentinelRegistrationByBorrowing}
              >
                Borrow & Register
              </Button>
              {!isThereEnoughBorrowableAmount && (
                <Row className="justify-content-center mt-2 mb-2">
                  <Col xs={12} xl={12}>
                    <InfoBox type="warning">
                      Not enough borrowable amount in the lending pool for the number of epochs selected. Please reduce
                      it or wait for additional PNT liquidity to be available in the lending pool.
                    </InfoBox>
                  </Col>
                </Row>
              )}
            </Fragment>
          )}
        </Col>
      </Row>
    </Modal>
  )
}

export default RegisterNodeModal
