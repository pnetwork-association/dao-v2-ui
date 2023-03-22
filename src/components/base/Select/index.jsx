import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import Dropdown from 'react-bootstrap/Dropdown'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'

const StyledDropdownToogle = styled(Dropdown.Toggle)`
  border: 1px solid ${({ theme }) => theme.superLightGray};
  padding: 0px 15px;
  background: ${({ theme }) => theme.bg3};
  height: 60px;
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.text2};
  width: 100%;
  display: flex;
  justify-content: space-between;
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
    height: 50px;
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
  padding-top: 0;
  padding-bottom: 0;
`

const StyledDropdownItem = styled(Dropdown.Item)`
  &:hover {
    background: ${({ theme }) => theme.superLightGray};
  }

  border-top-left-radius: ${({ first }) => (first === 'true' ? 10 : 0)}px;
  border-top-right-radius: ${({ first }) => (first === 'true' ? 10 : 0)}px;
  border-bottom-left-radius: ${({ last }) => (last === 'true' ? 10 : 0)}px;
  border-bottom-right-radius: ${({ last }) => (last === 'true' ? 10 : 0)}px;

  &:focus {
    background: ${({ theme }) => theme.bg3};
  }
`

const Select = ({ options, onSelect: _onSelect, dropdownToogleStyle, withArrow = false, ..._props }) => {
  const [selected, setSelected] = useState(options[0].option)
  const [show, setShow] = useState(false)

  const onSelect = useCallback(
    (_option, _avoidSelectionOnClick) => {
      if (!_avoidSelectionOnClick) {
        setSelected(_option)
      }

      _onSelect?.(_option)
    },
    [_onSelect]
  )

  const filteredOptions = useMemo(
    () =>
      options
        .filter(({ option }, _index) => option !== selected)
        .map(({ component, option, avoidSelectionOnClick = false }, _index) => (
          <StyledDropdownItem
            key={`select${_index}`}
            first={_index === 0 ? 'true' : 'false'}
            last={_index === options.length - 2 ? 'true' : 'false'}
            onClick={() => onSelect(option, avoidSelectionOnClick)}
          >
            {component}
          </StyledDropdownItem>
        )),
    [options, selected, onSelect]
  )

  const selectedComponent = useMemo(() => {
    const sel = options.find(({ option }) => option === selected)
    return sel?.component
  }, [options, selected])

  return (
    <StyledDropdown onToggle={(_show) => setShow(_show)}>
      <StyledDropdownToogle style={dropdownToogleStyle}>
        {selectedComponent}
        {show ? <FaArrowUp /> : <FaArrowDown />}
      </StyledDropdownToogle>
      <StyledDropdownMenu>{filteredOptions}</StyledDropdownMenu>
    </StyledDropdown>
  )
}

export default Select
