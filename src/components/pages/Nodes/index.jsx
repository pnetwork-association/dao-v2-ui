import React, { useState } from 'react'
import { Tab } from 'react-bootstrap'
import styled from 'styled-components'
import { useSearchParams } from 'react-router-dom'

import PageTemplate from '../../templates/PageTemplate'
import RegisterSentinelModal from '../../complex/RegisterSentinelModal'
import Box from '../../base/Box'
import Tabs from '../../base/Tabs'

const TabsBox = styled(Box)`
  padding: 0;
`

const Nodes = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showRegisterSentinelModal, setShowRegisterSentinelModal] = useState(false)

  return (
    <PageTemplate bgthemecolor="transparent">
      <TabsBox>
        <Tabs
          defaultActiveKey={searchParams.get('selected') || 'sentinel'}
          className="mb-3"
          fill
          onSelect={(_key) => setSearchParams({ selected: _key })}
        >
          <Tab eventKey="sentinel" title="Sentinel"></Tab>
          <Tab eventKey="guardian" title="Guardian"></Tab>
          <Tab eventKey="borrowed-sentinel" title="Borrowed Sentinel"></Tab>
        </Tabs>
      </TabsBox>
      <RegisterSentinelModal show={showRegisterSentinelModal} onClose={() => setShowRegisterSentinelModal(false)} />
    </PageTemplate>
  )
}

export default Nodes
