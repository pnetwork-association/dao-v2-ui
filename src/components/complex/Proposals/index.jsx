import React, { Fragment, useMemo, useState } from 'react'
import { Tab } from 'react-bootstrap'
import styled from 'styled-components'
import { mainnet } from 'wagmi/chains'

import { useProposals } from '../../../hooks/use-proposals'
import { useDaoPntBalance } from '../../../hooks/use-balances'

import Icon from '../../base/Icon'
import Line from '../../base/Line'
import Tabs from '../../base/Tabs'
import Text from '../../base/Text'
import CreateProposalModal from '../CreateProposalModal'
import Proposal from '../Proposal'

const NewProposalContainer = styled.div`
  cursor: pointer;
  padding-bottom: 0.75rem;
`

const StyledIcon = styled(Icon)`
  color: ${({ theme }) => theme.text2} !important;
  margin-bottom: 2px;
`

const StyledLine = styled(Line)`
  margin-top: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 767.98px) {
    margin-bottom: 0rem;
  }
`

const Proposals = () => {
  const [showCreateProposalModal, setShowCreateProposalModal] = useState(false)
  const proposals = useProposals()
  const { amount: daoPntBalance } = useDaoPntBalance()

  const { newProposals, pastProposals } = useMemo(() => {
    const newp = proposals.filter(({ open }) => open)
    const pastp = proposals.filter(({ open }) => !open)

    return {
      newProposals: newp.length === 0 && proposals.length > 0 ? [proposals[0]] : newp,
      pastProposals: proposals.length > 0 && pastp.length === proposals.length ? proposals.slice(1) : pastp
    }
  }, [proposals])

  return (
    <Fragment>
      <Tabs defaultActiveKey="new" fill>
        <Tab eventKey="new" title="New proposals">
          {newProposals.map((_proposal) => (
            <div className="mt-2" key={`proposal_${_proposal.id}`}>
              <Proposal daoPntBalance={daoPntBalance} disabled={_proposal.chainId === mainnet.id} {..._proposal} />
              <StyledLine />
            </div>
          ))}
          <NewProposalContainer
            className="d-flex align-items-center justify-content-center mt-2 mb-2"
            onClick={() => setShowCreateProposalModal(true)}
          >
            <StyledIcon icon="plus" /> <Text variant="text2">&nbsp;&nbsp;CREATE A NEW PROPOSAL</Text>
          </NewProposalContainer>
        </Tab>
        <Tab eventKey="past" title="Past proposals">
          {pastProposals.map((_proposal) => (
            <div key={`proposal_${_proposal.id}`} className="mt-2">
              <Proposal daoPntBalance={daoPntBalance} disabled={_proposal.chainId === mainnet.id} {..._proposal} />
              <StyledLine />
            </div>
          ))}
        </Tab>
      </Tabs>
      <CreateProposalModal show={showCreateProposalModal} onClose={() => setShowCreateProposalModal(false)} />
    </Fragment>
  )
}

export default Proposals
