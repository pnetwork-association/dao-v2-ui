import styled from 'styled-components'
import Dropdown from 'react-bootstrap/Dropdown'

import { useCallback, useMemo, useState } from 'react'

const StyledDropdownToogle = styled(Dropdown.Toggle)`
  border: 1px solid ${({ theme }) => theme.superLightGray};
  padding: 0px 15px;
  background: ${({ theme }) => theme.bg3};
  height: 50px;
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.text2};
  width: 100%;
  display: flex;
  justify-content: center;
  letter-spacing: 0px;
  font-weight: 400;
  font-size: 15px;
  line-height: 15px;
  text-align: center;
  border-radius: 10px;

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.bg3};
    border: 1px solid ${({ theme }) => theme.superLightGray};
    color: ${({ theme }) => theme.text2};
  }

  @media (max-width: 767.98px) {
    height: 35px;
    font-size: 13px;
  }
`

const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle::after {
    display: none !important;
  }

  .dropdown-menu.show {
    background: ${({ theme }) => theme.bg3};
    border: 1px solid ${({ theme }) => theme.superLightGray};
    border-radius: 10px;
  }

  .btn-check:checked + .btn,
  .btn.active,
  .btn.show,
  .btn:first-child:active,
  :not(.btn-check) + .btn:active {
    background: ${({ theme }) => theme.bg3} !important;
    border: 1px solid ${({ theme }) => theme.superLightGray} !important;
    color: ${({ theme }) => theme.text2} !important;
  }
`

const StyledDropdownMenu = styled(Dropdown.Menu)`
  width: 100%;
`

const Select = ({ options, onSelect: _onSelect, ..._props }) => {
  const [selected, setSelected] = useState(options[0].option)

  const onSelect = useCallback(
    (_option) => {
      setSelected(_option)
      _onSelect?.(_option)
    },
    [_onSelect]
  )

  const filteredOptions = useMemo(
    () =>
      options
        .filter(({ option }) => option !== selected)
        .map(({ component, option }, _index) => (
          <Dropdown.Item key={`select${_index}`} onClick={() => onSelect(option)}>
            {component}
          </Dropdown.Item>
        )),
    [options, selected, onSelect]
  )

  const selectedComponent = useMemo(() => {
    const sel = options.find(({ option }) => option === selected)
    return sel?.component
  }, [options, selected])

  return (
    <StyledDropdown>
      <StyledDropdownToogle>{selectedComponent}</StyledDropdownToogle>
      <StyledDropdownMenu>{filteredOptions}</StyledDropdownMenu>
    </StyledDropdown>
  )
}

export default Select
