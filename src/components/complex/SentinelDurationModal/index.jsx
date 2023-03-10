import React, { useEffect, useMemo } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useChainId } from 'wagmi'
import { toast } from 'react-toastify'

import { useEpochs } from '../../../hooks/use-epochs'
import { useBalances } from '../../../hooks/use-balances'
import { useIncreaseStakingSentinelRegistrationDuration, useSentinel } from '../../../hooks/use-registration-manager'
import { toastifyTransaction } from '../../../utils/transaction'
import { isValidError } from '../../../utils/errors'

import Button from '../../base/Button'
import Line from '../../base/Line'
import Modal from '../../base/Modal'
import Slider from '../../base/Slider'
import Text from '../../base/Text'

const SentinelDurationModal = ({ show, onClose }) => {
  const { formattedDaoPntBalance, formattedPntBalance } = useBalances()
  const { formattedCurrentEpoch } = useEpochs()
  const activeChainId = useChainId()
  const {
    epochs,
    increaseStakingSentinelRegistrationDuration,
    increaseStakingSentinelRegistrationDurationData,
    increaseStakingSentinelRegistrationDurationError,
    increaseStakingSentinelRegistrationDurationLoading,
    setEpochs
  } = useIncreaseStakingSentinelRegistrationDuration()

  const { endEpoch: currentEndEpoch } = useSentinel()

  useEffect(() => {
    if (
      increaseStakingSentinelRegistrationDurationError &&
      isValidError(increaseStakingSentinelRegistrationDurationError)
    ) {
      toast.error(increaseStakingSentinelRegistrationDurationError.message)
    }
  }, [increaseStakingSentinelRegistrationDurationError])

  useEffect(() => {
    if (increaseStakingSentinelRegistrationDurationData) {
      setEpochs(0)
      toastifyTransaction(increaseStakingSentinelRegistrationDurationData, { chainId: activeChainId })
    }
  }, [increaseStakingSentinelRegistrationDurationData, setEpochs, activeChainId])

  useEffect(() => {
    if (!show) {
      setEpochs(0)
    }
  }, [show, setEpochs])

  const effectiveEndEpoch = useMemo(() => currentEndEpoch + epochs, [currentEndEpoch, epochs])

  return (
    <Modal show={show} title="Increase duration" onClose={onClose} size="lg">
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
          <Text>Your current registration ends at epoch</Text>
        </Col>
        <Col xs={4} className="text-end">
          <Text variant={'text2'}>{currentEndEpoch ? `#${currentEndEpoch}` : '-'}</Text>
        </Col>
      </Row>
      <Line />
      <Row className="mt-3">
        <Col xs={6}>
          <Text>Number of epochs</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{epochs}</Text>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>
          <Slider min={0} max={24} defaultValue={epochs} value={epochs} onChange={(_epochs) => setEpochs(_epochs)} />
        </Col>
      </Row>
      <Row className="mt-2">
        <Col xs={6}>
          <Text>Registration ends at epoch</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{effectiveEndEpoch ? `#${effectiveEndEpoch}` : '-'}</Text>
        </Col>
      </Row>
      <Row className="mt-2 mb-2">
        <Col>
          <Button
            disabled={epochs === 0}
            loading={increaseStakingSentinelRegistrationDurationLoading}
            onClick={() => increaseStakingSentinelRegistrationDuration?.()}
          >
            Increase duration
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default SentinelDurationModal
