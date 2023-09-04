import React, { useMemo } from 'react'
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from 'styled-components'

export const colors = (_darkMode) => ({
  white: '#FFFFFF',
  black: '#000000',

  text1: _darkMode ? '#FFFFFF' : '#A4AEAD',
  text2: _darkMode ? '#c3c5cb' : 'rgb(71, 89, 101)',
  text3: _darkMode ? '#6c7284' : '#475965ab',

  bg1: _darkMode ? '#2C313B' : '#FAFAFA',
  bg2: _darkMode ? '#a7aaaf42' : '#F5F5F5',
  bg3: _darkMode ? '#a7aaaf42' : '#FFFFFF',

  primary1: _darkMode ? '#32b1f5' : '#ff6666',
  secondary1: _darkMode ? '#FFFFFF' : '#016273',

  secondary2: _darkMode ? '#40444f' : '#eaeaea',
  secondary2Hovered: _darkMode ? '#6f768a' : '#c1bfbf',

  lightGray: '#4759654d',
  superLightGray: 'rgba(0, 0, 0, 0.1)',
  green: '#0CCE6B',
  lightGreen: '#8cf7b0',
  yellow: '#F9C80E',
  red: '#E4383A',
  lightRed: '#f98181',
  blue: '#5BC3EB',
  lightBlue: '#66b8ff40',
  orange: '#F49F0A',
  lightOrange: '#FBA21D33',
  danger: _darkMode ? '#E86062' : '#E86062',
  transparent: 'transparent'
})

export const theme = (_darkMode) => ({
  ...colors(_darkMode),
  type: _darkMode ? 'dark' : 'light'
})

export default function ThemeProvider({ children }) {
  const darkMode = false
  const themeObject = useMemo(() => theme(darkMode), [darkMode])
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

export const ThemedGlobalStyle = createGlobalStyle`
html * {
  font-family: 'Chivo', sans-serif;
}

textarea:hover, 
input:hover, 
textarea:active, 
input:active, 
textarea:focus, 
input:focus,
button:focus,
button:active,
button:hover,
label:focus,
.btn:active,
.btn.active
{
    outline:0px !important;
    -webkit-appearance:none;
    box-shadow: none !important;
}
.modal-content {
  border: 0
}

input[type="range"]::-webkit-slider-thumb {
  background: ${({ theme }) => theme.secondary1} !important;
}

/* All the same stuff for Firefox */
input[type="range"]::-moz-range-thumb {
  background:  ${({ theme }) => theme.secondary1} !important;
}

/* All the same stuff for IE */
input[type="range"]::-ms-thumb {
  background:  ${({ theme }) => theme.secondary1} !important;
}

body {
  min-height: 100vh;
  background-color: ${({ theme }) => theme.bg1} !important;
}

* {
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.bg1} ${({ theme }) => theme.bg1};
}

/* Works on Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 12px;
}

*::-webkit-scrollbar-track {
  background: ${({ theme }) => theme.bg1};
}

*::-webkit-scrollbar-thumb {
  background-color: ${({ theme }) => theme.superLightGray};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.bg1};
}


input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
`
