import React from 'react'
import styled from 'styled-components'

import Spinner from '../Spinner'

const StyledButton = styled.button`
  border: 0;
  padding: 0px 15px;
  background: ${({ theme }) => theme.secondary2};
  height: 40px;
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.text2};
  border-radius: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  letter-spacing: 0px;
  font-weight: 400;
  font-size: 15px;
  line-height: 15px;
  text-align: center;
  &:hover {
    background: ${({ theme }) => theme.secondary2Hovered};
  }
  &:disabled {
    opacity: 0.4;
    &:hover {
      opacity: 0.4;
      background: ${({ theme }) => theme.secondary2};
    }
  }
  @media (max-width: 767.98px) {
    height: 30px;
    font-size: 13px;
  }
`

const Button = ({ loading, children, ..._props }) => {
  return (
    <StyledButton {..._props}>
      {loading ? <Spinner aria-label="Loading Spinner" data-testid="loader" /> : children}
    </StyledButton>
  )
}

export default Button
