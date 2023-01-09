import styled from 'styled-components'

const Text = styled.span`
  font-weight: 400;
  font-size: 15px;
  letter-spacing: 0px;
  color: ${({ theme, variant }) => (variant ? theme[variant] : theme.text1)};
  @media (max-width: 767.98px) {
    font-size: 11px;
  }
`

export default Text
