import React from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'

import Box from '../../base/Box'
import Activities from '../../complex/Activities'
import Proposals from '../../complex/Proposals'
import SentinelHistoricalChart from '../../complex/SentinelHistoricalChart'
import Stats from '../../complex/Stats'
import PageTemplate from '../../templates/PageTemplate'

const StyledActivities = styled(Activities)`
  height: 232px;
  max-height: 232px;
  overflow: auto;
`

const TabsBox = styled(Box)`
  padding: 0;
  padding-bottom: 0.5rem;
`

const Overview = () => {
  return (
    <PageTemplate>
      <Row>
        <Col xs={12} lg={6}>
          <Stats />
        </Col>
        <Col xs={12} lg={6}>
          <StyledActivities />
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
        <TabsBox>
          <Proposals />
        </TabsBox>
      </div>
    </PageTemplate>
  )
}

export default Overview
