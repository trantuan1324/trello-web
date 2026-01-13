import React from 'react'
import App from './App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import ReactDOM from 'react-dom/client'
import {Experimental_CssVarsProvider as CssVarsProvider} from '@mui/material/styles'
import {DevSupport} from '@react-buddy/ide-toolbox'
import {ComponentPreviews, useInitial} from './dev/index.js'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <CssVarsProvider theme={theme}>
    <CssBaseline/>
    <DevSupport
      ComponentPreviews={ComponentPreviews}
      useInitialHook={useInitial}
    >
      <App/>
    </DevSupport>
    <ToastContainer
      position="bottom-left"
      autoClose={1500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"/>
  </CssVarsProvider>
)
