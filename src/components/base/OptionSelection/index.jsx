import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import Button from '../../base/Button'

const Container = styled.div`
  display: flex;
  width: 100%;
  word-wrap: break-word;
  white-space: pre-wrap;
`

const StyledButton = styled(Button)`
  height: 30px;
  border-radius: 10px;
  font-size: 11px;
  margin-right: ${({ last }) => (last !== 'true' ? 5 : 0)}px;
  @media (max-width: 767.98px) {
    font-size: 11px;
    padding: 5px 7.5px;
  }
  background: ${({ theme, active }) => (active === 'true' ? theme.secondary4Hovered : theme.secondary4)} !important;
`

const OptionSelection = ({ options, buttonStyle, onPress }) => {
  const [selected, setSelected] = useState(0)

  const onClick = useCallback(
    (_index) => {
      setSelected(_index)
      onPress(options[_index])
    },
    [options, onPress]
  )

  return (
    <Container>
      {options.map(({ text }, _index) => (
        <StyledButton
          style={buttonStyle}
          key={`option_selection_#${_index}`}
          active={selected === _index ? 'true' : 'false'}
          last={_index === options.length - 1 ? 'true' : 'false'}
          onClick={() => onClick(_index)}
        >
          {text}
        </StyledButton>
      ))}
    </Container>
  )
}

export default OptionSelection
