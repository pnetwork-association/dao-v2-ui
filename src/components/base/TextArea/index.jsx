import styled from 'styled-components'

const TextArea = styled.textarea`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.superLightGray};
  border-radius: 10px;
  display: flex;
  padding: 0.25rem;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  align-items: center;
  font-size: 17px;
  color: ${({ theme }) => theme.text2};
  margin-right: 0.5rem;
  background: ${({ theme }) => theme.white};

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

export default TextArea
