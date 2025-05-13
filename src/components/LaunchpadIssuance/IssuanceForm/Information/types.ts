import { IssuanceStatus, SMART_CONTRACT_STRATEGIES } from 'components/LaunchpadIssuance/types'
import {
  Asset,
  OfferDistributionFrequency,
  OfferIndustry,
  OfferInvestmentStructure,
  OfferNetwork,
  OfferTokenStandart,
} from 'state/launchpad/types'
import { IssuanceFile } from '../types'

export enum OfferTokenType {
  WIXS = 'WIXS',
  WBTC = 'WBTC',
  WETH = 'WETH',
  MATIC = 'MATIC',
  USDC = 'USDC',
  USDT = 'USDT',
  WUSDX = 'WUSDX',
}

export enum SocialMediaType {
  x = 'x',
  telegram = 'telegram',
  linkedIn = 'linkedin',
  discord = 'discord',
  reddit = 'reddit',
  youTube = 'youtube',
  coinMarketCap = 'coinmarketcap',
  coinGecko = 'coingecko',
  instagram = 'instagram',
  others = 'others',
}

export interface VideoLink {
  title?: string
  url: string
}

export interface InformationFormValues {
  id?: string
  status?: IssuanceStatus

  profilePicture: IssuanceFile
  cardPicture: IssuanceFile

  shortDescription: string
  longDescription: string

  title: string
  issuerIdentificationNumber: string

  industry: OfferIndustry
  investmentType: OfferInvestmentStructure

  country: string
  restrictedJurisdictions: string[]

  tokenName: string
  tokenTicker: string
  decimals: number | null
  trusteeAddress: string
  tokenType: OfferTokenType
  tokenStandart: OfferTokenStandart
  tokenPrice: number | null
  presaleTokenPrice: number | null
  totalSupply: string
  tokenReceiverAddress: string

  tokenAddress?: string
  investingTokenAddress?: string
  investingTokenSymbol?: string
  investingTokenDecimals?: number

  network: OfferNetwork

  hardCap: string
  softCap: string

  allowOnlyAccredited: boolean
  tokenomicsAgreement?: boolean

  minInvestment: string
  maxInvestment: string

  hasPresale: boolean
  presaleAlocated: string
  presaleMinInvestment: string
  presaleMaxInvestment: string

  changesRequested?: string
  reasonRequested?: string

  email: string
  website: string
  whitepaper: string

  images: IssuanceFile[]
  videos: VideoLink[]
  purchaseAgreement: AdditionalDocument
  investmentMemorandum: AdditionalDocument
  otherExecutionDocuments: AdditionalDocument[]
  additionalDocuments: AdditionalDocument[]

  members: TeamMember[]

  faq: FAQEntry[]

  terms: {
    investmentStructure: string
    dividentYield: string
    investmentPeriod: string
    grossIrr: string
    distributionFrequency: OfferDistributionFrequency
  }

  timeframe: {
    whitelist: Date
    preSale: Date
    sale: Date
    closed: Date
    claim: Date
  }

  social: SocialMediaLink[]
  smartContractStrategy?: SMART_CONTRACT_STRATEGIES
}

export interface SocialMediaLink {
  type: SocialMediaType
  url: string
}

export interface AdditionalDocument {
  file: IssuanceFile
  asset?: Asset
}

export interface FAQEntry {
  id?: number
  question: string
  answer: string
}

export interface TeamMember {
  id?: number
  photo: IssuanceFile
  name: string
  role: string
  about: string
}

export interface DateRange {
  start: Date
  end: Date
}
