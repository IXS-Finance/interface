import { createReducer } from '@reduxjs/toolkit'
import { postLogin } from 'state/auth/actions'

import { createKYC, fetchGetMyKyc, MyKyc, updateKYC } from './actions'

export interface KYCState {
  loadingRequest: boolean
  error: any | null
  kyc: MyKyc | null
}

const initialState: KYCState = {
  loadingRequest: false,
  error: null,
  kyc: null,
}

export default createReducer<KYCState>(initialState, (builder) =>
  builder
    .addCase(createKYC.pending, (state) => {
      state.loadingRequest = true
      state.error = null
    })
    .addCase(createKYC.fulfilled, (state) => {
      state.loadingRequest = false
      state.error = null
    })
    .addCase(createKYC.rejected, (state, { payload: { errorMessage } }) => {
      state.loadingRequest = false
      state.error = errorMessage
    })
    .addCase(fetchGetMyKyc.pending, (state) => {
      state.loadingRequest = true
      state.error = null
    })
    .addCase(fetchGetMyKyc.fulfilled, (state, { payload }) => {
      state.loadingRequest = false
      state.error = null
      state.kyc = payload
    })
    .addCase(fetchGetMyKyc.rejected, (state, { payload: { errorMessage } }) => {
      state.loadingRequest = false
      state.error = errorMessage
    })
    .addCase(updateKYC.pending, (state) => {
      state.loadingRequest = true
      state.error = null
    })
    .addCase(updateKYC.fulfilled, (state) => {
      state.loadingRequest = false
      state.error = null
    })
    .addCase(updateKYC.rejected, (state, { payload: { errorMessage } }) => {
      state.loadingRequest = false
      state.error = errorMessage
    })
    .addCase(postLogin.pending, (state) => {
      state.loadingRequest = true
    })
    .addCase(postLogin.rejected, (state) => {
      state.loadingRequest = false
    })
)
