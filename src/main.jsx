import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'

import reportWebVitals from './reportWebVitals'
import ThemeProvider, { ThemedGlobalStyle } from './theme/ThemeProvider'

import App from './components/App'

import '@rainbow-me/rainbowkit/styles.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'chart.js/auto'
import 'rc-slider/assets/index.css'
import './theme/font.css'
import 'react-toastify/dist/ReactToastify.css'

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
)

const StyledContainer = styled(ToastContainer)`
  &&&.Toastify__toast-container {
  }

  .Toastify__toast {
    border-radius: 100px;
    padding: 0.5rem 0.75rem;
  }

  .Toastify__toast--success {
    background-color: ${({ theme }) => theme.green} !important;
    color: ${({ theme }) => theme.white};
  }

  .Toastify__toast--error {
    background-color: ${({ theme }) => theme.red} !important;
    color: ${({ theme }) => theme.white};
  }

  .Toastify__toast-body {
  }

  .Toastify__progress-bar {
    display: none;
  }

  .Toastify__toast-icon {
    & > svg {
      fill: currentcolor;
    }
  }

  button[aria-label='close'] {
    opacity: 1;
    color: ${({ theme }) => theme.white};
  }
`

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedGlobalStyle />
      <App />
      <StyledContainer position="bottom-right" autoClose={5000} />
    </ThemeProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
