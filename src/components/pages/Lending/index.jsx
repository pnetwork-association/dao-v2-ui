import React, { useState } from 'react'
import { Row, Col, Tab } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Tooltip } from 'react-tooltip'

import {
  useAccountLoanEndEpoch,
  useAccountLoanStartEpoch,
  useApy,
  useUtilizationRatioInTheCurrentEpoch
} from '../../../hooks/use-borrowing-manager'
import { useEpochs } from '../../../hooks/use-epochs'
import settings from '../../../settings'

import Box from '../../base/Box'
import Line from '../../base/Line'
import Text from '../../base/Text'
import ClaimInterests from '../../complex/ClaimInterests'
import LendModal from '../../complex/LendModal'
import PageTemplate from '../../templates/PageTemplate'
import Tabs from '../../base/Tabs'
import UtilizationRatioChart from '../../complex/UtilizationRatioChart'
import Button from '../../base/Button'
import UnstakeModal from '../../complex/UnstakeModal'
import LendDurationModal from '../../complex/LendDurationModal'
import { useUserStake } from '../../../hooks/use-staking-manager'

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
  const { formattedCurrentEpoch, formattedCurrentEpochEndIn } = useEpochs()
  const utilizationRatioCurrentEpoch = useUtilizationRatioInTheCurrentEpoch()

  const { formattedValue: formattedValueAccountLoanStartEpoch } = useAccountLoanStartEpoch()
  const { formattedValue: formattedValueAccountLoanEndEpoch } = useAccountLoanEndEpoch()
  const { formattedValue: formattedValueApy } = useApy()
  const { amount: stakedAmount } = useUserStake({ contractAddress: settings.contracts.stakingManagerBM })

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
                    <Text>Current epochs ends at</Text>
                  </Col>
                  <Col xs={6} className="text-end">
                    <Text variant={'text2'}>{formattedCurrentEpochEndIn}</Text>
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
                    <Text id="estimatedApyInfo" data-tooltip-content={'TODOTODOTODOTODOTODOTODO'}>
                      &nbsp;*
                    </Text>
                    <Tooltip anchorId="estimatedApyInfo" />
                  </Col>
                  <Col xs={4} className="text-end">
                    <Text variant={'text2'}>{formattedValueApy}</Text>
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
                      disabled={stakedAmount ? stakedAmount.isEqualTo(0) : true}
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
                <ClaimInterests />
              </Box>
            </InnerTabContainer>
          </Tab>
          <Tab eventKey="borrowers" title="Borrowers"></Tab>
        </Tabs>
      </Box>
      <LendModal show={showLendModal} onClose={() => setShowLendModal(false)} />
      <UnstakeModal
        show={showUnstakeModal}
        contractAddress={settings.contracts.stakingManagerBM}
        onClose={() => setShowUnstakeModal(false)}
      />
      <LendDurationModal show={showIncreaseDurationModal} onClose={() => setShowIncreaseDurationModal(false)} />
    </PageTemplate>
  )
}

export default Lending
