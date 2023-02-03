import React from 'react'
import { FaTelegram, FaTwitter, FaGithub } from 'react-icons/fa'
import styled from 'styled-components'

import settings from '../../../settings'
import Icon from '../../base/Icon'

const SocialsContainer = styled.div`
  background: transparent;
`

const ASocial = styled.a`
  margin: 0 1rem;
  transition: transform 250ms;
  display: inline-block;
  padding-bottom: 10px;

  &:hover {
    transform: translateY(-2px);
  }
`

const StyledFaGithub = styled(FaGithub)`
  color: #242a2f;
  width: 32px;
  height: 32px;

  @media (max-width: 1400px) {
    width: 24px;
    height: 24px;
  }
`

const StyledFaTwitter = styled(FaTwitter)`
  color: #49a1eb;
  width: 32px;
  height: 32px;

  @media (max-width: 1400px) {
    width: 24px;
    height: 24px;
  }
`

const StyledFaTelegram = styled(FaTelegram)`
  color: #2aabee;
  width: 32px;
  height: 32px;

  @media (max-width: 1400px) {
    width: 24px;
    height: 24px;
  }
`

const StyledIcon = styled(Icon)`
  width: 32px !important;
  height: 32px !important;

  @media (max-width: 1400px) {
    width: 24px !important;
    height: 24px !important;
  }
`

const Socials = ({ ..._props }) => {
  return (
    <SocialsContainer {..._props}>
      <ASocial href={settings.links.github} target="_blank">
        <StyledFaGithub />
      </ASocial>
      <ASocial href={settings.links['p.network']} target="_blank">
        <StyledIcon icon="PNT" />
      </ASocial>
      <ASocial href={settings.links.telegram} target="_blank">
        <StyledFaTelegram />
      </ASocial>
      <ASocial href={settings.links.twitter} target="_blank">
        <StyledFaTwitter />
      </ASocial>
    </SocialsContainer>
  )
}

export default Socials
