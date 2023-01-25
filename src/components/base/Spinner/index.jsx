import React from 'react'
import styled from 'styled-components'

const StyledSpinner = styled.svg`
  animation: rotate 2s linear infinite;
  width: ${({ size }) => {
    switch (size) {
      case 'sm':
        return 23
      case 'md':
        return 25
      case 'lg':
        return 40
      case 'xl':
        return 60
      default:
        return 25
    }
  }}px;
  height: ${({ size }) => {
    switch (size) {
      case 'sm':
        return 23
      case 'md':
        return 25
      case 'lg':
        return 40
      case 'xl':
        return 60
      default:
        return 25
    }
  }}px;

  & .path {
    stroke: ${({ theme }) => theme.text2};
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`

const Spinner = (_props) => (
  <StyledSpinner viewBox="0 0 50 50" {..._props}>
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
  </StyledSpinner>
)

export default Spinner
