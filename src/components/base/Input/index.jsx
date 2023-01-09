import styled from 'styled-components'

const Input = styled.input`
  width: 100%;
  height: 60px;
  border: 1px solid ${({ theme }) => theme.superLightGray};
  border-radius: 10px;
  display: flex;
  padding-right: 0.75rem;
  padding-left: 0.75rem;
  align-items: center;
  font-size: 27px;
  color: ${({ theme }) => theme.text2};
  margin-right: 0.5rem;
  background: ${({ theme }) => theme.bg1};

  ::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${({ theme }) => theme.lightGray};
    opacity: 1; /* Firefox */
  }

  :-ms-input-placeholder {
    /* Internet Explorer 10-11 */
    color: ${({ theme }) => theme.lightGray};
  }

  ::-ms-input-placeholder {
    /* Microsoft Edge */
    color: ${({ theme }) => theme.lightGray};
  }

  @media (max-width: 767.98px) {
    font-size: 20px;
  }
`

export default Input
