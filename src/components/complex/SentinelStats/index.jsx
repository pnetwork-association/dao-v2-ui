import React, { Fragment, useState } from 'react'
import { Col, Row } from 'react-bootstrap'

import { useEpochs } from '../../../hooks/use-epochs'
import { useSentinel } from '../../../hooks/use-registration-manager'

import Box from '../../base/Box'
import Text from '../../base/Text'
import Line from '../../base/Line'
import RegisterSentinelModal from '../RegisterSentinelModal'
import Button from '../../base/Button'

const SentinelStats = () => {
  const [showRegisterSentinelModal, setShowRegisterSentinelModal] = useState(false)
  const { formattedCurrentEpoch } = useEpochs()
  const { kind, startEpoch, endEpoch } = useSentinel()

  console.log(kind, startEpoch, endEpoch)

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
            <Text variant={'text2'}>{'todo'}</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={6}>
            <Text>Your Sentinel registration starts at epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{'todo'}</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={6}>
            <Text>Your Sentinel registration ends at epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{'todo'}</Text>
          </Col>
        </Row>
        <Line />
        <Row className="justify-content-center mt-3">
          <Col xs={12} lg={4}>
            <Button onClick={() => setShowRegisterSentinelModal(true)}>MANAGE</Button>
          </Col>
        </Row>
      </Box>
      <RegisterSentinelModal
        show={showRegisterSentinelModal}
        onClose={() => setShowRegisterSentinelModal(false)}
        type="stake"
      />
    </Fragment>
  )
}

export default SentinelStats
