import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
} from 'chart.js'

import ThemeProvider, { ThemedGlobalStyle } from './theme/ThemeProvider'
import store from './store'
import reportWebVitals from './reportWebVitals'

import App from './components/App'

import './theme/font.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@rainbow-me/rainbowkit/styles.css'
import 'react-toastify/dist/ReactToastify.css'
import 'rc-slider/assets/index.css'

window.Buffer = window.Buffer || require('buffer').Buffer

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
    padding: 10px 15px;
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
    <Provider store={store}>
      <ThemeProvider>
        <ThemedGlobalStyle />
        <App />
        <StyledContainer position="bottom-right" />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
