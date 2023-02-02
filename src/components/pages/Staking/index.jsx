import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
// import styled from 'styled-components'
//import BigNumber from 'bignumber.js'

import { useBalances, useVotingPower } from '../../../hooks/use-balances'

import Box from '../../base/Box'
import Button from '../../base/Button'
import Text from '../../base/Text'
import ProgressBar from '../../base/ProgressBar'
import Line from '../../base/Line'
import StakeModal from '../../complex/StakeModal'
import UnstakeModal from '../../complex/UnstakeModal'
import PageTemplate from '../../templates/PageTemplate'
import HistoricalDaoPntTotalSupplyChart from '../../complex/HistoricalDaoPntTotalSupplyChart'

const Staking = () => {
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)

  const { formattedPntBalance, formattedDaoPntBalance } = useBalances()
  const { formattedVotingPower, votingPower } = useVotingPower()

  return (
    <PageTemplate>
      <Box>
        <Row className="mt-2">
          <Col xs={6}>
            <Text>Current epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>#36</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={6}>
            <Text>PNT balance</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{formattedPntBalance}</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={6}>
            <Text>daoPNT balance</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{formattedDaoPntBalance}</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={6}>
            <Text>Voting power</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{formattedVotingPower}</Text>
          </Col>
        </Row>
        <Row className="mt-1 mb-2">
          <Col>
            <ProgressBar now={votingPower} />
          </Col>
        </Row>
        <Line />
        <Row className="mt-3">
          <Col xs={6}>
            <Button onClick={() => setShowStakeModal(true)}>Stake</Button>
          </Col>
          <Col xs={6}>
            <Button onClick={() => setShowUnstakeModal(true)}>Unstake</Button>
          </Col>
        </Row>
      </Box>
      <Box className="mt-4">
        <HistoricalDaoPntTotalSupplyChart />
      </Box>
      <StakeModal show={showStakeModal} onClose={() => setShowStakeModal(false)} />
      <UnstakeModal show={showUnstakeModal} onClose={() => setShowUnstakeModal(false)} />
    </PageTemplate>
  )
}

export default Staking
