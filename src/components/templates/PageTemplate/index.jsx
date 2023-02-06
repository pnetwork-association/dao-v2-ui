import React from 'react'
import { Container } from 'react-bootstrap'
import styled from 'styled-components'

import Header from '../../complex/Header'
import Footer from '../../complex/Footer'

const StyledContainer = styled(Container)`
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: ${({ theme, bgthemecolor }) => theme[bgthemecolor] || theme.bg1};
  border-radius: 10px;
  heigth: 100%;

  @media (min-width: 1200px) {
    max-width: 1000px !important;
  }

  @media (max-width: 767.98px) {
    margin-top: 0rem;
    padding: 0.5rem !important;
  }
`

const PageTemplate = ({ children, bgthemecolor }) => {
  return (
    <React.Fragment>
      <Header />
      <StyledContainer bgthemecolor={bgthemecolor}>{children}</StyledContainer>
      <Footer />
    </React.Fragment>
  )
}

export default PageTemplate
