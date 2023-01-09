import styled from 'styled-components'
import { Container } from 'react-bootstrap'

const Box = styled(Container)`
  background: ${({ theme }) => theme.bg3};
  border-radius: 8px;
  padding: 10px 15px;
  @media (max-width: 767.98px) {
    padding: 5px 10px;
  }
`

export default Box
