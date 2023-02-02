import React, { Fragment, useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
// import { useAccount } from 'wagmi'

import { useEpochs } from '../../../hooks/use-epochs'
import { useSentinel } from '../../../hooks/use-registration-manager'

import Box from '../../base/Box'
import Text from '../../base/Text'
import Line from '../../base/Line'
import RegisterSentinelModal from '../RegisterSentinelModal'
import SentinelHistoricalChart from '../SentinelHistoricalChart'
import Button from '../../base/Button'

const SentinelStats = ({ type = 'stake' }) => {
  // const { address } = useAccount()
  const [showRegisterSentinelModal, setShowRegisterSentinelModal] = useState(false)
  const { formattedCurrentEpoch } = useEpochs()
  const { kind, startEpoch, endEpoch, sentinelNickname } = useSentinel()

  const enabled = useMemo(() => {
    if (!kind) return true
    if (type === 'stake' && kind === '0x01') return true
    if (type === 'borrow' && kind === '0x02') return true
    return false
  }, [type, kind])

  return (
    <Fragment>
      <Box>
        <Row>
          <Col xs={6}>
            <Text>Epoch</Text>
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
        <Row className="justify-content-center mt-3">
          <Col xs={12} lg={4}>
            <Button disabled={!enabled} onClick={() => setShowRegisterSentinelModal(true)}>
              MANAGE
            </Button>
          </Col>
        </Row>
      </Box>
      <Box className="mt-4">{/*(!address || kind === '0x00') &&*/ <SentinelHistoricalChart />}</Box>
      <RegisterSentinelModal
        show={showRegisterSentinelModal}
        onClose={() => setShowRegisterSentinelModal(false)}
        type={type}
      />
    </Fragment>
  )
}

export default SentinelStats
