import React from 'react'
import { Container } from 'react-bootstrap'
import styled from 'styled-components'

import Header from '../../complex/Header'

const StyledContainer = styled(Container)`
  margin-top: 1rem;
  padding: 1.5rem;
  background: ${({ theme, bgthemecolor }) => theme[bgthemecolor] || theme.bg1};
  border-radius: 8px;

  @media (min-width: 1200px) {
    max-width: 1200px !important;
  }

  @media (max-width: 767.98px) {
    padding: 0.75rem !important;
  }
`

const PageTemplate = ({ children, bgthemecolor }) => {
  return (
    <React.Fragment>
      <Header />
      <StyledContainer bgthemecolor={bgthemecolor}>{children}</StyledContainer>
    </React.Fragment>
  )
}

export default PageTemplate
