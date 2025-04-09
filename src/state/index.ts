import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { load, save } from 'redux-localstorage-simple'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'

import admin from './admin/reducer'
import application from './application/reducer'
import auth from './auth/reducer'
import brokerDealer from './brokerDealer/reducer'
import burn from './burn/reducer'
import deposit from './deposit/reducer'
import eventLog from './eventLog/reducer'
import faucet from './faucet/reducer'
import { updateVersion } from './global/actions'
import lists from './lists/reducer'
import mint from './mint/reducer'
import multicall from './multicall/reducer'
import nft from './nft/reducer'
import pool from './pool/reducer'
import secTokens from './secTokens/reducer'
import stakingPoolSize from './stake/poolSizeReducer'
import staking from './stake/reducer'
import unstaking from './stake/unstake/reducer'
import swap from './swap/reducer'
import swapHelper from './swapHelper/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'
import vesting from './vesting/reducer'
import withdraw from './withdraw/reducer'
import assetForm from './nft/assetForm.reducer'
import collectionForm from './nft/collectionForm.reducer'
import secCatalog from './secCatalog/reducer'
import kyc from './kyc/reducer'
import whitelabel from './whitelabel/reducer'
import payout from './payout/reducer'
import launchpad from './launchpad/reducer'
import tokenManager from './token-manager/reducer'
import issuance from './issuance/reducer'
import wallet from './wallet'
import global from './global'
import jumpTask from './jumpTask'
import poolCreation from './dexV2/poolCreation'
import tokenLists from './dexV2/tokenLists'
import tokens from './dexV2/tokens'
import swapDexV2 from './dexV2/swap'
import userSettings from './dexV2/userSettings'
import dexV2Pool from './dexV2/pool'
import dexV2Staking from './dexV2/poolStaking'

const PERSISTED_KEYS: string[] = [
  'auth',
  'lists',
  'swap',
  'swapHelper',
  'transactions',
  'user',
  'wallet',
  'global',
  'userSettings',
  'dexV2Pool'
]

const persistConfig = {
  key: 'root',
  storage,
  whitelist: PERSISTED_KEYS,
}

const combinedReducer = combineReducers({
  admin,
  application,
  assetForm,
  auth,
  brokerDealer,
  burn,
  collectionForm,
  deposit,
  eventLog,
  faucet,
  kyc,
  lists,
  mint,
  multicall,
  nft,
  payout,
  pool,
  secCatalog,
  secTokens,
  staking,
  stakingPoolSize,
  swap,
  swapHelper,
  tokenManager,
  transactions,
  unstaking,
  user,
  vesting,
  whitelabel,
  withdraw,
  launchpad,
  issuance,
  wallet,
  global,
  jumpTask,
  poolCreation,
  tokenLists,
  tokens,
  swapDexV2,
  userSettings,
  dexV2Pool,
  dexV2Staking,
})

const rootReducer = (state: any, action: any) => {
  if (action.type === 'clearStore') {
    state = undefined
  }
  return combinedReducer(state, action)
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
    }),
    save({ states: PERSISTED_KEYS, debounce: 1000 }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

export const persistor = persistStore(store)

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
