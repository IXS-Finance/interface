import { CookiesProvider } from 'react-cookie'
import React from 'react'
import { isMobile } from 'react-device-detect'
import ReactDOM from 'react-dom/client'
import ReactGA from 'react-ga'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { LocalizationProvider } from '@material-ui/pickers'
import DayJsUtils from '@material-ui/pickers/adapter/dayjs'
import { PersistGate } from 'redux-persist/integration/react'
import * as Sentry from '@sentry/react'
import { ToastContainer } from 'react-toastify'

import { MuiThemeProvider } from './theme/muiTheme'
import Blocklist from './components/Blocklist'
import { LanguageProvider } from './i18n'
import App from './pages/App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import store, { persistor } from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import SecTokenListUpdater from './state/secTokens/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider, { ThemedGlobalStyle } from './theme'
import Web3Provider from 'components/Web3Provider'

import 'react-toastify/dist/ReactToastify.css'
import 'react-phone-input-2/lib/bootstrap.css'
import './index.css'

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID
if (typeof GOOGLE_ANALYTICS_ID === 'string') {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID, {
    gaOptions: {
      storage: 'none',
      storeGac: false,
    },
  })
  ReactGA.set({
    anonymizeIp: true,
    customBrowserType: !isMobile
      ? 'desktop'
      : 'web3' in window || 'ethereum' in window
      ? 'mobileWeb3'
      : 'mobileRegular',
  })
} else {
  ReactGA.initialize('test', { testMode: true, debug: true })
}

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <SecTokenListUpdater />
    </>
  )
}

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DNS,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({}),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    } as any),
  ],
  // Performance Monitoring
  tracesSampleRate: 0.4, //  Capture 100% of the transactions
  // Session Replay
  //
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <HashRouter>
        <LanguageProvider>
          <Web3Provider>
            <Blocklist>
              <Updaters />
              <ThemeProvider>
                <ThemedGlobalStyle />
                <MuiThemeProvider>
                  <LocalizationProvider dateAdapter={DayJsUtils}>
                    <CookiesProvider>
                      <App />
                      <ToastContainer />
                    </CookiesProvider>
                  </LocalizationProvider>
                </MuiThemeProvider>
              </ThemeProvider>
            </Blocklist>
          </Web3Provider>
        </LanguageProvider>
      </HashRouter>
    </PersistGate>
  </Provider>
)

serviceWorkerRegistration.unregister()
