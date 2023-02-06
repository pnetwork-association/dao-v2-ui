import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'

import { useStake } from '../../../hooks/use-staking-manager'
import { useBalances } from '../../../hooks/use-balances'
import { toastifyTransaction } from '../../../utils/transaction'
import settings from '../../../settings'
import { isValidError } from '../../../utils/errors'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import Button from '../../base/Button'
import Line from '../../base/Line'
import Input from '../../base/Input'
import Slider from '../../base/Slider'
import InputAmount from '../../base/InputAmount'

const InfoText = styled(Text)`
  font-size: 12px;
`

const AdvancedOptionsText = styled(Text)`
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  @media (max-width: 767.98px) {
    font-size: 11px;
  }
`

const ReceiverInput = styled(Input)`
  height: 50px;
  font-size: 17px;
`

const StakeModal = ({ show, onClose }) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const { pntBalance, formattedPntBalance, formattedDaoPntBalance } = useBalances()
  const { address } = useAccount()

  const {
    amount,
    approve,
    approveData,
    approveEnabled,
    approveError,
    duration,
    isApproving,
    isStaking,
    receiver,
    setAmount,
    setDuration,
    setReceiver,
    stake,
    stakeData,
    stakeEnabled,
    stakeError
  } = useStake()

  useEffect(() => {
    if (approveError && isValidError(approveError)) {
      toast.error(approveError.message)
    }
  }, [approveError])

  useEffect(() => {
    if (stakeError && isValidError(stakeError)) {
      toast.error(stakeError.message)
    }
  }, [stakeError])

  useEffect(() => {
    if (approveData) {
      toastifyTransaction(approveData)
    }
  }, [approveData])

  useEffect(() => {
    if (stakeData) {
      toastifyTransaction(stakeData)
    }
  }, [stakeData])

  useEffect(() => {
    setReceiver(address)
  }, [address, setReceiver])

  useEffect(() => {
    if (!show) {
      setAmount('0')
      setShowAdvancedOptions(false)
    }
  }, [show, setAmount])

  const onMax = useCallback(() => {
    setAmount(pntBalance)
  }, [pntBalance, setAmount])

  const onShowOrHideAdvancedOptions = useCallback(() => {
    setShowAdvancedOptions(!showAdvancedOptions)
  }, [showAdvancedOptions])

  return (
    <Modal show={show} title="Stake PNT in pNetwork DAO" onClose={onClose} size="lg">
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
      <Row className="mt-3">
        <Col>
          <InputAmount onMax={onMax} value={amount} onChange={(_e) => setAmount(_e.target.value)} />
        </Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <Button disabled={!approveEnabled} onClick={() => approve?.()} loading={isApproving}>
            Approve
          </Button>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <Button disabled={!stakeEnabled} loading={isStaking} onClick={() => stake?.()}>
            Stake
          </Button>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col className="text-center">
          <AdvancedOptionsText variant={'text4'} onClick={onShowOrHideAdvancedOptions}>
            {showAdvancedOptions ? 'Hide' : 'Show'} advanced Options
          </AdvancedOptionsText>
        </Col>
      </Row>
      {showAdvancedOptions && (
        <Fragment>
          <Line />
          <Row>
            <Col xs={6}>
              <Text>Lock time</Text>
            </Col>
            <Col xs={6} className="text-end">
              <Text variant={'text2'}>{duration} days</Text>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Slider
                min={7}
                max={730}
                defaultValue={duration}
                value={duration}
                onChange={(_days) => setDuration(_days)}
              />
            </Col>
          </Row>
          <Row className="mt-2 mb-1">
            <Col>
              <ReceiverInput
                placeholder="receiver here ...."
                value={receiver}
                onChange={(_e) => setReceiver(_e.target.value)}
              />
            </Col>
          </Row>
          <Line />
        </Fragment>
      )}
      <Row className="mt-2 mb-2">
        <Col className="text-center">
          <InfoText>
            Withdrawals from pNetwork DAO are subjected to a cooldown. Withdrawals will become available after{' '}
            {settings.stakingManager.minStakeDays} days from staking.
          </InfoText>
        </Col>
      </Row>
    </Modal>
  )
}

export default StakeModal
