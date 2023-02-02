import React from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'

import Box from '../../base/Box'
import Activities from '../../complex/Activities'
import Proposals from '../../complex/Proposals'
import SentinelHistoricalChart from '../../complex/SentinelHistoricalChart'
import Stats from '../../complex/Stats'
import PageTemplate from '../../templates/PageTemplate'

const ActivitiesContainer = styled.div`
  border-radius: 10px;
  overflow: hidden;
`

const StyledActivities = styled(Activities)`
  height: 186px;
  max-height: 186px;
  overflow-y: auto;
`

const Overview = () => {
  return (
    <PageTemplate>
      <Row>
        <Col xs={12} lg={6}>
          <Stats />
        </Col>
        <Col xs={12} lg={6} className="mt-4 mt-lg-0">
          <ActivitiesContainer>
            <StyledActivities />
          </ActivitiesContainer>
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
        <Box noPadding>
          <Proposals />
        </Box>
      </div>
    </PageTemplate>
  )
}

export default Overview
