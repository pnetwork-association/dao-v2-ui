import React, { useEffect, useMemo } from 'react'
import { Row, Col } from 'react-bootstrap'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'
import { useChainId } from 'wagmi'

import { useBalances } from '../../../hooks/use-balances'
import { useUserStake } from '../../../hooks/use-staking-manager'
import { toastifyTransaction } from '../../../utils/transaction'
import { useUnstake } from '../../../hooks/use-staking-manager'
import { isValidError } from '../../../utils/errors'
import { useIsSafe } from '../../../hooks/use-safe-check'
import { chainIdToNetworkName } from '../../../contants'
import InfoBox from '../../base/InfoBox'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import Button from '../../base/Button'
import InputAmount from '../../base/InputAmount'
import ChainSelection from '../../complex/ChainSelection'

const UnstakeModal = ({ show, contractAddress, onClose }) => {
  const activeChainId = useChainId()
  const { formattedPntBalance, formattedDaoPntBalance } = useBalances()
  const { availableToUnstakePntAmount, fomattedAvailableToUnstakePntAmount } = useUserStake({ contractAddress })
  const {
    amount,
    chainId: selectedChainId,
    isUnstaking,
    setAmount,
    setChainId,
    unstake,
    unstakeData,
    unstakeError
  } = useUnstake({
    contractAddress
  })
  const isSafe = useIsSafe()

  useEffect(() => {
    if (unstakeError && isValidError(unstakeError)) {
      toast.error(unstakeError.message)
    }
  }, [unstakeError])

  useEffect(() => {
    if (unstakeData) {
      toastifyTransaction(unstakeData, { chainId: activeChainId }, () => {
        setAmount('')
      })
    }
  }, [unstakeData, setAmount, activeChainId])

  useEffect(() => {
    if (!show) {
      setAmount('0')
    }
  }, [show, setAmount])

  const unstakeButtonDisabled = useMemo(
    () =>
      BigNumber(amount).isGreaterThan(availableToUnstakePntAmount) ||
      BigNumber(amount).isLessThanOrEqualTo(0) ||
      BigNumber(amount).isNaN(),
    [amount, availableToUnstakePntAmount]
  )

  const unstakeButtonText = useMemo(
    () => (BigNumber(amount).isGreaterThan(availableToUnstakePntAmount) ? 'Insufficent amount' : 'Unstake'),
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
          <InputAmount
            value={amount}
            max={availableToUnstakePntAmount}
            onChange={(_e) => setAmount(_e.target.value)}
            onMax={(_max) => setAmount(_max)}
          />
        </Col>
      </Row>
      {isSafe && selectedChainId !== activeChainId && (
        <Row className="mt-2">
          <Col>
            <InfoBox>
              It looks like that you are connected with a Gnosis Safe wallet and you want to unstake to a chain where
              the receiving address may not be a Gnosis Safe wallet under your control. Make sure of the above or else
              select {chainIdToNetworkName[activeChainId]} as the destinatioin chain
            </InfoBox>
          </Col>
        </Row>
      )}
      <Row className="mt-2">
        <Col xs={6}>
          <Text>Destination chain</Text>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>
          <ChainSelection onChange={setChainId} />
        </Col>
      </Row>
      <Row className="mt-2 mb-2">
        <Col>
          <Button disabled={unstakeButtonDisabled} loading={isUnstaking} onClick={() => unstake?.()}>
            {unstakeButtonText}
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default UnstakeModal
