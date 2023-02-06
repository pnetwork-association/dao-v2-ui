import React from 'react'
import styled from 'styled-components'

import Version from '../Version'
import Socials from '../Socials'

const FooterContainer = styled.footer`
  @media (max-width: 1400px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`

const StyledSocials = styled(Socials)`
  position: fixed;
  bottom: 10px;
  @media (max-width: 1400px) {
    position: relative;
    bottom: 0;
  }
`

const StyledVersion = styled(Version)`
  position: fixed;
  bottom: 5px;
  right: 0;
  padding-right: 15px;
  @media (max-width: 1400px) {
    position: relative;
  }
`

const Footer = () => {
  return (
    <FooterContainer>
      <StyledSocials />
      <StyledVersion />
    </FooterContainer>
  )
}

export default Footer
