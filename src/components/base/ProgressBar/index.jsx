import { ProgressBar } from 'react-bootstrap'
import styled from 'styled-components'

const StyledProgressBar = styled(ProgressBar)`
  --bs-progress-bar-bg: ${({ theme }) => theme.primary4};
  height: 10px;
  @media (max-width: 767.98px) {
    height: 6px;
  }
`

export default StyledProgressBar
