import PolygonIcon from 'assets/images/polygonIcon.svg'
import BaseIcon from 'assets/images/baseIcon.svg'
import ozeanLogoUrl from 'assets/images/chains/ozean.png'
import kaiaLogoUrl from 'assets/images/chains/kaia.png'
import { Chains, NetworkName } from 'utils/chains'
import { ENV_SUPPORTED_TGE_CHAINS } from 'constants/addresses'
import { capitalizeWords } from 'utils/strings'

export const incomes = ['< 50,000', '50,000-100,000', '100,000-300,000', '> 300,000'].map((name, index) => ({
  value: ++index,
  label: name,
}))

export const genders = [
  { value: 1, label: 'Male' },
  { value: 2, label: 'Female' },
  { value: 3, label: 'Unknown' },
]

export const sourceOfFunds = [
  'Inheritance/Gifts',
  'Investments',
  'Interest/Dividends',
  'Property',
  'Allowances/Spouses',
  'Employment',
  'Pension',
  'Retirement Benefits',
  'Others',
].map((name, index) => ({ value: ++index, label: name }))

export const SecondaryContactDetails = ['Proof of Address', 'Business Email Address', 'Social Media Handle'].map(
  (name, index) => ({ value: ++index, label: name })
)

export const socialMediaPlatform = ['Telegram', 'Discord', 'X.com', 'Facebook', 'Instagram', 'LinkedIn'].map(
  (name, index) => ({ value: ++index, label: name })
)

// Create a dynamic dropdown with chainId for different environments

const networkIcons = {
  [NetworkName.BASE]: BaseIcon,
  [NetworkName.POLYGON]: PolygonIcon,
  [NetworkName.OZEAN]: ozeanLogoUrl,
  [NetworkName.KAIA]: kaiaLogoUrl,
}

export const blockchainNetworks = Object.entries(NetworkName).map(([key, value]) => {
  const chainIds = Chains[value]
  const chainId = ENV_SUPPORTED_TGE_CHAINS?.includes(chainIds[0]) ? chainIds[0] : chainIds[1]
  return {
    value,
    label: capitalizeWords(value),
    icon: networkIcons[value],
    chainId: chainId,
  }
})

export const fatcaOptions = [
  'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Proin eget tortor risus.',
  'Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.',
].map((name, index) => ({ value: ++index, label: name }))

export const optInOptions = [
  'I give my consent to IC SG Pte Ltd dba InvestaX to treat me as an “Accredited Investor”',
  'I have been informed of and understand the consequences of my qualification as an Accredited Investor, in particular the reduced regulatory investor safeguards for Accredited Investors.',
  'I have been informed of and understand my right to opt out of the Accredited Investors status with InvestaX at any point in time.',
].map((name, index) => ({ value: ++index, label: name }))

export const empleymentStatuses = [
  'Full-Time Employee',
  'Part-Time Employee',
  'Own Business',
  'Government Employee',
  'Freelancers',
  'Consultants',
  'Self-Employed',
].map((name, index) => ({ value: ++index, label: name }))

export const occupationList = [
  'ACCOUNTANT',
  'ADMINISTRATION PROFESSIONAL',
  'ARCHITECT',
  'ARMED FORCES',
  'ART/ANTIQUE DEALER',
  'ARTISTE/MUSICIAN/CREW/PRODUCER',
  'AUCTIONEER',
  'BANKER',
  'BUILDING CONSTRUCTION LABOURER',
  'BUSINESS OWNER/SOLE PROPRIETOR',
  'C-SUITE OFFICER',
  'CABIN CREW',
  'CHEF',
  'CIVIL SERVANT',
  'CLEANER/HOUSEKEEPER',
  'CLERICAL STAFF',
  'CUSTOMER SERVICE PROFESSIONAL',
  'DESIGNER',
  'COMPANY DIRECTOR/PARTNER',
  'DRIVER',
  'ELECTRICIAN',
  'ENGINEER',
  'FACTORY/MACHINE OPERATOR',
  'F&B SERVICE CREW',
  'HAIRDRESSER',
  'HAWKER',
  'HOTEL AND RESTAURANT MANAGER',
  'INFORMATION TECHNOLOGY PROFESSIONAL',
  'INSURANCE AGENT',
  'JOURNALIST/REPORTER',
  'LEGAL PROFESSIONAL',
  'MEDICAL PROFESSIONAL',
  'MONEY LENDER',
  'PAWNBROKER',
  'PHOTOGRAPHER',
  'PILOT',
  'PLUMBER',
  'GOVERNMENT OFFICIAL/POLITICIAN',
  'PROFESSOR',
  'REAL ESTATE BROKER/AGENT',
  'RECEPTIONIST',
  'RETIRED',
  'REMISER/TRADER/DEALER',
  'SALES, MARKETING AND PUBLIC RELATIONS PROFESSIONAL',
  'SCHOOL PRINCIPAL',
  'SKILLED/PRODUCTION WORKER',
  'SURVEYOR',
  'TEACHING PROFESSIONAL',
  'TECHNICIAN',
  'TRAVEL AGENT/TOUR GUIDE',
  'UNEMPLOYED',
  'UNKNOWN - UNKNOWN',
  'OTHERS',
  'NOT APPLICABLE - NOT APPLICABLE',
].map((name, index) => ({ value: ++index, label: name }))

export const legalEntityTypes = [
  'ASSOCIATION',
  'BANKS',
  'CHARITY',
  'CLUB',
  'EXEMPT PRIVATE COMPANY LIMITED BY SHARES',
  'FOREIGN BRANCH',
  'FOREIGN COMPANY',
  'FOREIGN ENTITY NOT REGISTERED WITH ACRA',
  'FUNDS',
  'GENERAL PARTNERSHIP',
  'GOVERNMENT BODIES',
  'INCORPORATED',
  'LIMITED',
  'LIMITED LIABILITY COMPANY',
  'LIMITED LIABILITY PARTNERSHIP',
  'LIMITED PARTNERSHIP',
  'LOCAL COMPANY',
  'LOCAL ENTITY NOT REGISTERED WITH LOCAL REGISTRAR',
  'LOCAL PRIVATE COMPANY',
  'LOCAL PUBLIC COMPANY',
  'MANAGEMENT CORPORATIONS',
  'FINANCIAL INSTITUTION',
  'NON-FOR-PROFIT ORGANISATION',
  'ORGAN OF STATE',
  'PARTNERSHIP',
  'PRIVATE COMPANY LIMITED BY SHARES',
  'PROPRIETARY LIMITED',
  'PUBLIC COMPANY LIMITED BY GUARANTEE',
  'PUBLIC COMPANY LIMITED BY SHARES',
  'PUBLIC LIMITED COMPANY',
  'SOLE-PROPRIETORSHIP',
  'TRUST',
  'VARIABLE CAPITAL COMPANY',
  'OTHERS',
  'UNKNOWN',
].map((name, index) => ({ value: ++index, label: name }))

export const corporateSourceOfFunds = [
  'Loan',
  'Property',
  'Investments',
  'Interest/Dividends',
  'Business revenue',
  'Others',
].map((name, index) => ({ value: ++index, label: name }))

export const individualRepresentOptions = [
  'I am a person whose individual net worth or joint net worth with my spouse at the time of purchase exceeds US $1 million',
  'I am person who had an individual income in excess of US$200,000 in each of the two most recent years or joint income with my spouse in excess of US$300 000 in each of those years and has a reasonable expectation of reaching the same income level in the current year',
]

export const corporateRepresentOptions = [
  'I represent a bank licensed in The Bahamas, whether acting in its individual or fiduciary capacity',
  'I represent a broker-dealer or securities investment advisor licensed in The Bahamas and acting for its own account',
  'I represent an insurance company licensed in The Bahamas',
  'I represent a fund licensed in The Bahamas',
  'I am a person, other than an individual with total assets in excess of US $5 million  not formed for the specific purpose of acquiring the securities offered',
  'I represent an entity in which all of the equity owners are accredited investors',
]

interface IFormInitial {
  [key: string]: any
}

export const individualFormInitialValues: IFormInitial = {
  firstName: '',
  middleName: '',
  lastName: '',

  dateOfBirth: null,
  gender: null,

  nationality: null,
  citizenship: null,
  email: '',
  phoneNumber: '',

  address: '',
  postalCode: '',
  country: null,
  city: '',

  idType: '',
  idNumber: '',
  idIssueDate: null,
  idExpiryDate: null,

  proofOfIdentity: [],
  proofOfAddress: [],
  selfie: [],

  occupation: '',
  employmentStatus: null,
  employer: '',
  income: null,

  taxDeclarations: [{ country: null, idNumber: '' }],
  removedTaxDeclarations: [],

  sourceOfFunds: [],
  otherFunds: '',

  isUSTaxPayer: -1,
  usTin: '',

  investorDeclarationIsFilled: false,

  isTotalAssets: false,
  isAnnualIncome: false,
  isFinancialAssets: false,
  isJointIncome: false,

  accredited: -1,
  investorDeclaration: undefined,
  confirmSafeguards: undefined,
  confirmOptout: undefined,
  evidenceOfAccreditation: [],
  confirmStatusDeclaration: false,

  taxCountry: '',
  taxIdentification: '',
}

export const individualFormV2InitialValues: IFormInitial = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
}

export const initialValuesBusinessEmail: IFormInitial = {
  businessEmail: '',
}

export const corporateFormInitialValues: IFormInitial = {
  corporateName: '',
  typeOfLegalEntity: null,
  registrationNumber: '',
  countryOfIncorporation: null,
  businessActivity: '',
  inFatfJurisdiction: undefined,
  personnelName: '',
  designation: '',
  email: '',
  phoneNumber: '',
  authorizationDocuments: [],
  authorizationIdentity: [],
  address: '',
  postalCode: '',
  country: null,
  city: '',
  residentialAddressAddress: '',
  residentialAddressPostalCode: '',
  residentialAddressCountry: null,
  residentialAddressCity: '',
  sourceOfFunds: [],
  otherFunds: '',
  accredited: -1,
  isUSTaxPayer: undefined,
  usTin: '',
  taxCountry: null,
  taxNumber: '',
  beneficialOwners: [
    { fullName: '', nationality: '', dateOfBirth: '', address: '', shareholding: '', proofOfIdentity: null },
  ],
  corporateMembers: [{ fullName: '', nationality: '', designation: '', proofOfIdentity: null }],
  corporateDocuments: [],
  financialDocuments: [],
  removedDocuments: [],
  removedBeneficialOwners: [],
  removedCorporateMembers: [],
}

export const promptValue = 'Data will be lost if you leave the page, are you sure?'
