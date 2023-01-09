import React, { Fragment, useCallback, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
// import styled from 'styled-components'

import { useOverview } from '../../../hooks/use-overview'
import { useRegisterSentinel } from '../../../hooks/use-registration-manager'
import { useEpochs } from '../../../hooks/use-epochs'
import { toastifyTransaction } from '../../../utils/transaction'
import settings from '../../../settings'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import Radio from '../../base/Radio'
import Line from '../../base/Line'
import TextArea from '../../base/TextArea'
import Slider from '../../base/Slider'
import InputAmount from '../../base/InputAmount'
import Button from '../../base/Button'
import { formatAssetAmount } from '../../../utils/amount'

const RegisterSentinelModal = ({ show, onClose }) => {
  // const [estimatedEpochs, setEstimatedEpochs] = useState(0)
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
      setEpochs(0)
      // setEstimatedEpochs(0)
      setAmount(0)
    }
  }, [show, setEpochs, setAmount])

  const onChangeType = useCallback(
    (_type) => {
      setAmount(_type === 'borrow' ? settings.registrationManager.minBorrowAmount : 0)
      setType(_type)
    },
    [setAmount, setType]
  )

  return (
    <Modal show={show} title="Register Sentinel" onClose={onClose} size="lg">
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
              <Text>Amount</Text>
            </Col>
            <Col xs={6} className="text-end">
              <Text variant={'text2'}>{formatAssetAmount(amount, 'PNT')}</Text>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col>
              <Slider
                min={settings.registrationManager.minBorrowAmount}
                max={settings.registrationManager.maxBorrowAmount}
                defaultValue={amount}
                value={amount}
                onChange={(_amount) => setAmount(_amount)}
              />
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
      <Row className="mt-2">
        <Col xs={6}>
          <Text>Registration ends at epoch</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{currentEpoch || currentEpoch === 0 ? `#${currentEpoch + epochs}` : '-'}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Text>Registration starts at epoch</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{currentEpoch || currentEpoch === 0 ? `#${currentEpoch + 1}` : '-'}</Text>
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
