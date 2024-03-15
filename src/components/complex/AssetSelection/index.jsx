import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { FaList } from 'react-icons/fa'

import settings from '../../../settings'

import Select from '../../base/Select'
import Asset from '../Asset'
import Text from '../../base/Text'
import AdvancedInput from '../../base/AdvancedInput'

const CustomContainter = styled.div`
  height: 50px;
  align-items: center;
  display: flex;
`

const StyledAdvancedInput = styled(AdvancedInput)`
  font-size: 15px;
  text-align: left;
  padding-left: 0.75rem;

  @media (max-width: 767.98px) {
    font-size: 15px;
  }
`

const FaListContainer = styled.div`
  margin-right: 0.75rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text2};
`

const AdvancedInputContainer = styled.div`
  display: ${({ mode }) => (mode === 'normal' ? 'none' : 'normal')};
`

const SelectContainer = styled.div`
  display: ${({ mode }) => (mode === 'normal' ? 'normal' : 'none')};
`

const AssetSelection = ({ onSelect: _onSelect, assets: _assets = settings.assets }) => {
  const [mode, setMode] = useState('normal')
  const [customValue, setCustomValue] = useState('')
  const [lastOption, setLastOption] = useState(null)

  const options = [..._assets, { name: 'custom' }].map(({ address, logo, name, symbol }) => ({
    option: name === 'custom' ? name : address,
    component:
      name === 'custom' ? (
        <CustomContainter>
          <Text variant="text2" size="">
            Custom token address ...
          </Text>{' '}
        </CustomContainter>
      ) : (
        <Asset logo={logo} name={name} symbol={symbol} />
      ),
    avoidSelectionOnClick: name === 'custom'
  }))

  const onSelect = useCallback(
    (_option) => {
      if (_option === 'custom') {
        setMode('custom')
        return
      }

      setLastOption(_option)
      _onSelect(_option)
    },
    [setMode, _onSelect]
  )

  const onChangeCustomAddress = useCallback(
    (_e) => {
      const customValue = _e.target.value
      setCustomValue(customValue)
      _onSelect(customValue)
    },
    [_onSelect]
  )

  const onNormal = useCallback(() => {
    setMode('normal')
    setCustomValue('')
    _onSelect(lastOption)
  }, [lastOption, _onSelect])

  return (
    <div>
      <AdvancedInputContainer mode={mode}>
        <StyledAdvancedInput
          placeholder="Custom token address ..."
          value={customValue}
          contentRight={
            <FaListContainer onClick={onNormal}>
              <FaList />
            </FaListContainer>
          }
          onChange={onChangeCustomAddress}
        />
      </AdvancedInputContainer>
      <SelectContainer mode={mode}>
        <Select options={options} onSelect={onSelect} />
      </SelectContainer>
    </div>
  )
}

export default AssetSelection
