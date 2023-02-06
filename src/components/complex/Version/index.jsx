import React from 'react'
import styled from 'styled-components'

const VersionContainer = styled.div`
  background: transparent;
`

const VersionText = styled.span`
  justify-content: right !important;
  display: flex;
  color: ${({ theme }) => theme.text2};
  font-size: 13px;
`

const Version = ({ ..._props }) => {
  return (
    <VersionContainer {..._props}>
      <VersionText>Version: {process.env.REACT_APP_GIT_SHA}</VersionText>
    </VersionContainer>
  )
}

export default Version
