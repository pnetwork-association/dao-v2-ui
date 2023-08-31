import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  height: 60px;
  border: 1px solid ${({ theme }) => theme.superLightGray};
  border-radius: 10px;
  display: flex;
  padding-right: 0.75rem;
  padding-left: 0.75rem;
  align-items: center;
  color: ${({ theme }) => theme.text2};
  background: ${({ theme }) => theme.white} !important;
  justify-content: space-between;

  @media (max-width: 767.98px) {
    height: 50px;
  }
`

const Input = styled.input`
  width: 95%;
  border: 0;
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

const IconedInput = ({ inputProps, icon, ..._props }) => (
  <Wrapper {..._props}>
    <Input {...inputProps} />
    {icon}
  </Wrapper>
)

export default IconedInput
