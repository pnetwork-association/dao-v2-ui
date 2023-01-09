import React, { useContext } from 'react'
import { ReactSVG } from 'react-svg'
import styled, { css, ThemeContext } from 'styled-components'

const commonCss = css`
  color: red;
  display: inline-block;
  width: 20px;
  heigth: 20px;
  & > svg {
    width: 100%;
    height: 100%;
    fill: currentcolor;
  }
`

const StyledImg = styled.img`
  ${commonCss};
`

const Icon = ({ icon, color, ...props }) => {
  const theme = useContext(ThemeContext)
  if (icon.startsWith('data:') || icon.startsWith('http') || icon.startsWith('asset:')) {
    const asset = icon.startsWith('asset:') && `src/app/assets/icons/${icon.split(':')[1]}`
    return <StyledImg alt="" src={asset || icon} {...props} />
  }

  return (
    <ReactSVG
      {...props}
      style={{
        color: color || theme.text1,
        display: 'inline-block',
        width: '20px',
        heigth: '20px'
      }}
      src={`../assets/svg/${icon}.svg`}
      wrapper="span"
    />
  )
}

export default Icon
