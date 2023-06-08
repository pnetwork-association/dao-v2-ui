import React, { useState } from 'react'
import { Row, Col, Tab } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { FaInfoCircle } from 'react-icons/fa'

import {
  useAccountLoanEndEpoch,
  useAccountLoanStartEpoch,
  useApy,
  useUtilizationRatioInTheCurrentEpoch
} from '../../../hooks/use-lending-manager'
import { useEpochs } from '../../../hooks/use-epochs'
import { useUserStake } from '../../../hooks/use-staking-manager'
import { useCountdown } from '../../../hooks/use-countdown'
import settings from '../../../settings'

import Box from '../../base/Box'
import Line from '../../base/Line'
import Text from '../../base/Text'
import ClaimRewards from '../../complex/ClaimRewards'
import LendModal from '../../complex/LendModal'
import PageTemplate from '../../templates/PageTemplate'
import Tabs from '../../base/Tabs'
import UtilizationRatioChart from '../../complex/UtilizationRatioChart'
import Button from '../../base/Button'
import UnstakeModal from '../../complex/UnstakeModal'
import LendDurationModal from '../../complex/LendDurationModal'
import Tooltip from '../../base/Tooltip'
import ProgressBar from '../../base/ProgressBar'
import Lenders from '../../complex/Lenders'

const InnerTabContainer = styled.div`
  padding: 1.5rem 1.5rem;
  background: ${({ theme }) => theme.bg2};
  border-bottom-radius: 8px;

  @media (max-width: 767.98px) {
    padding: 0.75rem !important;
  }
`

const Lending = () => {
  const navigate = useNavigate()
  const [showLendModal, setShowLendModal] = useState(false)
  const [showIncreaseDurationModal, setShowIncreaseDurationModal] = useState(false)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)
  const { currentEpochEndsAt, currentEpochStartedAt, formattedCurrentEpoch, formattedCurrentEpochEndAt } = useEpochs()
  const utilizationRatioCurrentEpoch = useUtilizationRatioInTheCurrentEpoch()
  const { formattedLeft: formattedCurrentEpochEndIn, percentageLeft } = useCountdown({
    eventTime: currentEpochEndsAt,
    eventStart: currentEpochStartedAt
  })

  const { formattedValue: formattedValueAccountLoanStartEpoch } = useAccountLoanStartEpoch()
  const { formattedValue: formattedValueAccountLoanEndEpoch } = useAccountLoanEndEpoch()
  const { formattedValue: formattedValueApy } = useApy()
  const { amount: lendedAmount, formattedValue: formattedLendedAmount } = useUserStake({
    contractAddress: settings.contracts.stakingManagerLM
  })

  return (
    <PageTemplate bgThemeColor="transparent" removePaddingOnMobile>
      <Box bodyStyle={{ padding: 0 }}>
        <Tabs
          defaultActiveKey="lenders"
          fill
          onSelect={(_key) => (_key === 'borrowers' ? navigate('/nodes?selected=borrowed-sentinel') : null)}
        >
          <Tab eventKey="lenders" title="Lenders">
            <InnerTabContainer>
              <Box>
                <Row className="mt-2">
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
                    <Text>Current epochs ends in</Text>
                  </Col>
                  <Col xs={6} className="text-end">
                    <Tooltip id="current-end-epoch-tooltip" text={formattedCurrentEpochEndAt}>
                      <Text variant={'text2'}>{formattedCurrentEpochEndIn}</Text>
                    </Tooltip>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col xs={12}>
                    <ProgressBar now={percentageLeft} />
                  </Col>
                </Row>
                <Line />
                <Row className="mt-2">
                  <Col xs={8}>
                    <Text>Utilization Ratio in the current epoch</Text>
                  </Col>
                  <Col xs={4} className="text-end">
                    <Text variant={'text2'}>{utilizationRatioCurrentEpoch?.formattedValue}</Text>
                  </Col>
                </Row>
                <Line />
                <Row className="mt-2">
                  <Col xs={8}>
                    <Text>Estimated APY</Text>
                    <Tooltip
                      overlayType="popover"
                      id="estimated-apy-lend-tooltip"
                      text="The interest rate is floating, based on residual locktime (min 1 epoch) and pool utilization. This system protects against the volatility of the number of node operators and prevents emptying the lending pool at the end of epochs.
Rewards currencies vary depending on the tokens bridged by pNetwork's users, including more than 50 different tokens, such as pBTC, PNT, and stablecoins. 
A participation DAO vote is required for lenders to be included in the rewards distribution, lenders who don't vote will not be eligible to receive rewards for that epoch."
                    >
                      <Text>
                        &nbsp;&nbsp;
                        <FaInfoCircle />
                      </Text>
                    </Tooltip>
                  </Col>
                  <Col xs={4} className="text-end">
                    <Text variant={'text2'}>{formattedValueApy}</Text>
                  </Col>
                </Row>
                <Line />
                <Row className="mt-2">
                  <Col xs={6}>
                    <Text>Your lent amount</Text>
                  </Col>
                  <Col xs={6} className="text-end">
                    <Text variant={'text2'}>{formattedLendedAmount}</Text>
                  </Col>
                </Row>
                <Line />
                <Row className="mt-2">
                  <Col xs={6}>
                    <Text>Your loan starts at epoch</Text>
                  </Col>
                  <Col xs={6} className="text-end">
                    <Text variant={'text2'}>{formattedValueAccountLoanStartEpoch}</Text>
                  </Col>
                </Row>
                <Line />
                <Row className="mt-2">
                  <Col xs={6}>
                    <Text>Your loan ends at epoch</Text>
                  </Col>
                  <Col xs={6} className="text-end">
                    <Text variant={'text2'}>{formattedValueAccountLoanEndEpoch}</Text>
                  </Col>
                </Row>
                <Line />
                <Row className="justify-content-center mt-3">
                  <Col xs={4}>
                    <Button onClick={() => setShowUnstakeModal(true)}>Unstake</Button>
                  </Col>
                  <Col xs={4}>
                    <Button onClick={() => setShowLendModal(true)}>Lend</Button>
                  </Col>
                  <Col xs={4}>
                    <Button
                      disabled={lendedAmount ? lendedAmount.isEqualTo(0) : true}
                      onClick={() => setShowIncreaseDurationModal(true)}
                    >
                      Increase duration
                    </Button>
                  </Col>
                </Row>
              </Box>
              <Box className="mt-4">
                <UtilizationRatioChart />
              </Box>
              <Box className="mt-4" bodyStyle={{ padding: 0 }}>
                <ClaimRewards />
              </Box>
              <Box className="mt-4">
                <Lenders />
              </Box>
            </InnerTabContainer>
          </Tab>
          <Tab eventKey="borrowers" title="Borrowers"></Tab>
        </Tabs>
      </Box>
      <LendModal show={showLendModal} onClose={() => setShowLendModal(false)} />
      <UnstakeModal
        show={showUnstakeModal}
        contractAddress={settings.contracts.stakingManagerLM}
        onClose={() => setShowUnstakeModal(false)}
      />
      <LendDurationModal show={showIncreaseDurationModal} onClose={() => setShowIncreaseDurationModal(false)} />
    </PageTemplate>
  )
}

export default Lending
