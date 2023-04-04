import styled from 'styled-components'

const A = styled.a`
  font-weight: 500;
  line-height: 12px;
  text-align: center;
  letter-spacing: 0px;
  color: ${({ theme }) => theme.blue};
  text-decoration: none;
  line-height: 1.5;
  font-size: ${({ size }) => {
    switch (size) {
      case 'xs':
        return 11
      case 'sm':
        return 13
      case 'md':
        return 15
      case 'lg':
        return 17
      case 'xl':
        return 19
      default:
        return 15
    }
  }}px;

  @media (max-width: 767.98px) {
    font-size: ${({ size }) => {
      switch (size) {
        case 'xs':
          return 9
        case 'sm':
          return 11
        case 'md':
          return 13
        case 'lg':
          return 15
        case 'xl':
          return 17
        default:
          return 13
      }
    }}px;
  }

  @media (max-width: 767.98px) {
    font-size: 13px !important;
  }

  &:hover {
    color: ${({ theme }) => theme.blue};
  }
`

export default A
