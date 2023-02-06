import React from 'react'
import { Tab } from 'react-bootstrap'
import styled from 'styled-components'
import { useSearchParams } from 'react-router-dom'

import PageTemplate from '../../templates/PageTemplate'
import Box from '../../base/Box'
import Tabs from '../../base/Tabs'
import SentinelStats from '../../complex/SentinelStats'
import ClaimFees from '../../complex/ClaimFees'

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
              <Box className="mt-4" bodyStyle={{ padding: 0 }}>
                <ClaimFees type="stakingSentinel" />
              </Box>
            </InnerTabContainer>
          </Tab>
          <Tab eventKey="borrowed-sentinel" title="Borrowed Sentinel">
            <InnerTabContainer>
              <SentinelStats type="borrow" />
              <Box className="mt-4" bodyStyle={{ padding: 0 }}>
                <ClaimFees type="borrowingSentinel" />
              </Box>
            </InnerTabContainer>
          </Tab>
          <Tab eventKey="guardian" title="Guardian">
            <InnerTabContainer></InnerTabContainer>
          </Tab>
        </Tabs>
      </Box>
    </PageTemplate>
  )
}

export default Nodes
