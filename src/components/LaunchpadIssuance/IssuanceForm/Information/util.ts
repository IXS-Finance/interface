import React from 'react'
import Big from 'big.js'
import { InformationFormValues, OfferTokenType } from './types'

import {
  OfferIndustry,
  OfferNetwork,
  OfferTokenStandart,
  OfferDistributionFrequency,
  OfferInvestmentStructure,
} from 'state/launchpad/types'
import { SMART_CONTRACT_STRATEGIES } from 'components/LaunchpadIssuance/types'

export const isDefinedNumber = (foo: any) => ![undefined, null, ''].includes(foo) && !Number.isNaN(foo)

export const getInitialValues = (smartContractStrategy?: SMART_CONTRACT_STRATEGIES) =>
  ({
    profilePicture: null,
    cardPicture: null,

    shortDescription: '',
    longDescription: '',

    title: '',

    companyIdNumber: '',

    investmentStructure: '',
    issuerIdentificationNumber: '',

    industry: null,
    investmentType: null,

    country: '',
    restrictedJurisdictions: ['US', 'KP'] as string[],

    tokenName: '',
    tokenTicker: '',
    decimals: '',
    trusteeAddress: '',
    tokenType: '',

    network: null,

    hardCap: '',
    softCap: '',

    tokenPrice: '',
    tokenStandart:
      smartContractStrategy === SMART_CONTRACT_STRATEGIES.nonOriginalWithNoAccess ? OfferTokenStandart.erc20 : null,
    totalSupply: '',
    tokenReceiverAddress: '',

    minInvestment: '',
    maxInvestment: '',

    hasPresale: false,
    presaleAlocated: '',
    presaleMinInvestment: '',
    presaleMaxInvestment: '',
    presaleTokenPrice: '',

    images: [],
    videos: [{ url: '' }],

    purchaseAgreement: null,
    investmentMemorandum: null,
    otherExecutionDocuments: [{ file: null }],
    additionalDocuments: [{ file: null }],

    members: [
      {
        photo: null,
        name: '',
        role: '',
        about: '',
      },
    ],
    faq: [
      {
        question: '',
        answer: '',
      },
    ],

    allowOnlyAccredited: false,
    tokenomicsAgreement: false,

    terms: {
      investmentStructure: '',
      dividentYield: '',
      investmentPeriod: '',
      grossIrr: '',
      distributionFrequency: '',
    },

    timeframe: {
      whitelist: null,
      preSale: null,
      sale: null,
      closed: null,
      claim: null,
    },

    social: [],

    website: '',
    whitepaper: '',
    email: '',
    smartContractStrategy,
  } as unknown as InformationFormValues)

export const industryOptions = [
  { label: 'Blockchain', value: OfferIndustry.blockchain },
  { label: 'Energy', value: OfferIndustry.energy },
  { label: 'Finance', value: OfferIndustry.finance },
  { label: 'Gaming', value: OfferIndustry.gaming },
  { label: 'Healthcare', value: OfferIndustry.healthcare },
  { label: 'Real Estate', value: OfferIndustry.realEstate },
  { label: 'Technology', value: OfferIndustry.technology },
  { label: 'Media & Entertainment', value: OfferIndustry.mediaAndEntertainment },
  { label: 'Other', value: OfferIndustry.other },
]

export const investmentStructureOptions = [
  { label: 'Equity', value: OfferInvestmentStructure.equity },
  { label: 'Debt', value: OfferInvestmentStructure.debt },
  { label: 'Hybrid', value: OfferInvestmentStructure.hybrid },
  { label: 'Others', value: OfferInvestmentStructure.other },
]

export const networkOptions = [
  // { label: 'Etherium', value: OfferNetwork.ethereum },
  { label: 'Polygon', value: OfferNetwork.polygon },
  { label: 'Base', value: OfferNetwork.base },
  { label: 'Ozean', value: OfferNetwork.ozean },
  { label: 'Kaia', value: OfferNetwork.kaia },
  { label: 'RedBelly', value: OfferNetwork.redBelly },
  // { label: 'Kovan', value: OfferNetwork.kovan },
]

export const ERC20Option = { label: 'ERC20', value: OfferTokenStandart.erc20 }
export const RWAERC20Option = { label: 'RWA ERC-20', value: OfferTokenStandart.rwaErc20 }
export const standardOptions = [
  ERC20Option,
  { label: 'XTokenLite', value: OfferTokenStandart.xtokenlite },
  RWAERC20Option,
]

export const structureOptions = [
  { label: 'ERC20', value: OfferTokenStandart.erc20 },
  { label: 'XTokenLite', value: OfferTokenStandart.xtokenlite },
]

export const tokenTypeOptions = [
  { label: 'WIXS', value: OfferTokenType.WIXS },
  { label: 'WBTC', value: OfferTokenType.WBTC },
  { label: 'WETH', value: OfferTokenType.WETH },
  { label: 'MATIC', value: OfferTokenType.MATIC },
  { label: 'USDC', value: OfferTokenType.USDC },
  { label: 'USDT', value: OfferTokenType.USDT },
]

export const tokenTypeOptionsByNetwork = {
  [OfferNetwork.polygon]: [
    { label: 'WIXS', value: OfferTokenType.WIXS },
    { label: 'MATIC', value: OfferTokenType.MATIC },
    { label: 'USDC', value: OfferTokenType.USDC },
    { label: 'USDT', value: OfferTokenType.USDT },
  ],
  [OfferNetwork.base]: [
    { label: 'USDC', value: OfferTokenType.USDC },
    { label: 'USDT', value: OfferTokenType.USDT },
    { label: 'WIXS', value: OfferTokenType.WIXS },
    { label: 'WETH', value: OfferTokenType.WETH },
  ],
  [OfferNetwork.ozean]: [
    { label: 'WUSDX', value: OfferTokenType.WUSDX },
    { label: 'USDC', value: OfferTokenType.USDC },
    { label: 'USDT', value: OfferTokenType.USDT },
  ],
  [OfferNetwork.kaia]: [
    { label: 'USDC', value: OfferTokenType.USDC },
    { label: 'USDT', value: OfferTokenType.USDT },
  ],
  [OfferNetwork.redBelly]: [
    { label: 'USDC', value: OfferTokenType.USDC },
    { label: 'USDT', value: OfferTokenType.USDT },
    { label: 'WIXS', value: OfferTokenType.WIXS },
    { label: 'WETH', value: OfferTokenType.WETH },
  ],
} as any

export const tokenDecimalsOnOptions = [
  { label: 'On', value: true },
  { label: 'Off', value: false },
]
export const distributionFrequencyOptions = [
  { label: 'Monthly', value: OfferDistributionFrequency.monthly },
  { label: 'Quarterly', value: OfferDistributionFrequency.quarterly },
  { label: 'Semi-Annually', value: OfferDistributionFrequency.semiAnnually },
  { label: 'Annually', value: OfferDistributionFrequency.annually },
  { label: 'N/A', value: OfferDistributionFrequency.notApplicable },
  { label: 'Other', value: OfferDistributionFrequency.other },
]

export const getSetter = (onChange: (e: Partial<React.ChangeEvent<any>>) => void) => {
  return (name: string, value: any) =>
    onChange({
      target: { name, value },
    })
}

export const calculateSupplyForSale = (
  offer: Pick<InformationFormValues, 'tokenPrice' | 'hasPresale' | 'presaleTokenPrice' | 'presaleAlocated' | 'hardCap'>
) => {
  const { tokenPrice, hardCap, hasPresale, presaleTokenPrice, presaleAlocated } = offer
  if (!tokenPrice || !hardCap || +tokenPrice === 0) return '0'

  if (hasPresale) {
    if (!presaleTokenPrice || !presaleAlocated || +presaleTokenPrice === 0) return '0'

    const presaleTokenAmount = new Big(presaleAlocated).div(presaleTokenPrice)
    const publicTokenAmount = new Big(hardCap).minus(presaleAlocated).div(tokenPrice)
    return presaleTokenAmount.plus(publicTokenAmount).round(0, Big.roundUp).toString()
  }

  return new Big(hardCap).div(tokenPrice).round(0, Big.roundUp).toString()
}
