import { useContext } from 'react'
import RSwitch from 'react-switch'
import { ThemeContext } from 'styled-components'

const Switch = (_props) => {
  const theme = useContext(ThemeContext)

  return (
    <RSwitch
      onColor={theme.green}
      offColor={theme.secondary4}
      uncheckedIcon={false}
      checkedIcon={false}
      activeBoxShadow={null}
      {..._props}
    />
  )
}

export default Switch
