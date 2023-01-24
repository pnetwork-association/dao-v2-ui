import React, { useMemo, useState, useEffect, useCallback, Fragment } from 'react'
import { Row, Col } from 'react-bootstrap'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { useAccount, usePrepareContractWrite, useContractReads, useContractWrite } from 'wagmi'
import { toast } from 'react-toastify'
import { ethers } from 'ethers'

import { useBalances } from '../../../hooks/use-balances'
import settings from '../../../settings'
import ACLAbi from '../../../utils/abis/ACL.json'
import VotingAbi from '../../../utils/abis/Voting.json'
import { toastifyTransaction } from '../../../utils/transaction'
import { getRole } from '../../../utils/role'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import TextArea from '../../base/TextArea'
import Button from '../../base/Button'
import InfoBox from '../../base/InfoBox'
import { formatAssetAmount } from '../../../utils/amount'
import { isValidHexString } from '../../../utils/format'

const UseScriptText = styled(Text)`
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  @media (max-width: 767.98px) {
    font-size: 11px;
  }
`

const CreateProposalModal = ({ show, onClose }) => {
  const { daoPntBalance } = useBalances()
  const { address } = useAccount()
  const [metadata, setMetadata] = useState('')
  const [script, setScript] = useState('')
  const [showScript, setShowScript] = useState(false)

  const { data } = useContractReads({
    contracts: [
      {
        address: settings.contracts.acl,
        abi: ACLAbi,
        functionName: 'hasPermission',
        args: [address, settings.contracts.voting, getRole('CREATE_VOTES_ROLE'), '0x']
      },
      {
        address: settings.contracts.voting,
        abi: VotingAbi,
        functionName: 'minOpenVoteAmount',
        args: []
      }
    ]
  })

  const { hasPermission, minOpenVoteAmount } = useMemo(
    () => ({
      hasPermission: data && data[0] ? data[0] : false,
      minOpenVoteAmount: data && data[1] ? data[1] : '0'
    }),
    [data]
  )

  const isScriptValid = useMemo(() => isValidHexString(script), [script])
  const hasPermissionOrEnoughBalance = useMemo(
    () =>
      hasPermission ||
      BigNumber(daoPntBalance).isGreaterThanOrEqualTo(BigNumber(minOpenVoteAmount?.toString()).dividedBy(10 ** 18)),
    [hasPermission, minOpenVoteAmount, daoPntBalance]
  )

  const canCreateProposal = useMemo(
    () => (hasPermissionOrEnoughBalance ? (showScript ? isScriptValid && metadata.length > 0 : true) : false),
    [isScriptValid, showScript, hasPermissionOrEnoughBalance, metadata]
  )

  const { config: newProposalConfig } = usePrepareContractWrite({
    address: settings.contracts.voting,
    abi: VotingAbi,
    functionName: 'newVote',
    args: [showScript && isScriptValid ? script : '0x', metadata, false],
    enabled: canCreateProposal
  })
  const {
    write: createProposal,
    error: createProposalError,
    data: createProposalData,
    isLoading
  } = useContractWrite(newProposalConfig)

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
  }, [show])

  const onShowOrHideUseScript = useCallback(() => {
    setShowScript(!showScript)
  }, [showScript])

  return (
    <Modal show={show} title="Create Proposal" onClose={onClose} size="md">
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
              In order to be able to open a vote you should have at least{' '}
              {formatAssetAmount(ethers.utils.formatEther(minOpenVoteAmount).toString(), 'daoPNT')} or at least have the
              permission
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
            Create new proposal
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default CreateProposalModal
