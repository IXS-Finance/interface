import { InvestmentStage } from 'state/launchpad/types'
import { PaginateResponse } from 'types/pagination'

export interface WhitelistWalletPayload {
  fullName: string
  walletAddress: string
}

export interface WhitelistWallet {
  id: number
  fullName: string
  walletAddress: string
  userId: number
}

export interface IssuanceDataExtract {
  offerId: string
  offerInvestmentId: number
  issuanceName: string
  name: string
  companyName: string
  investmentAmount: string
  tokenAmount: string
  walletAddress: string
  transactionId: number
  nationality: string
  country: string
  accredited: number
  email: string
  occupation: string
  income: string
  stage: InvestmentStage
  age: string
  wishAmount: string
}

export interface IssuanceDataStatistics {
  totalInvestmentAmount: string
  nameCount: number
  companyNameCount: number
  totalTokenAmount: string
  nationalityCount: string
  countryCount: string
  accreditedCount: string
}

export interface IssuanceDataStatisticsDto {
  result: PaginateResponse<IssuanceDataExtract>
  statistics: IssuanceDataStatistics
}

export interface ChangesRequestedValues {
  changesRequested: string
  reasonRequested: string
}
