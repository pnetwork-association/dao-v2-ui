import styled from 'styled-components'

const Line = styled.div`
  height: ${({ size }) => {
    switch (size) {
      case 'lg':
        return 2
      case 'md':
        return 1
      case 'sm':
      default:
        return 0.5
    }
  }}px;
  border-radius: 2px;
  background: ${({ theme }) => theme.superLightGray};
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  width: 100%;
  @media (max-width: 767.98px) {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
`

export default Line
