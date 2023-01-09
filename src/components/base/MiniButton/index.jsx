import styled from 'styled-components'

const MiniButton = styled.button`
  border-radius: 5px;
  border: 0;
  color: ${({ theme }) => theme.blue};
  background: #66b8ff40;
  font-size: 12px;
  height: 20px;
  outline: none !important;
  box-shadow: none;
  cursor: pointer;
  &:hover {
    background: #66b8ff61;
  }
  @media (max-width: 767.98px) {
    font-size: 10px;
    height: 16px;
  }
`

export default MiniButton
