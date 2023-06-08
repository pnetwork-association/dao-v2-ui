import React from 'react'
import styled from 'styled-components'

import Text from '../Text'

const BadgeOuter = styled.div`
  background-color: ${({ theme }) => theme.blue};
  border-radius: 4px;
  padding: 2px 4px;
`

const Badge = ({ text, ..._props }) => {
  return (
    <BadgeOuter {..._props}>
      <Text variant="white">{text}</Text>
    </BadgeOuter>
  )
}

export default Badge
