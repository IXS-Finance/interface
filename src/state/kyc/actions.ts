import { ActionCreatorWithoutPayload, ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'

import { KYCStatuses } from 'pages/KYC/enum'
import { CorporateKyc, IndividualKyc } from 'state/admin/actions'

import { RawGetMePayload } from '../user/actions'

export const createKYC: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<any>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('kyc/createKYC/pending'),
  fulfilled: createAction('kyc/createKYC/fulfilled'),
  rejected: createAction('kyc/createKYC/rejected'),
}

export const fetchGetMyKyc: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<MyKyc>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('kyc/getMyKyc/pending'),
  fulfilled: createAction('kyc/getMyKyc/fulfilled'),
  rejected: createAction('kyc/getMyKyc/rejected'),
}

export const updateKYC: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<MyKyc>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('kyc/updateKYC/pending'),
  fulfilled: createAction('kyc/updateKYC/fulfilled'),
  rejected: createAction('kyc/updateKYC/rejected'),
}

export interface MyKyc {
  id: number
  userId: number
  individualKycId: null | number
  corporateKycId: null | number
  status: KYCStatuses
  kycProviderStatus: string
  message: null | string
  customerId: number
  crpId: number
  recordId: number
  createdAt: string
  updatedAt: null | string
  deletedAt: null | string
  user: RawGetMePayload
  individual: IndividualKyc | null
  corporate: CorporateKyc | null
  audits: Array<{
    id: number
    userKycId: number
    action: string
    createdAt: string
    updatedAt: string
  }>
}
