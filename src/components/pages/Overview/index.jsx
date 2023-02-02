import React from 'react'
import { Col, Row } from 'react-bootstrap'

import Box from '../../base/Box'
import Activities from '../../complex/Activities'
import Proposals from '../../complex/Proposals'
import SentinelHistoricalChart from '../../complex/SentinelHistoricalChart'
import Stats from '../../complex/Stats'
import PageTemplate from '../../templates/PageTemplate'

const Overview = () => {
  return (
    <PageTemplate>
      <Row>
        <Col xs={12} lg={6}>
          <Stats />
        </Col>
        <Col xs={12} lg={6} className="mt-4 mt-lg-0">
          <Activities />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Box>
            <SentinelHistoricalChart />
          </Box>
        </Col>
      </Row>
      <div className="mt-4">
        <Box bodyStyle={{ padding: 0 }}>
          <Proposals />
        </Box>
      </div>
    </PageTemplate>
  )
}

export default Overview
