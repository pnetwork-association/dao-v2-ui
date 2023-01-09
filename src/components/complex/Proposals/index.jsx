import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Row, Col } from 'react-bootstrap'

import { useProposals } from '../../../hooks/use-proposals'

import Text from '../../base/Text'
import Proposal from '../Proposal'
import ButtonSecondary from '../../base/ButtonSecondary'
import Icon from '../../base/Icon'
import CreateProposalModal from '../CreateProposalModal'

const ProposalTypeText = styled(Text)`
  color: ${({ theme, active }) => (active === 'true' ? theme.text4 : theme.text1)};
  margin-right: 1rem;
  cursor: pointer;
`

const NewButton = styled(ButtonSecondary)`
  width: 26px;
  height: 26px;
  background: ${({ theme }) => theme.text4};
  border-radius: 50%;
  border: 0;
`

const StyledIcon = styled(Icon)`
  color: ${({ theme }) => theme.white} !important;
`

const Proposals = () => {
  const [type, setType] = useState('new')
  const [showCreateProposalModal, setShowCreateProposalModal] = useState(false)

  const proposals = useProposals()
  const filteredProposals = useMemo(() => {
    const res = proposals.filter(({ open }) => (type === 'new' ? open : !open))

    if (type === 'new' && res.length === 0 && proposals.length > 0) {
      return [proposals[0]]
    }

    if (type === 'past' && proposals.length > 0 && res.length === proposals.length) {
      return proposals.slice(1)
    }

    return res
  }, [proposals, type])

  return (
    <div className="mb-2">
      <Row className="mb-2">
        <Col xs={8} className="d-flex align-items-end">
          <ProposalTypeText active={type === 'new' ? 'true' : 'false'} onClick={() => setType('new')}>
            New Proposals
          </ProposalTypeText>
          <ProposalTypeText active={type === 'past' ? 'true' : 'false'} onClick={() => setType('past')}>
            Past Proposals
          </ProposalTypeText>
        </Col>
        <Col xs={4}>
          <NewButton className="float-end" onClick={() => setShowCreateProposalModal(true)}>
            <StyledIcon icon="plus" />
          </NewButton>
        </Col>
      </Row>
      {filteredProposals.map((_proposal) => (
        <div className="mt-2" key={`proposal_${_proposal.id}`}>
          <Proposal {..._proposal} />
        </div>
      ))}

      <CreateProposalModal show={showCreateProposalModal} onClose={() => setShowCreateProposalModal(false)} />
    </div>
  )
}

export default Proposals
