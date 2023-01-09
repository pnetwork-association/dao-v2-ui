import RcSlider from 'rc-slider'
import { useContext } from 'react'
import { ThemeContext } from 'styled-components'

const Slider = (_props) => {
  const theme = useContext(ThemeContext)

  return (
    <RcSlider
      railStyle={{
        background: theme.secondary4,
        height: 10
      }}
      trackStyle={{
        background: theme.blue,
        height: 10
      }}
      handleStyle={{
        border: 0,
        background: theme.white,
        opacity: 1,
        boxShadow: '0px 0px 7px 0px rgba(0,0,0,0.19)',
        height: 20,
        width: 20
      }}
      {..._props}
    />
  )
}

export default Slider
