import React, { useCallback, useEffect, useMemo } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'

import { useBalances } from '../../../hooks/use-balances'
import { useUserStake } from '../../../hooks/use-staking-manager'
import { toastifyTransaction } from '../../../utils/transaction'
import { useUnstake } from '../../../hooks/use-staking-manager'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import Button from '../../base/Button'
import MiniButton from '../../base/MiniButton'
import AdvancedInput from '../../base/AdvancedInput'

const MaxButton = styled(MiniButton)`
  margin-left: 0.75rem;

  @media (max-width: 767.98px) {
    bottom: 157px;
  }
`

const UnstakeModal = ({ show, onClose }) => {
  const { formattedPntBalance, formattedDaoPntBalance } = useBalances()
  const { availableToUnstakePntAmount, fomattedAvailableToUnstakePntAmount } = useUserStake()
  const { amount, isUnstaking, setAmount, unstake, unstakeData, unstakeError } = useUnstake()

  useEffect(() => {
    if (unstakeError) {
      if (!unstakeError.message.includes('user rejected transaction')) {
        toast.error(unstakeError.message)
      }
    }
  }, [unstakeError])

  useEffect(() => {
    if (unstakeData) {
      toastifyTransaction(unstakeData, () => {
        setAmount('')
      })
    }
  }, [unstakeData, setAmount])

  useEffect(() => {
    if (!show) {
      setAmount('0')
    }
  }, [show, setAmount])

  const onMax = useCallback(() => {
    setAmount(availableToUnstakePntAmount)
  }, [availableToUnstakePntAmount, setAmount])

  const unstakeButtonDisabled = useMemo(
    () =>
      BigNumber(amount).isGreaterThan(availableToUnstakePntAmount) ||
      BigNumber(amount).isLessThanOrEqualTo(0) ||
      BigNumber(amount).isNaN(),
    [amount, availableToUnstakePntAmount]
  )

  return (
    <Modal show={show} title="Unstake PNT from pNetwork DAO" onClose={onClose} size="lg">
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
        <Col xs={6}>
          <Text>Available to unstake</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{fomattedAvailableToUnstakePntAmount}</Text>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <AdvancedInput
            contentLeft={<MaxButton onClick={onMax}>MAX</MaxButton>}
            value={amount}
            onChange={(_e) => setAmount(_e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mt-2 mb-2">
        <Col>
          <Button disabled={unstakeButtonDisabled} loading={isUnstaking} onClick={() => unstake?.()}>
            Unstake
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default UnstakeModal
