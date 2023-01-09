import React from 'react'
import styled from 'styled-components'
import { Row, Col } from 'react-bootstrap'

import Text from '../../base/Text'
import Button from '../../base/Button'

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

const Asset = ({
  buttonText,
  formattedAmount,
  formattedCountervalue,
  loading,
  logo,
  name,
  onClickButton,
  symbol,
  withButton,
  ..._props
}) => {
  return (
    <Row {..._props}>
      <Col xs={5} lg={4} className="d-flex align-items-center">
        <div className="d-flex align-items-center">
          <AssetLogo src={logo} />
          <div className="d-flex flex-column">
            <Text variant="text2">&nbsp;&nbsp;{name}</Text>
            <Text variant="text3">&nbsp;&nbsp;{symbol}</Text>
          </div>
        </div>
      </Col>
      <Col xs={2} lg={4} className="d-flex justify-content-center align-items-center">
        {withButton && (
          <ClaimButton loading={loading} onClick={onClickButton}>
            {buttonText}
          </ClaimButton>
        )}
      </Col>
      <Col xs={5} lg={4} className="text-end align-items-center">
        <Row>
          <Col xs={12}>
            <Text variant="text2">{formattedAmount}</Text>
          </Col>
          <Col xs={12}>
            <Text variant="text3">{formattedCountervalue}</Text>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Asset
