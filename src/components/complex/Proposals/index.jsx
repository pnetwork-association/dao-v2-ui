import React, { useMemo, useState } from 'react'
import { Tab } from 'react-bootstrap'
import styled from 'styled-components'

import { useProposals } from '../../../hooks/use-proposals'

import Box from '../../base/Box'
import Icon from '../../base/Icon'
import Tabs from '../../base/Tabs'
import Text from '../../base/Text'
import CreateProposalModal from '../CreateProposalModal'
import Proposal from '../Proposal'

const NewProposalContainer = styled.div`
  cursor: pointer;
`

const StyledIcon = styled(Icon)`
  color: ${({ theme }) => theme.text2} !important;
  margin-bottom: 2px;
`

const Proposals = () => {
  const [showCreateProposalModal, setShowCreateProposalModal] = useState(false)
  const proposals = useProposals()

  const { newProposals, pastProposals } = useMemo(() => {
    const newp = proposals.filter(({ open }) => open)
    const pastp = proposals.filter(({ open }) => !open)

    return {
      newProposals: newp.length === 0 && proposals.length > 0 ? [proposals[0]] : newp,
      pastProposals: proposals.length > 0 && pastp.length === proposals.length ? proposals.slice(1) : pastp
    }
  }, [proposals])

  return (
    <div className="mb-2">
      <Tabs defaultActiveKey="new" id="uncontrolled-tab-example" className="mb-3" fill>
        <Tab eventKey="new" title="New Proposals">
          {newProposals.map((_proposal) => (
            <div className="mt-2" key={`proposal_${_proposal.id}`}>
              <Proposal {..._proposal} />
            </div>
          ))}
          <Box className="mt-2">
            <NewProposalContainer
              className="d-flex align-items-center justify-content-center"
              onClick={() => setShowCreateProposalModal(true)}
            >
              <StyledIcon icon="plus" /> <Text variant="text2">&nbsp;&nbsp;CREATE A NEW PROPOSAL</Text>
            </NewProposalContainer>
          </Box>
        </Tab>
        <Tab eventKey="past" title="Past Proposals">
          {pastProposals.map((_proposal) => (
            <div className="mt-2" key={`proposal_${_proposal.id}`}>
              <Proposal {..._proposal} />
            </div>
          ))}
        </Tab>
      </Tabs>
      <CreateProposalModal show={showCreateProposalModal} onClose={() => setShowCreateProposalModal(false)} />
    </div>
  )
}

export default Proposals
