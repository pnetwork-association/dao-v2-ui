import React, { useMemo } from 'react'
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from 'styled-components'

export const colors = (_darkMode) => ({
  white: '#FFFFFF',
  black: '#000000',

  text1: _darkMode ? '#FFFFFF' : '#A4AEAD',
  text2: _darkMode ? '#c3c5cb' : 'rgb(71, 89, 101)',
  text3: _darkMode ? '#6c7284' : '#475965ab',
  text4: _darkMode ? '#FFFFFF' : '#016273',

  bg1: _darkMode ? '#2C313B' : '#e5e5e529',
  bg2: _darkMode ? '#a7aaaf42' : '#ececec7a',
  bg3: _darkMode ? '#a7aaaf42' : '#FFFFFF',

  primary1: _darkMode ? '#32b1f5' : '#ff6666',
  primary1Transparentized: _darkMode ? '#32b1f594' : '#ff666675',
  primary1Hovered: _darkMode ? '#015b8c' : '#d64848',

  primary2: _darkMode ? '#3680E7' : '#66b8ff',
  primary3: _darkMode ? '#66b8ff61' : '#66b8ff61',
  primary4: _darkMode ? '#D95E59' : '#D95E59',

  secondary1: _darkMode ? '#FFFFFF' : '#475965',
  secondary2: _darkMode ? '#6c7284' : '#d5d9dc',

  secondary3: _darkMode ? '#212429' : '#FFFFFF',
  secondary3Transparentized: _darkMode ? '#21242980' : '#FFFFFF',

  secondary4: _darkMode ? '#40444f' : '#eaeaea',
  secondary4Hovered: _darkMode ? '#6f768a' : '#c1bfbf',

  text2Transparentized: 'rgb(71 89 101 / 26%)',

  gray: '#9CA0A7',
  lightGray: '#4759654d',
  superLightGray: 'rgba(0, 0, 0, 0.1)',
  green: '#5FD788',
  lightGreen: '#8cf7b0',
  yellow: '#E3B203',
  red: '#E4383A',
  lightRed: '#f98181',
  blue: '#66B8FF',
  lightBlue: '#66b8ff40',
  orange: '#FBA21D',
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
  background: ${({ theme }) => theme.text4} !important;
}

/* All the same stuff for Firefox */
input[type="range"]::-moz-range-thumb {
  background:  ${({ theme }) => theme.text4} !important;
}

/* All the same stuff for IE */
input[type="range"]::-ms-thumb {
  background:  ${({ theme }) => theme.text4} !important;
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
