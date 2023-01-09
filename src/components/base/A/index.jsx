import styled from 'styled-components'

const A = styled.a`
  font-weight: 500;
  font-size: 13px;
  line-height: 12px;
  text-align: center;
  letter-spacing: 0px;
  color: ${({ theme }) => theme.blue};
  text-decoration: none;
  line-height: 1.5;
  @media (max-width: 767.98px) {
    font-size: 11px;
  }

  &:hover {
    color: ${({ theme }) => theme.blue};
  }
`

export default A
