import styled from 'styled-components'
import { Link } from 'react-router-dom'

const StyledLink = styled(Link)`
  font-weight: 500;
  font-size: 13px;
  line-height: 12px;
  text-align: center;
  letter-spacing: 0px;
  color: ${({ theme }) => theme.text4};
  text-decoration: none;

  @media (max-width: 767.98px) {
    font-size: 11px;
  }

  &:hover {
    color: ${({ theme }) => theme.text4};
  }
`

export default StyledLink
