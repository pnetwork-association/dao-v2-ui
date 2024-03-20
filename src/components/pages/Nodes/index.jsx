import React, { useState } from 'react'
import { useContext } from 'react'
import { Tab } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'
import { useAccount } from 'wagmi'

import { BORROWING_NODE, STAKING_NODE } from '../../../contants'
import { useEpochs } from '../../../hooks/use-epochs'
import { useSentinel } from '../../../hooks/use-registration-manager'

import Box from '../../base/Box'
import Switch from '../../base/Switch'
import Tabs from '../../base/Tabs'
import Text from '../../base/Text'
import BorrowingSentinelRevenuesChart from '../../complex/BorrowingSentinelRevenuesChart'
import ClaimFees from '../../complex/ClaimFees'
import SentinelHistoricalChart from '../../complex/SentinelHistoricalChart'
import NodeStats from '../../complex/NodeStats'
import StakingSentinelRevenuesChart from '../../complex/StakingSentinelRevenuesChart'
import PageTemplate from '../../templates/PageTemplate'

const InnerTabContainer = styled.div`
  padding: 1.5rem 1.5rem;
  background: ${({ theme }) => theme.bg2};
  border-bottom-radius: 8px;

  @media (max-width: 767.98px) {
    padding: 0.75rem !important;
  }
`

const Nodes = () => {
  const theme = useContext(ThemeContext)
  const [borrowingSwitchChecked, setBorrowingSwitchChecked] = useState(false)
  const [stakingSwitchChecked, setStakingSwitchChecked] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentEpoch } = useEpochs()
  const { kind, endEpoch } = useSentinel()
  const { address } = useAccount()

  return (
    <PageTemplate bgThemeColor="transparent" removePaddingOnMobile>
      <Box bodyStyle={{ padding: 0 }}>
        <Tabs
          defaultActiveKey={searchParams.get('selected') || 'node'}
          fill
          onSelect={(_key) => setSearchParams({ selected: _key })}
        >
          <Tab eventKey="node" title="Node">
            <InnerTabContainer>
              <NodeStats type="stake" />
              <Box className="mt-4">
                {kind === STAKING_NODE && (
                  <div className="d-flex justify-content-end align-items-center">
                    <Text size="sm">History&nbsp;&nbsp;&nbsp;</Text>
                    <Switch checked={stakingSwitchChecked} onChange={setStakingSwitchChecked} />
                    <Text size="sm">&nbsp;&nbsp;&nbsp;Prediction</Text>
                  </div>
                )}
                {!address ||
                kind !== STAKING_NODE ||
                (kind === STAKING_NODE && endEpoch < currentEpoch) ||
                stakingSwitchChecked ? (
                  <SentinelHistoricalChart />
                ) : (
                  <StakingSentinelRevenuesChart />
                )}
              </Box>
              <Box className="mt-4" bodyStyle={{ padding: 0 }}>
                <ClaimFees type="stakingNode" />
              </Box>
            </InnerTabContainer>
          </Tab>
          <Tab eventKey="borrowed-sentinel" title="Borrowed Node">
            <InnerTabContainer>
              <NodeStats type="borrow" />
              <Box className="mt-4">
                {kind === BORROWING_NODE && (
                  <div className="d-flex justify-content-end align-items-center">
                    <Text size="sm">History&nbsp;&nbsp;&nbsp;</Text>
                    <Switch
                      checked={borrowingSwitchChecked}
                      onChange={setBorrowingSwitchChecked}
                      onColor={theme.secondary2}
                    />
                    <Text size="sm">&nbsp;&nbsp;&nbsp;Prediction</Text>
                  </div>
                )}
                {!address ||
                kind !== BORROWING_NODE ||
                (kind === BORROWING_NODE && endEpoch < currentEpoch) ||
                borrowingSwitchChecked ? (
                  <SentinelHistoricalChart />
                ) : (
                  <BorrowingSentinelRevenuesChart />
                )}
              </Box>
              <Box className="mt-4" bodyStyle={{ padding: 0 }}>
                <ClaimFees type="borrowingSentinel" />
              </Box>
            </InnerTabContainer>
          </Tab>
          {/*<Tab eventKey="guardian" title="Guardian">
            <InnerTabContainer></InnerTabContainer>
          </Tab>
          <Tab eventKey="relayer" title="Relayer">
            <InnerTabContainer></InnerTabContainer>
          </Tab>*/}
        </Tabs>
      </Box>
    </PageTemplate>
  )
}

export default Nodes
