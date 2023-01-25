import 'chart.js/auto'
import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'

import Box from '../../base/Box'
import Activities from '../../complex/Activities'
import LendModal from '../../complex/LendModal'
import Proposals from '../../complex/Proposals'
import RegisterSentinelModal from '../../complex/RegisterSentinelModal'
import SentinelHistoricalChart from '../../complex/SentinelHistoricalChart'
import StakeModal from '../../complex/StakeModal'
import Stats from '../../complex/Stats'
import UnstakeModal from '../../complex/UnstakeModal'
import PageTemplate from '../../templates/PageTemplate'

const StyledActivities = styled(Activities)`
  height: 665px;
  max-height: 665px;
  overflow: auto;
`

const Overview = () => {
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showLendModal, setShowLendModal] = useState(false)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)
  const [showRegisterSentinelModal, setShowRegisterSentinelModal] = useState(false)

  return (
    <PageTemplate>
      <Row>
        <Col xs={12} lg={7} className="mt-3">
          <Row>
            <Col>
              <Stats />
            </Col>
          </Row>
          <Row>
            <Col>
              <Box className="mt-3">
                <SentinelHistoricalChart />
              </Box>
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={5} className="mt-3">
          <StyledActivities />
        </Col>
      </Row>

      {/*<Row className="mt-3">
        <Col xs={4}>
          <Button onClick={() => setShowStakeModal(true)}>Stake</Button>
        </Col>
        <Col xs={4}>
          <Button onClick={() => setShowLendModal(true)}>Lend</Button>
        </Col>
        <Col xs={4}>
          <Button onClick={() => setShowUnstakeModal(true)}>Unstake</Button>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col xs={12} className="text-center">
          <Link onClick={() => setShowRegisterSentinelModal(true)}>REGISTER A SENTINEL</Link>
        </Col>
      </Row>*/}

      <div className="mt-4">
        <Proposals />
      </div>
      <StakeModal show={showStakeModal} onClose={() => setShowStakeModal(false)} />
      <LendModal show={showLendModal} onClose={() => setShowLendModal(false)} />
      <UnstakeModal show={showUnstakeModal} onClose={() => setShowUnstakeModal(false)} />
      <RegisterSentinelModal show={showRegisterSentinelModal} onClose={() => setShowRegisterSentinelModal(false)} />
    </PageTemplate>
  )
}

export default Overview
