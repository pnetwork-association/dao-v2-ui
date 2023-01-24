import React from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'

import Icon from '../../base/Icon'
import Line from '../../base/Line'

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.bg3};
  border-radius: 8px;
  padding: 10px 15px;
  @media (max-width: 767.98px) {
    padding: 5px 10px;
  }
`

const StyledIcon = styled(Icon)`
  width: 216x;
  height: 16px;
  margin-right: 5px;
`

const BoxHeaderLine = styled(Line)`
  margin: 0;
  margin-top: 13px;
`

const Box = ({ headerIcon, children, ..._props }) => {
  return (
    <StyledContainer {..._props}>
      {headerIcon && (
        <Row>
          <Col className="d-flex">
            <StyledIcon icon={headerIcon} />
            <BoxHeaderLine size="lg" />
          </Col>
        </Row>
      )}
      {children}
    </StyledContainer>
  )
}

export default Box
