import styled from 'styled-components'

const ButtonSecondary = styled.button`
  border: 0;
  background: ${({ theme }) => theme.secondary2};
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.text2};
  width: 100%;

  font-weight: 400;
  font-size: 15px;
  line-height: 15px;
  text-align: center;

  padding: 2px 5px;
  height: auto;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.text4};
  background: ${({ theme }) => theme.bg1};
  &:hover {
    opacity: 0.5;
  }
  @media (max-width: 767.98px) {
    padding: 2.5px;
  }
  &:disabled {
    opacity: 0.5;
    &:hover {
      background: ${({ theme }) => theme.bg1};
    }
  }
`

export default ButtonSecondary
