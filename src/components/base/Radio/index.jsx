import { FormCheck } from 'react-bootstrap'
import styled from 'styled-components'

import Text from '../Text'

const StyledFormCheck = styled(FormCheck)`
  .form-check-input {
    width: 1em;
    height: 1em;
    margin-top: 0.25em;
    vertical-align: top;
    background-color: ${({ theme }) => theme.bg4};
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    border: 1px solid ${({ theme }) => theme.superLightGray};
    appearance: none;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .form-check-input:checked {
    border: 1px solid ${({ theme }) => theme.blue} !important;
    background-color: ${({ theme }) => theme.blue} !important;
  }
`

const Radio = ({ label, ..._props }) => {
  return <StyledFormCheck type={'radio'} label={<Text variant="text2">{label}</Text>} {..._props} />
}

export default Radio
