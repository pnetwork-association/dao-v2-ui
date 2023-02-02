import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import React, { useState } from 'react'
import { Row, Col, Tab } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import {
  useAccountLoanEndEpoch,
  useAccountLoanStartEpoch,
  useApy,
  useUtilizationRatioInTheCurrentEpoch
} from '../../../hooks/use-borrowing-manager'
import { useEpochs } from '../../../hooks/use-epochs'

import Box from '../../base/Box'
import Line from '../../base/Line'
import Text from '../../base/Text'
import ClaimInterests from '../../complex/ClaimInterests'
import LendModal from '../../complex/LendModal'
import PageTemplate from '../../templates/PageTemplate'
import Tabs from '../../base/Tabs'
import UtilizationRatioChart from '../../complex/UtilizationRatioChart'
import Button from '../../base/Button'

const InnerTabContainer = styled.div`
  padding: 1.5rem 1.5rem;
  background: ${({ theme }) => theme.bg2};
  border-bottom-radius: 8px;

  @media (max-width: 767.98px) {
    padding: 0.75rem !important;
  }
`

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Lending = () => {
  const navigate = useNavigate()
  const [showLendModal, setShowLendModal] = useState(false)
  const { formattedCurrentEpoch, formattedCurrentEpochEndAt } = useEpochs()
  const utilizationRatioCurrentEpoch = useUtilizationRatioInTheCurrentEpoch()

  const { formattedValue: formattedValueAccountLoanStartEpoch } = useAccountLoanStartEpoch()
  const { formattedValue: formattedValueAccountLoanEndEpoch } = useAccountLoanEndEpoch()
  const { formattedValue: formattedValueApy } = useApy()

  return (
    <PageTemplate bgthemecolor="transparent">
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
                    <Text>Epoch</Text>
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
                    <Text variant={'text2'}>{formattedCurrentEpochEndAt}</Text>
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
                  <Col xs={12} lg={4}>
                    <Button onClick={() => setShowLendModal(true)}>LEND</Button>
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
    </PageTemplate>
  )
}

export default Lending
