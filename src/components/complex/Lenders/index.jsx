import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useChainId } from 'wagmi'

import { useLenders } from '../../../hooks/use-lending-manager'
import { getAddressExplorerUrl } from '../../../utils/explorer'

import Text from '../../base/Text'
import A from '../../base/A'
import Line from '../../base/Line'

const Lenders = ({ ..._props }) => {
  const activeChainId = useChainId()
  const lenders = useLenders()

  return (
    <div {..._props}>
      <Row>
        <Col>
          <Text variant="text4" weight="bold" size="lg">
            List of lenders
          </Text>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col xs={3}>
          <Text variant="text2" size="sm" weight={700}>
            Lender
          </Text>
        </Col>
        <Col xs={3}>
          <Text variant="text2" size="sm" weight={700}>
            Amount
          </Text>
        </Col>
        <Col xs={3}>
          <Text variant="text2" size="sm" weight={700}>
            % in the Lending Pool
          </Text>
        </Col>
        <Col xs={3}>
          <Text variant="text2" size="sm" weight={700}>
            Remaining time
          </Text>
        </Col>
      </Row>
      <Line />
      {lenders.map(({ address, nickname, formattedAmount, formattedPoolPercentage, remainingTime }) => (
        <Row className="mt-1">
          <Col xs={3}>
            <A href={getAddressExplorerUrl(address, { chainId: activeChainId })} target="_blank">
              {nickname}
            </A>
          </Col>
          <Col xs={3}>
            <Text variant="text2">{formattedAmount}</Text>
          </Col>
          <Col xs={3}>
            <Text variant="text2">{formattedPoolPercentage}</Text>
          </Col>
          <Col xs={3}>
            <Text variant="text2">{remainingTime}</Text>
          </Col>
        </Row>
      ))}
    </div>
  )
}

export default Lenders
