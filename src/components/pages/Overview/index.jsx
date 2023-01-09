import React, { useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
//import BigNumber from 'bignumber.js'

import { useOverview } from '../../../hooks/use-overview'

import PageTemplate from '../../templates/PageTemplate'
import Line from '../../base/Line'
import Box from '../../base/Box'
import Text from '../../base/Text'
import ProgressBar from '../../base/ProgressBar'
import Button from '../../base/Button'
import Link from '../../base/Link'
import Icon from '../../base/Icon'
import Proposals from '../../complex/Proposals'
import A from '../../base/A'
import StakeModal from '../../complex/StakeModal'
import UnstakeModal from '../../complex/UnstakeModal'
import RegisterSentinelModal from '../../complex/RegisterSentinelModal'
import LendModal from '../../complex/LendModal'

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 5px;
`

const BoxHeaderLine = styled(Line)`
  margin: 0;
  margin-top: 13px;
`

const StyledA = styled(A)`
  color: ${({ theme }) => theme.text4};
`

const Overview = () => {
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showLendModal, setShowLendModal] = useState(false)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)
  const [showRegisterSentinelModal, setShowRegisterSentinelModal] = useState(false)
  const {
    formattedPntBalance,
    formattedDaoPntBalance,
    formattedVotingPower,
    votingPower,
    formattedDaoPntTotalSupply,
    formattedPercentageStakedPnt,
    percentageStakedPnt,
    // loanEndEpoch,
    formattedCurrentEpoch
  } = useOverview()

  return (
    <PageTemplate>
      <Box>
        <Row>
          <Col className="d-flex">
            <StyledIcon icon="portfolio" />
            <BoxHeaderLine size="lg" />
          </Col>
        </Row>
        <Row className="mt-2">
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

        {/*BigNumber(lendedAmountCurrentEpoch).isGreaterThan(0) && (
            <Fragment>
              <Row>
                <Col xs={6}>
                  <Text>Lended amount in the current epoch</Text>
                </Col>
                <Col xs={6} className="text-end">
                  <Text variant={'text2'}>{formattedLendedAmountCurrentEpoch}</Text>
                </Col>
              </Row>
              <Line />
            </Fragment>
          )*/}
        {/*loanEndEpoch > 0 && loanEndEpoch >= currentEpoch && (
            <Fragment>
              <Row>
                <Col xs={6}>
                  <Text>Loan ends at epoch</Text>
                </Col>
                <Col xs={6} className="text-end">
                  <Text variant={'text2'}>#{loanEndEpoch}</Text>
                </Col>
              </Row>
              <Line />
            </Fragment>
          )*/}

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
        </Row>
      </Box>
      <Box className="mt-3">
        <Row>
          <Col className="d-flex">
            <StyledIcon icon="people" />
            <BoxHeaderLine size="lg" />
          </Col>
        </Row>
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
        <Row className="mt-3">
          <Col xs={12} className="text-center">
            <StyledA href="https://pnetwork.watch/d/ZlcYwaX7z/governance?orgId=1" target="_blank">
              BROWSE THE ANALYTICS DASHBOARD
            </StyledA>
          </Col>
        </Row>
      </Box>
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
