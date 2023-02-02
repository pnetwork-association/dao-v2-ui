import React, { useEffect, useCallback, Fragment } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { ethers } from 'ethers'

import { toastifyTransaction } from '../../../utils/transaction'
import { useCreateProposal } from '../../../hooks/use-proposals'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import TextArea from '../../base/TextArea'
import Button from '../../base/Button'
import InfoBox from '../../base/InfoBox'
import { formatAssetAmount } from '../../../utils/amount'

const UseScriptText = styled(Text)`
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  @media (max-width: 767.98px) {
    font-size: 11px;
  }
`

const CreateProposalModal = ({ show, onClose }) => {
  const {
    canCreateProposal,
    createProposal,
    createProposalData,
    createProposalError,
    hasPermissionOrEnoughBalance,
    isLoading,
    metadata,
    minOpenVoteAmount,
    script,
    setMetadata,
    setScript,
    setShowScript,
    showScript
  } = useCreateProposal()

  useEffect(() => {
    if (createProposalError) {
      if (!createProposalError.message.includes('user rejected transaction')) {
        toast.error(createProposalError.message)
      }
    }
  }, [createProposalError])

  useEffect(() => {
    if (createProposalData) {
      toastifyTransaction(createProposalData)
    }
  }, [createProposalData])

  useEffect(() => {
    if (!show) {
      setMetadata('')
      setScript('')
      setShowScript(false)
    }
  }, [show, setMetadata, setScript, setShowScript])

  const onShowOrHideUseScript = useCallback(() => {
    setShowScript(!showScript)
  }, [showScript, setShowScript])

  return (
    <Modal show={show} title="Create Proposal" onClose={onClose} size="lg">
      <Row className="mt-2">
        <Col>
          <Text>Question</Text>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col xs={12}>
          <TextArea rows="4" value={metadata} onChange={(_e) => setMetadata(_e.target.value)} />
        </Col>
      </Row>
      {!hasPermissionOrEnoughBalance && (
        <Row className="mt-2">
          <Col>
            <InfoBox type="warning">
              In order to be able to open a vote you should either have at least 200,000 daoPNT
              {formatAssetAmount(ethers.utils.formatEther(minOpenVoteAmount).toString(), 'daoPNT')} or be granted a
              special permission via a DAO vote
            </InfoBox>
          </Col>
        </Row>
      )}
      <Row>
        <Col className="text-center">
          <UseScriptText onClick={onShowOrHideUseScript} variant="text4">
            {showScript ? 'Remove' : 'Add'} script
          </UseScriptText>
        </Col>
      </Row>
      {showScript && (
        <Fragment>
          <Row>
            <Col>
              <Text>Script</Text>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col xs={12}>
              <TextArea rows="3" value={script} onChange={(_e) => setScript(_e.target.value)} />
            </Col>
          </Row>
        </Fragment>
      )}
      <Row className="mt-2 mb-2">
        <Col>
          <Button disabled={!canCreateProposal} loading={isLoading} onClick={() => createProposal?.()}>
            Create proposal
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default CreateProposalModal
