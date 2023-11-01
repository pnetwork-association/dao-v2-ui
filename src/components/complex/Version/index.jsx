import React from 'react'
import { Web3SettingsButton } from 'react-web3-settings'
import styled from 'styled-components'

const VersionDiv = styled.div`
  background: transparent;
`

const ContainerOptions = styled.div`
  justify-content: right !important;
  display: flex;
`

const VersionButton = styled.button`
  width: auto;
  color: white;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 300;
  height: 40px;
  border: 0;
  padding-left: 10px;
  padding-right: 10px;
  font-weight: 400;
  outline: none !important;
  background: ${({ theme }) => theme.secondary4};
  &:hover {
    background: ${({ theme }) => theme.secondary4Hovered};
  }
  color: ${({ theme }) => theme.text2};
  @media (max-width: 767.98px) {
    height: 45px;
  }
`

export default function Version({ ..._props }) {
  const githubLink = 'https://github.com/pnetwork-association/dao-v2-ui/tree/feat/multichain'
  return (
    <VersionDiv {..._props}>
      <ContainerOptions>
        <VersionButton onClick={() => window.open(githubLink, '_blank', 'noopener,noreferrer')}>
          Version: {process.env.REACT_APP_GIT_SHA}
        </VersionButton>
        <Web3SettingsButton className={'api-button'} iconClassName={'api-icon'}></Web3SettingsButton>
      </ContainerOptions>
    </VersionDiv>
  )
}
