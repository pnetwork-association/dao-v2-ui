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
  font-size: 15px;
`

export default Banner
