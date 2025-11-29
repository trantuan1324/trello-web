import React from 'react';
import App from './App.jsx';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import ReactDOM from 'react-dom/client';
import {Experimental_CssVarsProvider as CssVarsProvider} from '@mui/material/styles';
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev/index.js";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme}>
      <CssBaseline/>
      <DevSupport ComponentPreviews={ComponentPreviews}
                  useInitialHook={useInitial}
      >
        <App/>
      </DevSupport>
    </CssVarsProvider>
  </React.StrictMode>
);
