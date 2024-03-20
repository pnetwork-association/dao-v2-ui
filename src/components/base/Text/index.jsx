import styled from 'styled-components'

const Text = styled.span`
  font-weight: ${({ weight }) => (weight ? weight : 400)};
  font-size: 15px;
  letter-spacing: 0px;
  color: ${({ theme, variant }) => (variant ? theme[variant] : theme.text1)};

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
        return size ? size : 13
    }
  }}px;

  @media (max-width: 767.98px) {
    font-size: ${({ size }) => {
      switch (size) {
        case 'xs':
          return 7
        case 'sm':
          return 9
        case 'md':
          return 11
        case 'lg':
          return 13
        case 'xl':
          return 15
        default:
          return size ? size - 2 : 11
      }
    }}px;
  }
`

export default Text
