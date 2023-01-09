import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Row, Col, Accordion } from 'react-bootstrap'
import BigNumber from 'bignumber.js'

import { toastifyTransaction } from '../../../utils/transaction'

import Text from '../../base/Text'
import Button from '../../base/Button'
import { useEpochs } from '../../../hooks/use-epochs'

const Title = styled(Text)`
  color: ${({ theme }) => theme.text4};
  margin-right: 1rem;
  cursor: pointer;
`

const StyledAccordion = styled(Accordion)`
  .accordion-button {
    background-color: ${({ theme }) => theme.white} !important;
  }

  .accordion-button:focus {
    box-shadow: none;
  }

  .accordion-button:not(.collapsed) {
    color: ${({ theme }) => theme.text2} !important;
  }

  .accordion-button::after {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${({
      theme
    }) =>
      theme.text2}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
  }
`

const AccordionItem = styled(Accordion.Item)`
  border: 0.5px solid var(${({ theme }) => theme.superLightGray});
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-bottom-width: ${({ last }) => (last === 'true' ? 0 : 0.5)}px;
`

const AccordionHeader = styled(Accordion.Header)`
  font-weight: 400;
  font-size: 15px;
  letter-spacing: 0px;
  color: ${({ theme }) => theme.text2};
  @media (max-width: 767.98px) {
    font-size: 11px;
  }
`

const AssetLogo = styled.img`
  width: 36px;
  height: 36px;
  @media (max-width: 767.98px) {
    width: 24px;
    height: 24px;
  }
`

const ClaimButton = styled(Button)`
  height: 30px;
  width: 80px;
`

const Claim = ({ assetsByEpochs, claim }) => {
  const { currentEpoch } = useEpochs()
  const [loading, setLoading] = useState(null)
  const [claimed, setClaimed] = useState(null)
  const orderedAssetsByEpochs = useMemo(() => {
    if (!assetsByEpochs) return []

    return Object.keys(assetsByEpochs)
      .reverse()
      .map((_epoch, _index) => assetsByEpochs[_epoch])
  }, [assetsByEpochs])

  const onClaim = useCallback(
    async (_address, _epoch) => {
      try {
        setLoading(`${_epoch}_${_address}`)
        toastifyTransaction(
          await claim({
            recklesslySetUnpreparedArgs: [_address, _epoch]
          }),
          () => {
            setLoading(null)
            setClaimed(`${_epoch}_${_address}`)
          }
        )
      } catch (_err) {
        setLoading(null)
        console.error(_err)
      }
    },
    [claim]
  )

  return (
    <div className="mb-3">
      <Row className="mb-2">
        <Col xs={8} className="d-flex align-items-end">
          <Title>Claim</Title>
        </Col>
      </Row>
      <StyledAccordion defaultActiveKey="0">
        {orderedAssetsByEpochs.map((_assets, _index) => {
          const epoch = orderedAssetsByEpochs.length - _index - 1
          return (
            <AccordionItem
              key={`claim_${epoch}`}
              eventKey={_index}
              last={_index === orderedAssetsByEpochs.length - 1 ? 'true' : 'false'}
            >
              <AccordionHeader>
                <Text variant="text2">Epoch #{epoch}</Text>
              </AccordionHeader>
              <Accordion.Body>
                {_assets.map(({ address, amount, formattedAmount, logo, name }, _index) => (
                  <Row key={`claim_${epoch}_${_index}`} className={`align-items-center ${_index > 0 ? 'mt-3' : ''}`}>
                    <Col xs={5} lg={4} className="d-flex align-items-center">
                      <AssetLogo src={logo} />
                      <Text variant="text2">&nbsp;&nbsp;{name}</Text>
                    </Col>
                    <Col xs={2} lg={4} className="d-flex justify-content-center align-items-center">
                      {BigNumber(amount).isGreaterThan(0) &&
                        epoch <= currentEpoch &&
                        claimed !== `${epoch}_${address}` && (
                          <ClaimButton
                            loading={loading === `${epoch}_${address}`}
                            onClick={() => onClaim(address, epoch)}
                          >
                            Claim
                          </ClaimButton>
                        )}
                    </Col>
                    <Col xs={5} lg={4} className="text-end align-items-center">
                      <Text variant="text2">&nbsp;&nbsp;&nbsp;&nbsp;{formattedAmount}</Text>
                    </Col>
                  </Row>
                ))}
              </Accordion.Body>
            </AccordionItem>
          )
        })}
      </StyledAccordion>
    </div>
  )
}

export default Claim
