import React from 'react'
import styled from 'styled-components'

const InputContainer = styled.div`
  width: 100%;
  height: 60px;
  border: 1px solid ${({ theme }) => theme.superLightGray};
  border-radius: 10px;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.white};
`

const Input = styled.input`
  border: 0;
  text-align: right;
  font-size: 27px;
  width: 100%;
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

const CustomInput = ({ contentLeft, outerContainerStyle, ..._props }) => {
  return (
    <InputContainer style={outerContainerStyle}>
      {contentLeft}
      <Input {..._props} />
    </InputContainer>
  )
}

export default CustomInput
