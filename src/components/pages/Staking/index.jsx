import React, { useState } from 'react'
// import { Col, Row } from 'react-bootstrap'
// import styled from 'styled-components'
//import BigNumber from 'bignumber.js'

// import { useOverview } from '../../../hooks/use-overview'

import StakeModal from '../../complex/StakeModal'
import UnstakeModal from '../../complex/UnstakeModal'
import PageTemplate from '../../templates/PageTemplate'

const Staking = () => {
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)

  return (
    <PageTemplate>
      <StakeModal show={showStakeModal} onClose={() => setShowStakeModal(false)} />
      <UnstakeModal show={showUnstakeModal} onClose={() => setShowUnstakeModal(false)} />
    </PageTemplate>
  )
}

export default Staking
