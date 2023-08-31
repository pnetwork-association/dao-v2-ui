import styled from 'styled-components'
import { NumericFormat } from 'react-number-format'

export default styled(NumericFormat)`
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
  background: ${({ theme }) => theme.white} !important;

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
    height: 50px;
  }
`
