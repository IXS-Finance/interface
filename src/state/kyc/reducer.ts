import { createReducer } from '@reduxjs/toolkit'
import { postLogin } from 'state/auth/actions'

import {
  createKYC,
  fetchGetMyKyc,
  MyKyc,
  updateKYC,
  toggleExportCSVModal,
  setExportCSVOptionsRowLimit,
  exportCSV,
} from './actions'

export interface KYCState {
  loadingRequest: boolean
  error: any | null
  kyc: MyKyc | null
  openModalExportCSV: boolean
  exportCSVOptionsRowLimit: number
  loadingExportCSV: boolean
}

const initialState: KYCState = {
  loadingRequest: false,
  error: null,
  kyc: null,
  openModalExportCSV: false,
  exportCSVOptionsRowLimit: 100,
  loadingExportCSV: false,
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
    .addCase(toggleExportCSVModal, (state, { payload }) => {
      state.openModalExportCSV = payload.open
    })
    .addCase(setExportCSVOptionsRowLimit, (state, { payload }) => {
      state.exportCSVOptionsRowLimit = payload.rowLimit
    })
    .addCase(exportCSV.pending, (state) => {
      state.loadingExportCSV = true
    })
    .addCase(exportCSV.fulfilled, (state) => {
      state.loadingExportCSV = false
    })
)
