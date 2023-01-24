import React from 'react'
import { Container } from 'react-bootstrap'
import styled from 'styled-components'

import Header from '../../complex/Header'

const StyledContainer = styled(Container)`
  padding-bottom: 50px;
  @media (min-width: 1200px) {
    max-width: 1500px !important;
  }
`

const PageTemplate = ({ children }) => {
  return (
    <React.Fragment>
      <Header />
      <StyledContainer>{children}</StyledContainer>
    </React.Fragment>
  )
}

export default PageTemplate
