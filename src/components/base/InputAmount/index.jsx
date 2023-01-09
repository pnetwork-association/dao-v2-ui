import React from 'react'
import styled from 'styled-components'

import MiniButton from '../../base/MiniButton'
import AdvancedInput from '../../base/AdvancedInput'

const MaxButton = styled(MiniButton)`
  margin-left: 0.75rem;

  @media (max-width: 767.98px) {
    bottom: 157px;
  }
`

const InputAmount = ({ onMax, ..._props }) => {
  return <AdvancedInput contentLeft={<MaxButton onClick={onMax}>MAX</MaxButton>} {..._props} />
}

export default InputAmount
