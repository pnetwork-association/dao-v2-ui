import styled from 'styled-components'

const Banner = styled.div`
  padding: 0.75rem;
  background: ${({ theme, type }) => {
    switch (type) {
      case 'warning':
        return theme.lightOrange
      default:
        return theme.lightBlue
    }
  }};
  border: 0.5px solid
    ${({ theme, type }) => {
      switch (type) {
        case 'warning':
          return theme.orange
        default:
          return theme.blue
      }
    }};
  border-radius: 10px;
  color: ${({ theme, type }) => {
    switch (type) {
      case 'warning':
        return theme.orange
      default:
        return theme.blue
    }
  }};
  text-align: center;

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
          return 11
      }
    }}px;
  }
`

export default Banner
