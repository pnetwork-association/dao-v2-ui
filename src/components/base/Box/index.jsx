import React, { Fragment } from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'

import Line from '../../base/Line'
import Text from '../Text'

const Body = styled.div`
  background: ${({ theme }) => theme.bg3};
  border-radius: 10px;
  padding: ${({ withHeader }) => (withHeader ? '0.5rem 0.75rem 0.75rem 0.75rem' : '0.75rem')};
  @media (max-width: 767.98px) {
    padding: 0.5rem 0.5rem;
  }
`

const GlobalContainer = styled.div`
  border-radius: 10px;
  background: ${({ theme }) => theme.bg3};
`

const Header = styled.div`
  border-radius: 10px;
  background: ${({ theme }) => theme.bg3};
  padding: 0.75rem 0.75rem 0 0.75rem;
  @media (max-width: 767.98px) {
    padding: 0.5rem 0.75rem 0 0.75rem;
  }
`

const HeaderTitle = styled(Text)`
  font-weight: bold;
`

const StyledLine = styled(Line)`
  margin-bottom: 0rem;
`

const Box = ({ headerTitle, headerTitleSize = 'md', children, bodyStyle, ..._props }) => {
  return (
    <GlobalContainer {..._props}>
      {headerTitle && (
        <Fragment>
          <Header>
            <Row>
              <Col>
                <HeaderTitle variant="text4" size={headerTitleSize}>
                  {headerTitle}
                </HeaderTitle>
              </Col>
            </Row>
          </Header>
          <StyledLine />
        </Fragment>
      )}
      <Body withHeader={Boolean(headerTitle)} style={bodyStyle}>
        {children}
      </Body>
    </GlobalContainer>
  )
}

export default Box
