import React, { useCallback, useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import BigNumber from 'bignumber.js'

import MiniButton from '../../base/MiniButton'
import AdvancedInput from '../../base/AdvancedInput'

const MaxButton = styled(MiniButton)`
  margin-left: 0.75rem;

  @media (max-width: 767.98px) {
    bottom: 157px;
  }
`

const StyledAdvancedInput = styled(AdvancedInput)`
  color: ${({ theme, amountExceeded }) => (amountExceeded ? theme.danger : theme.text2)};
`

const InputAmount = ({ max, value, onMax: _onMax, ..._props }) => {
  const theme = useContext(ThemeContext)

  const onMax = useCallback(() => {
    if (max && _onMax) {
      _onMax(max)
    }
  }, [max, _onMax])

  const amountExceeded = useMemo(() => BigNumber(max).isLessThan(value), [max, value])

  return (
    <StyledAdvancedInput
      outerContainerStyle={{
        border: `1px solid ${amountExceeded ? theme.danger : theme.superLightGray}`
      }}
      amountExceeded={amountExceeded}
      value={value}
      contentLeft={<MaxButton onClick={onMax}>MAX</MaxButton>}
      {..._props}
    />
  )
}

export default InputAmount
