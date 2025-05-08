import { ActionCreatorWithoutPayload, ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'

import { ManagerOfToken } from 'state/user/actions'
import { timePeriods } from 'utils/time'
import { PaginationDetails } from 'types/pagination'

export const postLogin: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ auth: RawAuthPayload }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/postLogin/pending'),
  fulfilled: createAction('admin/postLogin/fulfilled'),
  rejected: createAction('admin/postLogin/rejected'),
}

export const logout: Readonly<{
  fulfilled: ActionCreatorWithoutPayload
}> = {
  fulfilled: createAction('admin/logOut/fulfilled'),
}

export const getAccreditationList: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: AccreditationList }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/getAccreditationList/pending'),
  fulfilled: createAction('admin/getAccreditationList/fulfilled'),
  rejected: createAction('admin/getAccreditationList/rejected'),
}

export const getBrokerDealerList: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: BrokerDealerList }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/getBrokerDealerList/pending'),
  fulfilled: createAction('admin/getBrokerDealerList/fulfilled'),
  rejected: createAction('admin/getBrokerDealerList/rejected'),
}

export const postApproveAccreditation: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: { id: number; status: string } }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/postApproveAccreditation/pending'),
  fulfilled: createAction('admin/postApproveAccreditation/fulfilled'),
  rejected: createAction('admin/postApproveAccreditation/rejected'),
}

export const postDeclineAccreditation: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: { id: number; status: string } }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/postDeclineAccreditation/pending'),
  fulfilled: createAction('admin/postDeclineAccreditation/fulfilled'),
  rejected: createAction('admin/postDeclineAccreditation/rejected'),
}

export const postResetAccreditation: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: { id: number; status: string } }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/postResetAccreditation/pending'),
  fulfilled: createAction('admin/postResetAccreditation/fulfilled'),
  rejected: createAction('admin/postResetAccreditation/rejected'),
}

export const getBrokerDealerSwaps: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: BrokerDealerSwaps }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('broker-dealer/swaps/pending'),
  fulfilled: createAction('broker-dealer/swaps/fulfilled'),
  rejected: createAction('broker-dealer/swaps/rejected'),
}

export const getKycList: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: KycList }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/getKycList/pending'),
  fulfilled: createAction('admin/getKycList/fulfilled'),
  rejected: createAction('admin/getKycList/rejected'),
}

export const getUsersList: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: UsersList }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/getUsersList/pending'),
  fulfilled: createAction('admin/getUsersList/fulfilled'),
  rejected: createAction('admin/getUsersList/rejected'),
}

export const postUser: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: User }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/postUser/pending'),
  fulfilled: createAction('admin/postUser/fulfilled'),
  rejected: createAction('admin/postUser/rejected'),
}

export const updateUser: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: User }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/updateUser/pending'),
  fulfilled: createAction('admin/updateUser/fulfilled'),
  rejected: createAction('admin/updateUser/rejected'),
}

export const postApproveKyc: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: { id: number; status: string } }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/postApproveKyc/pending'),
  fulfilled: createAction('admin/postApproveKyc/fulfilled'),
  rejected: createAction('admin/postApproveKyc/rejected'),
}

export const postRejectKyc: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: { id: number; status: string } }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/postRejectKyc/pending'),
  fulfilled: createAction('admin/postRejectKyc/fulfilled'),
  rejected: createAction('admin/postRejectKyc/rejected'),
}

export const postResetKyc: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: { id: number; status: string } }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/postResetKyc/pending'),
  fulfilled: createAction('admin/postResetKyc/fulfilled'),
  rejected: createAction('admin/postResetKyc/rejected'),
}

export const postResubmitKyc: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithoutPayload
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/postResubmitKyc/pending'),
  fulfilled: createAction('admin/postResubmitKyc/fulfilled'),
  rejected: createAction('admin/postResubmitKyc/rejected'),
}

export const getWhitelistedList: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithPayload<{ data: Whitelist }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/getWhitelistedList/pending'),
  fulfilled: createAction('admin/getWhitelistedList/fulfilled'),
  rejected: createAction('admin/getWhitelistedList/rejected'),
}

export const patchAddOrRemoveWhitelisted: Readonly<{
  pending: ActionCreatorWithoutPayload
  fulfilled: ActionCreatorWithoutPayload
  rejected: ActionCreatorWithPayload<{ errorMessage: string }>
}> = {
  pending: createAction('admin/patchAddOrRemoveWhitelisted/pending'),
  fulfilled: createAction('admin/patchAddOrRemoveWhitelisted/fulfilled'),
  rejected: createAction('admin/patchAddOrRemoveWhitelisted/rejected'),
}

export interface AuthPayload {
  token: string
  expiresAt: number
}
export interface RawAuthPayload {
  accessToken: string
  expiresIn: keyof typeof timePeriods
}

export interface AccreditationList {
  page: number
  offset: number
  totalItems: number
  totalPages: number
  itemCount: number
  items: any[]
  nextPage: number
  prevPage: number
}

export interface User {
  active: boolean
  createdAt: string
  deletedAt: null | string
  email: null | string
  ethAddress: string
  id: number
  username: string | null
  isWhitelisted: boolean
  language: string
  photo: any
  photoId: null | string
  principal: string
  role: string
  tenant: string
  updatedAt: string
  managerOf: ManagerOfToken[]
  whiteLabelConfig?: any
}

export interface TokenManagerEntry {
  token: Token
}

export interface Token {
  id: number

  name: string
  address: string

  payoutEvents: PayoutEvent[]
}

export interface PayoutEvent {
  id: number

  type: string
  status: string
}

export interface UsersList extends PaginationDetails {
  items: User[]
}

export interface Whitelisted {
  active: boolean
  ethAddress: string
  id: number
  role: string
  tenant: string
}

export interface Whitelist {
  page: number
  totalPages: number
  items: Whitelisted[]
}

export interface BrokerDealerList {
  data: any
}

export interface BrokerDealerSwaps {
  page: number
  totalPages: number
  items: BrokerDealerSwapItem[]
}
export interface AccreditationItem {
  createdAt: string
  custodianApplicationId?: number
  deletedAt?: string
  id: number
  brokerDealerStatus: string
  custodianStatus: string
  kyc: {
    url: string
    [key: string]: any
  }
  message?: string
  status: string
  custodian: {
    createdAt: string
    deletedAt: string | null
    description: string
    id: number
    logoId: number | null
    name: string
    updatedAt: string
    website: string
  }
  brokerDealerId?: number
  brokerDealer: {
    createdAt: string
    deletedAt: string | null
    description: string
    id: number
    logoId: number | null
    name: string
    updatedAt: string
    website: string
  }
  token: {
    address: string
    chainId: number
    createdAt: string
    custodyAssetAddress: string
    custodyAssetId: string
    custodyVaultId: string
    decimals: number
    deletedAt?: string
    description: string
    ethTransactionId: number
    id: number
    lastBlockNumber: number
    logoId?: number
    name: string
    network: string
    platformId: number
    status: string
    symbol: string
    updatedAt: string
  }
  tokenId: number
  updatedAt: string
  user: {
    active: true
    createdAt: string
    deletedAt?: string
    email?: string
    ethAddress: string
    id: number
    language: string
    photo?: { uuid: string }
    photoId?: number
    principal: string
    role: string
    tenant: string
    updatedAt: string
  }
  userId: number
  userKyc: KycItem
}

export type BrokerDealerSwapItem = {
  id: number
  amount: string
  brokerDealer: {
    name: string
  }
  brokerDealerId: number
  status: string
  token: {
    name: string
    symbol: string
    decimals: number
  }
  tokenId: number
  user: {
    ethAddress: string
  }
  data: {
    amount: string
    userEthAddress: string
    pairAddress: string
    tokenSymbol: string
    pairSymbol: string
    tokenAddress: string
  }
  createdAt: string
  transactionHash?: string | null
}

export interface Asset {
  createdAt: string
  deletedAt: string | null
  id: number
  isPrivate: false
  mimeType: string
  name: string
  otc: string | null
  path: string
  size: string | null
  state: string
  tenant: string
  updatedAt: string
  userId: number
  uuid: number
}

export interface Document {
  asset: Asset
  assetId: number
  createdAt: string
  deletedAt: string | null
  id: number
  individualKycId: number
  type: string
  updatedAt: string
}

export interface KycList {
  page: number
  offset: number
  totalItems: number
  totalPages: number
  itemCount: number
  items: Array<KycItem>
  nextPage: number
  prevPage: number
}

export enum IndividualKycVersion {
  v1 = 'v1',
  v2 = 'v2',
}

export enum IndividualKycRiskRating {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  NOT_SET = 'not_set',
}

export interface IndividualKyc {
  accredited: number
  address: {
    city: string
    country: string
    createdAt: string
    deletedAt: string | null
    id: number
    address: string
    postalCode: string
    updatedAt: string
    [key: string]: any
  }
  addressId: number
  citizenship: string
  createdAt: string
  dateOfBirth: string
  deletedAt: string | null
  documents: Array<Document>
  email: string
  employer: string
  employmentStatus: string
  firstName: string
  gender: string
  id: number
  income: string
  lastName: string
  middleName: string
  nationality: string
  occupation: string
  secondaryContactDetails: string
  alternateEmail: string
  socialPlatform: string
  handleName: string
  isEmailVerified?: boolean
  phoneNumber: string
  sourceOfFunds: string
  updatedAt: string
  usTin: string | null
  investorDeclarationStatus: InvestorDeclaration
  taxDeclarations: TaxDeclaration[]
  [key: string]: any
  version: IndividualKycVersion
  overallRiskRating: IndividualKycRiskRating
}

export interface TaxDeclaration {
  isAdditional?: any
  country: string
  idNumber?: string
  reason?: string
}

export interface CorporateKyc {
  accredited: number
  address: {
    city: string
    country: string
    createdAt: string
    deletedAt: string | null
    id: number
    address: string
    postalCode: string
    updatedAt: string
    [key: string]: any
  }
  addressId: number
  citizenship: string
  createdAt: string
  dateOfBirth: string
  deletedAt: string | null
  documents: Array<Document>
  email: string
  employer: string
  employmentStatus: string
  firstName: string
  gender: string
  id: number
  income: string
  lastName: string
  middleName: string
  nationality: string
  occupation: string
  phoneNumber: string
  sourceOfFunds: string
  updatedAt: string
  usTin: string | null
  investorDeclarationStatus: InvestorDeclaration
  taxDeclarations: TaxDeclaration[]
  [key: string]: any
}

interface InvestorDeclaration {
  status: string
  acceptOfQualification: boolean
  acceptRefusalRight: boolean
}

interface IndividualAudit {
  firstName: string
  middleName: string
  lastName: string
}

interface Audit {
  id: number
  approvedBy?: number
  approvedByUser?: IndividualAudit
  rejectedBy?: number
  rejectedByUser?: IndividualAudit
  createdAt: string
  updatedAt: string
}

export interface KycItem {
  authorizerNote?: string
  customerId?: number
  documentVerificationStatus?: string | undefined
  amlVerificationStatus?: string | undefined
  poaVerificationStatus?: string | undefined
  identityVerificationStatus?: string | undefined
  createdAt: string
  deletedAt: string | null
  id: number
  individual?: IndividualKyc
  corporate?: IndividualKyc
  individualKycId: number
  status: string
  completedKycOfProvider: string
  updatedAt: string
  user: {
    active: true
    createdAt: string
    deletedAt?: string
    email?: string
    ethAddress: string
    id: number
    language: string
    photo?: { uuid: string }
    photoId?: number
    principal: string
    role: string
    tenant: string
    updatedAt: string
    referredBy?: string
    referralCode?: string
    whiteLabelConfig?: any
  }
  userId: number
  audits: Audit[]
}
