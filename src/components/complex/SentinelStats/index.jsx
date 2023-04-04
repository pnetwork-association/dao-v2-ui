import React, { Fragment, useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
// import { useAccount } from 'wagmi'

import { useEpochs } from '../../../hooks/use-epochs'
import { useSentinel } from '../../../hooks/use-registration-manager'
import { BORROWING_SENTINEL, STAKING_SENTINEL } from '../../../contants'
import settings from '../../../settings'

import Box from '../../base/Box'
import Text from '../../base/Text'
import Line from '../../base/Line'
import RegisterSentinelModal from '../RegisterSentinelModal'
import SentinelDurationModal from '../SentinelDurationModal'
import UnstakeModal from '../../complex/UnstakeModal'
import Button from '../../base/Button'

const SentinelStats = ({ type = 'stake' }) => {
  // const { address } = useAccount()
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)
  const [showDurationModal, setShowDurationModal] = useState(false)
  const [showRegisterSentinelModal, setShowRegisterSentinelModal] = useState(false)
  const { formattedCurrentEpoch } = useEpochs()
  const { kind, startEpoch, endEpoch, sentinelNickname } = useSentinel()

  const enabled = useMemo(() => {
    if (!kind) return true
    if (type === 'stake' && kind === STAKING_SENTINEL) return true
    if (type === 'borrow' && kind === BORROWING_SENTINEL) return true
    return false
  }, [type, kind])

  return (
    <Fragment>
      <Box>
        <Row>
          <Col xs={6}>
            <Text>Current epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{formattedCurrentEpoch}</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={6}>
            <Text>Your Sentinel</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{enabled ? sentinelNickname : '-'}</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={6}>
            <Text>Your Sentinel registration starts at epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{enabled && startEpoch ? `#${startEpoch}` : '-'}</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={6}>
            <Text>Your Sentinel registration ends at epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{enabled && endEpoch ? `#${endEpoch}` : '-'}</Text>
          </Col>
        </Row>
        <Line />
        <Row className="justify-content-center mt-2">
          {type === 'borrow' && (
            <Col xs={12} lg={6}>
              <Button disabled={!enabled} onClick={() => setShowRegisterSentinelModal(true)}>
                Manage
              </Button>
            </Col>
          )}
          {type === 'stake' && (
            <Fragment>
              <Col className="mt-2" lg={4}>
                <Button disabled={!enabled} onClick={() => setShowUnstakeModal(true)}>
                  Unstake
                </Button>
              </Col>
              <Col className="mt-2" lg={4}>
                <Button disabled={!enabled} onClick={() => setShowRegisterSentinelModal(true)}>
                  Manage
                </Button>
              </Col>
              <Col className="mt-2" lg={4}>
                <Button disabled={!kind} onClick={() => setShowDurationModal(true)}>
                  Increase duration
                </Button>
              </Col>
            </Fragment>
          )}
        </Row>
      </Box>
      <RegisterSentinelModal
        show={showRegisterSentinelModal}
        onClose={() => setShowRegisterSentinelModal(false)}
        type={type}
      />
      <UnstakeModal
        show={showUnstakeModal}
        contractAddress={settings.contracts.stakingManagerRM}
        onClose={() => setShowUnstakeModal(false)}
      />
      <SentinelDurationModal show={showDurationModal} onClose={() => setShowDurationModal(false)} type={type} />
    </Fragment>
  )
}

export default SentinelStats
