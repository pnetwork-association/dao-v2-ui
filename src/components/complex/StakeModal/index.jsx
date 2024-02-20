import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount, useChainId } from 'wagmi'
import { toast } from 'react-toastify'
import BigNumber from 'bignumber.js'
import { gnosis } from 'wagmi/chains'

import { useStake } from '../../../hooks/use-staking-manager'
import { useBalances } from '../../../hooks/use-balances'
import { toastifyTransaction } from '../../../utils/transaction'
import settings from '../../../settings'
import { isValidError } from '../../../utils/errors'
import { useIsSafe } from '../../../hooks/use-safe-check'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import Button from '../../base/Button'
import Line from '../../base/Line'
import Input from '../../base/Input'
import Slider from '../../base/Slider'
import InputAmount from '../../base/InputAmount'
import InfoBox from '../../base/InfoBox'

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
  const activeChainId = useChainId()
  const isSafe = useIsSafe()

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
    if (approveData || isApproving) {
      toastifyTransaction(approveData, isApproving, { chainId: activeChainId })
    }
  }, [approveData, isApproving, activeChainId])

  useEffect(() => {
    if (stakeData || isStaking) {
      toastifyTransaction(stakeData, isStaking, { chainId: activeChainId })
    }
  }, [stakeData, isStaking, activeChainId])

  useEffect(() => {
    setReceiver(address)
  }, [address, setReceiver])

  useEffect(() => {
    if (!show) {
      setAmount('0')
      setShowAdvancedOptions(false)
    }
  }, [show, setAmount])

  const onShowOrHideAdvancedOptions = useCallback(() => {
    setShowAdvancedOptions(!showAdvancedOptions)
  }, [showAdvancedOptions])

  const stakeButtonText = useMemo(
    () => (BigNumber(amount).isGreaterThan(pntBalance) && !stakeEnabled ? 'Insufficent amount' : 'Stake'),
    [amount, pntBalance, stakeEnabled]
  )

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
          <InputAmount
            max={pntBalance}
            value={amount}
            onChange={(_e) => setAmount(_e.target.value)}
            onMax={(_max) => setAmount(_max)}
          />
        </Col>
      </Row>
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
      <Row className="mt-2">
        <Col>
          <Button disabled={!approveEnabled} onClick={approve} loading={isApproving}>
            Approve
          </Button>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <Button disabled={!stakeEnabled} loading={isStaking} onClick={stake}>
            {stakeButtonText}
          </Button>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col className="text-center">
          <AdvancedOptionsText variant={'secondary1'} onClick={onShowOrHideAdvancedOptions}>
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
            Lending require staking.
            <br />
            Withdrawals from pNetwork DAO are subjected to a cooldown. Withdrawals will become available after{' '}
            {settings.stakingManager.minStakeDays} days from staking.
          </InfoText>
        </Col>
      </Row>
    </Modal>
  )
}

export default StakeModal
