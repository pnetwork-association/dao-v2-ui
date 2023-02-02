import React, { Fragment } from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'

import Line from '../../base/Line'
import Text from '../Text'

const InnerContainer = styled.div`
  background: ${({ theme }) => theme.bg3};
  border-radius: 10px;
  padding: ${({ withHeader, noPadding }) =>
    noPadding ? '0' : withHeader ? '0rem 0.75rem 0.75rem 0.75rem' : '0.75rem'};
  @media (max-width: 767.98px) {
    padding: 0.5rem 0.5rem;
  }
`

const GlobalContainer = styled.div`
  border-radius: 10px;
  background: ${({ theme }) => theme.bg3};
`

const HeaderContainer = styled.div`
  background: ${({ theme }) => theme.bg3};
  padding: 0.75rem 0.75rem 0 0.75rem;
  @media (max-width: 767.98px) {
    padding: 0.5rem 0.75rem 0 0.75rem;
  }
`

const HeaderTitle = styled(Text)`
  font-weight: bold;
`

const Box = ({ headerTitle, noPadding, children, ..._props }) => {
  return (
    <GlobalContainer {..._props}>
      {headerTitle && (
        <Fragment>
          <HeaderContainer>
            <Row>
              <Col>
                <HeaderTitle variant="text4" size="md">
                  {headerTitle}
                </HeaderTitle>
              </Col>
            </Row>
          </HeaderContainer>
          <Line />
        </Fragment>
      )}
      <InnerContainer withHeader={Boolean(headerTitle)} noPadding={noPadding}>
        {children}
      </InnerContainer>
    </GlobalContainer>
  )
}

export default Box
