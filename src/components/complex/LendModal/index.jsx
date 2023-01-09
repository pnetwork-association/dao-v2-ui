import React, { useCallback, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { toast } from 'react-toastify'

import {
  useLend,
  useAccountLendedAmountInTheCurrentEpoch,
  useAccountLendedAmountInTheNextEpochOf
} from '../../../hooks/use-borrowing-manager'
import { useBalances } from '../../../hooks/use-balances'
import { useEpochs } from '../../../hooks/use-epochs'
import { toastifyTransaction } from '../../../utils/transaction'
import { SECONDS_IN_ONE_DAY } from '../../../utils/time'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import Button from '../../base/Button'
import MiniButton from '../../base/MiniButton'
import Line from '../../base/Line'
import AdvancedInput from '../../base/AdvancedInput'
// import Input from '../../base/Input'
import Slider from '../../base/Slider'

/*const InfoText = styled(Text)`
  font-size: 12px;
`*/

const MaxButton = styled(MiniButton)`
  margin-left: 0.75rem;

  @media (max-width: 767.98px) {
    bottom: 157px;
  }
`

/*const ReceiverInput = styled(Input)`
  height: 50px;
  font-size: 17px;
`*/

const LendModal = ({ show, onClose }) => {
  const { currentEpoch, epochDuration, formattedCurrentEpoch, formattedEpochDuration } = useEpochs()
  const { pntBalance, formattedPntBalance, formattedDaoPntBalance } = useBalances()
  const {
    amount,
    approve,
    approveData,
    approveEnabled,
    approveError,
    duration,
    epochs,
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
      setDuration(7)
    }
  }, [show, setAmount, setDuration])

  const onMax = useCallback(() => {
    setAmount(pntBalance)
  }, [pntBalance, setAmount])

  const onChangeDuration = useCallback(
    (_days) => {
      setDuration(_days)
      const newEpochs = Math.floor((_days * SECONDS_IN_ONE_DAY) / epochDuration) - 1
      setEpochs(newEpochs < currentEpoch ? currentEpoch : newEpochs)
    },
    [epochDuration, currentEpoch, setDuration, setEpochs]
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
            onChange={(_e) => setAmount(_e.target.value)}
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
          <Slider min={1} max={730} defaultValue={duration} value={duration} onChange={onChangeDuration} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col xs={6}>
          <Text>APY</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>TODO%</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Text>Number of epochs</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{epochs}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Text>Lending starts at epoch</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{currentEpoch || currentEpoch === 0 ? `#${currentEpoch + 1}` : '-'}</Text>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Text>Lending ends at epoch</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{currentEpoch || currentEpoch === 0 ? `#${currentEpoch + epochs}` : '-'}</Text>
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
