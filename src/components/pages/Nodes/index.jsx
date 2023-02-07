import React from 'react'
import { Tab } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { useAccount } from 'wagmi'

import { BORROWING_SENTINEL, STAKING_SENTINEL } from '../../../contants'
import { useEpochs } from '../../../hooks/use-epochs'
import { useSentinel } from '../../../hooks/use-registration-manager'

import Box from '../../base/Box'
import Tabs from '../../base/Tabs'
import BorrowingSentinelRevenuesChart from '../../complex/BorrowingSentinelRevenuesChart'
import ClaimFees from '../../complex/ClaimFees'
import SentinelHistoricalChart from '../../complex/SentinelHistoricalChart'
import SentinelStats from '../../complex/SentinelStats'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentEpoch } = useEpochs()
  const { kind, endEpoch } = useSentinel()
  const { address } = useAccount()

  return (
    <PageTemplate bgThemeColor="transparent" removePaddingOnMobile>
      <Box bodyStyle={{ padding: 0 }}>
        <Tabs
          defaultActiveKey={searchParams.get('selected') || 'sentinel'}
          fill
          onSelect={(_key) => setSearchParams({ selected: _key })}
        >
          <Tab eventKey="sentinel" title="Sentinel">
            <InnerTabContainer>
              <SentinelStats type="stake" />
              <Box className="mt-4">
                {!address || kind !== STAKING_SENTINEL || (kind === STAKING_SENTINEL && endEpoch < currentEpoch) ? (
                  <SentinelHistoricalChart />
                ) : (
                  <StakingSentinelRevenuesChart />
                )}
              </Box>
              <Box className="mt-4" bodyStyle={{ padding: 0 }}>
                <ClaimFees type="stakingSentinel" />
              </Box>
            </InnerTabContainer>
          </Tab>
          <Tab eventKey="borrowed-sentinel" title="Borrowed Sentinel">
            <InnerTabContainer>
              <SentinelStats type="borrow" />
              <Box className="mt-4">
                {!address || kind !== BORROWING_SENTINEL || (kind === BORROWING_SENTINEL && endEpoch < currentEpoch) ? (
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
          <Tab eventKey="guardian" title="Guardian">
            <InnerTabContainer></InnerTabContainer>
          </Tab>
          <Tab eventKey="relayer" title="Relayer">
            <InnerTabContainer></InnerTabContainer>
          </Tab>
        </Tabs>
      </Box>
    </PageTemplate>
  )
}

export default Nodes
