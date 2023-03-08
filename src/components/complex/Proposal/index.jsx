import React, { Fragment, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled, { ThemeContext } from 'styled-components'
import retry from 'async-retry'
import { usePrepareContractWrite, useContractWrite, useChainId, useAccount } from 'wagmi'
import { toast } from 'react-toastify'
import BigNumber from 'bignumber.js'
import axios from 'axios'

import { styleProposalHtml } from '../../../utils/proposals'
import { toastifyTransaction } from '../../../utils/transaction'
import { useBalances } from '../../../hooks/use-balances'
import { isValidError } from '../../../utils/errors'
import { prepareContractWriteVote } from '../../../utils/preparers/dandelion-voting'

import Text from '../../base/Text'
import Icon from '../../base/Icon'
import Modal from '../../base/Modal'
import ButtonSecondary from '../../base/ButtonSecondary'
import Action from '../Action'
import Line from '../../base/Line'

const ProposalContainer = styled.div`
  display: flex;
  width: 100%;
  padding-left: 15px;
  padding-right: 15px;
`

const StatusLine = styled.div`
  width: 6px;
  background: ${({ theme, type }) => {
    switch (type) {
      case 'open':
        return theme.yellow
      case 'notPassed':
        return theme.primary1
      case 'passed':
      default:
        return theme.text4
    }
  }};
  border-radius: 3px;
  @media (max-width: 767.98px) {
    width: 4px;
  }
`

const DataContainer = styled.div`
  margin-left: 1rem;
  width: 100%;
`

const ProposalResultText = styled(Text)`
  color: ${({ theme, type }) => {
    switch (type) {
      case 'open':
        return theme.yellow
      case 'notPassed':
        return theme.primary1
      case 'passed':
      default:
        return theme.text4
    }
  }};
  font-size: 16px;
  @media (max-width: 767.98px) {
    font-size: 13px;
  }
`

const ProposalNumberText = styled(ProposalResultText)`
  color: ${({ theme }) => theme.text2};
`

const VoteText = styled(ProposalResultText)`
  color: ${({ theme, vote }) => {
    switch (vote) {
      case 'NOT VOTED':
        return theme.text1
      case 'YES':
        return theme.text4
      case 'NO':
        return theme.primary1
      default:
        return theme.text4
    }
  }};
  font-size: 13px;
  @media (max-width: 767.98px) {
    font-size: 12px;
  }
`

const ReadMoreText = styled(ProposalNumberText)`
  margin-left: 5px;
  cursor: pointer;
`

/*const ShowScript = styled(ReadMoreText)`
  margin-left: 0;
`*/

const QuorumText = styled(Text)`
  color: ${({ theme, quorumreached }) => (quorumreached ? theme.yellow : theme.red)};
`

const StyledIcon = styled(Icon)`
  margin-right: 5px;
`

const ReadMoreContent = styled.div`
  color: ${({ theme }) => theme.text2} !important;
`

const VoteButton = styled(ButtonSecondary)`
  border: 1px solid
    ${({ theme, vote }) => {
      switch (vote) {
        case 'YES':
          return theme.text4
        case 'NO':
          return theme.primary1
        default:
          return theme.text4
      }
    }};
  margin-right: ${({ vote }) => (vote === 'YES' ? 5 : 0)}px;
`

const ScriptContainer = styled.div`
  word-wrap: break-word;
`

const Proposal = ({
  actions,
  description,
  effectiveId,
  formattedCloseDate,
  formattedPercentageNay,
  formattedPercentageYea,
  formattedVote,
  formattedVotingPnt,
  id,
  open,
  passed,
  quorumReached,
  script,
  url,
  vote
}) => {
  const theme = useContext(ThemeContext)
  const { daoPntBalance } = useBalances()
  const [readMoreContent, setReadMoreContent] = useState(null)
  const [showScript, setShowScript] = useState(null)
  const activeChainId = useChainId()
  const { address } = useAccount()
  const type = useMemo(() => (open ? 'open' : passed ? 'passed' : 'notPassed'), [open, passed])

  const typeText = useMemo(() => {
    switch (type) {
      case 'open':
        return 'OPEN'
      case 'passed':
        return 'PASSED'
      case 'notPassed':
        return 'NOT PASSED'
      default:
        return '-'
    }
  }, [type])

  const onReadMore = useCallback(async () => {
    try {
      const { data: html } = await retry(() => axios.get(url), { retries: 3 })
      setReadMoreContent(styleProposalHtml(html, theme))
    } catch (_err) {
      console.error(_err)
    }
  }, [url, theme])

  const canVote = useMemo(
    () => open && vote === 0 && BigNumber(daoPntBalance).isGreaterThan(0),
    [open, daoPntBalance, vote]
  )

  const { config: configYes } = usePrepareContractWrite(
    prepareContractWriteVote({ activeChainId, address, id: effectiveId, vote: true, voteEnabled: canVote })
  )
  const { data: yesData, /*isLoading: isLoadingYes,*/ write: yes, error: yesError } = useContractWrite(configYes)

  const { config: configNo } = usePrepareContractWrite(
    prepareContractWriteVote({ activeChainId, address, id: effectiveId, vote: false, voteEnabled: canVote })
  )
  const { data: noData, /*isLoading: isLoadingNo,*/ write: no, error: noError } = useContractWrite(configNo)

  useEffect(() => {
    if (yesError && isValidError(yesError)) {
      toast.error(yesError.message)
    }
  }, [yesError])

  useEffect(() => {
    if (noError && isValidError(noError)) {
      toast.error(noError.message)
    }
  }, [noError])

  useEffect(() => {
    if (yesData) {
      toastifyTransaction(yesData, { chainId: activeChainId })
    }
  }, [yesData, activeChainId])

  useEffect(() => {
    if (noData) {
      toastifyTransaction(noData, { chainId: activeChainId })
    }
  }, [noData, activeChainId])

  return (
    <ProposalContainer>
      <StatusLine type={type} />
      <DataContainer>
        <Row>
          <Col xs={6}>
            <ProposalNumberText>#{id}</ProposalNumberText>
          </Col>
          <Col xs={6} className="text-end">
            <ProposalResultText type={type}>{typeText}</ProposalResultText>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            <Text>{description}</Text>
            <ReadMoreText onClick={onReadMore}>READ MORE</ReadMoreText>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col xs={3} className="d-flex align-items-center">
            <StyledIcon icon="verified" />
            <Text variant="text2">{formattedPercentageYea}</Text>
          </Col>
          <Col xs={3} className="d-flex align-items-center">
            <StyledIcon icon="block" />
            <Text variant="text2">{formattedPercentageNay}</Text>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            <QuorumText quorumreached={quorumReached.toString()}>
              {quorumReached ? 'The quorum has been reached' : "The quorum hasn't been reached"}
            </QuorumText>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col className="d-flex align-items-center">
            <StyledIcon icon="people" />
            <Text>
              Voted by <Text variant="text2">{formattedVotingPnt}</Text>
            </Text>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col className="d-flex align-items-center">
            <StyledIcon icon="clock" />
            <Text>
              {open ? 'Vote closing time' : 'Vote closed at'}: <Text variant="text2">{formattedCloseDate}</Text>
            </Text>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col xs={12} className="d-flex justify-content-between">
            {formattedVote !== '-' && (
              <Text>
                Your vote:&nbsp;
                {formattedVote === 'YES' && <StyledIcon icon="verified" />}
                {formattedVote === 'NO' && <StyledIcon icon="block" />}
                {formattedVote !== '-' && <VoteText vote={formattedVote}>{formattedVote}</VoteText>}
              </Text>
            )}
            {formattedVote === 'NOT VOTED' && open ? (
              <div className="d-flex align-items-center">
                <VoteButton disabled={!canVote} vote={'YES'} onClick={() => yes?.()}>
                  <StyledIcon icon="verified" />
                  <VoteText vote={'YES'}>YES</VoteText>
                </VoteButton>
                <VoteButton disabled={!canVote} vote={'NO'} onClick={() => no?.()}>
                  <StyledIcon icon="block" />
                  <VoteText vote={'NO'}>NO</VoteText>
                </VoteButton>
              </div>
            ) : null}
          </Col>
        </Row>
        {actions?.length > 0 && (
          <Fragment>
            <Line />
            <Row className="mt-2">
              <Col>
                <Text>Execution:</Text>
              </Col>
            </Row>
            {actions.map((_action, _index) => (
              <Row key={`action_${id}_${_index}`}>
                <Col>
                  <Action action={_action} />
                </Col>
              </Row>
            ))}
          </Fragment>
        )}
        {/*script && script !== '0x' && script !== '0x00000001' && (
          <Row className="mt-2">
            <Col>
              <ShowScript onClick={() => setShowScript(true)}>SHOW SCRIPT</ShowScript>
            </Col>
          </Row>
        )*/}
      </DataContainer>
      <Modal show={Boolean(readMoreContent)} title={`#${id}`} onClose={() => setReadMoreContent(null)} size="xl">
        <ReadMoreContent dangerouslySetInnerHTML={{ __html: readMoreContent }}></ReadMoreContent>
      </Modal>
      <Modal show={showScript} title={'Script'} onClose={() => setShowScript(false)}>
        <ScriptContainer>
          <Text>{script}</Text>
        </ScriptContainer>
      </Modal>
    </ProposalContainer>
  )
}

export default Proposal
