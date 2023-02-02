import React from 'react'
import { Col, Row } from 'react-bootstrap'

import { useStats } from '../../../hooks/use-stats'
import { useProposals } from '../../../hooks/use-proposals'

import Box from '../../base/Box'
import Line from '../../base/Line'
import ProgressBar from '../../base/ProgressBar'
import Text from '../../base/Text'

const Stats = () => {
  const {
    formattedCurrentEpoch,
    formattedCurrentEpochEndAt,
    formattedDaoPntTotalSupply,
    formattedPercentageStakedPnt,
    percentageStakedPnt
  } = useStats()
  const proposals = useProposals()

  return (
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
      <Row className="mt-2">
        <Col xs={6}>
          <Text>Current epoch ends at</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{formattedCurrentEpochEndAt}</Text>
        </Col>
      </Row>
      <Line />
      <Row className="mt-2">
        <Col xs={6}>
          <Text>Total number of DAO PNT</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{formattedDaoPntTotalSupply}</Text>
        </Col>
      </Row>
      <Line />
      <Row>
        <Col xs={6}>
          <Text>% of PNT staked in the DAO</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{formattedPercentageStakedPnt}</Text>
        </Col>
      </Row>
      <Row className="mt-1 mb-2">
        <Col>
          <ProgressBar now={percentageStakedPnt} />
        </Col>
      </Row>
      <Line />
      <Row>
        <Col xs={6}>
          <Text>Number of proposals</Text>
        </Col>
        <Col xs={6} className="text-end">
          <Text variant={'text2'}>{proposals ? proposals.length : '-'}</Text>
        </Col>
      </Row>
    </Box>
  )
}

export default Stats
