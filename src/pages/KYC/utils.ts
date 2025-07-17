import { IdentityDocumentType } from './enum'
import { legalEntityTypes } from './mock'

const filterFields = [
  'investorDeclarationStatus',
  'investorDeclarationId',
  'acceptOfQualification',
  'acceptRefusalRight',
]

export const corporateTransformApiData = (data: any) => {
  const {
    typeOfLegalEntity,
    countryOfIncorporation,
    documents,
    address,
    residentialAddress,
    taxCountry,
    sourceOfFunds,
    beneficialOwners,
    corporateMembers,
    usTin,
  } = data
  const [funds, otherFunds = ''] = sourceOfFunds ? sourceOfFunds.split(', Others, ') : ['', '']

  return {
    ...data,
    // Convert null string fields to empty strings
    corporateName: data.corporateName || '',
    businessActivity: data.businessActivity || '',
    registrationNumber: data.registrationNumber || '',
    personnelName: data.personnelName || '',
    designation: data.designation || '',
    email: data.email || '',
    phoneNumber: data.phoneNumber || '',
    address: address?.address || '',
    postalCode: address?.postalCode || '',
    city: address?.city || '',
    residentialAddressAddress: residentialAddress?.address || '',
    residentialAddressPostalCode: residentialAddress?.postalCode || '',
    residentialAddressCity: residentialAddress?.city || '',
    taxNumber: data.taxNumber === 'null' ? '' : (data.taxNumber || ''),
    reason: data.reason || '',
    usTin: data.usTin || '',
    otherFunds: otherFunds || '',
    // Ensure taxIdAvailable is a boolean, default to false if not present (TIN not available by default)
    taxIdAvailable: data.taxIdAvailable !== null && data.taxIdAvailable !== undefined ? !!data.taxIdAvailable : false,

    typeOfLegalEntity: {
      value: legalEntityTypes?.find(({ label }) => label === typeOfLegalEntity)?.value || 0,
      label: typeOfLegalEntity || '',
    },
    countryOfIncorporation: { value: 0, label: countryOfIncorporation || '' },
    country: { value: 0, label: address?.country || '' },
    residentialAddressCountry: { value: 0, label: residentialAddress?.country || '' },
    taxCountry: { value: 0, label: taxCountry || '' },

    authorizationDocuments: documents?.filter(({ type }: any) => type === 'authorization') || [],
    authorizationIdentity: documents?.filter(({ type }: any) => type === 'authorizationIdentity') || [],
    corporateDocuments: documents?.filter(({ type }: any) => type === 'corporate') || [],
    financialDocuments: documents?.filter(({ type }: any) => type === 'financial') || [],

    sourceOfFunds: funds && otherFunds && otherFunds.length ? [...funds?.split(', '), 'Others'] : funds?.split(', ') || [],
    isUSTaxPayer: usTin ? 1 : 0,
    beneficialOwners:
      beneficialOwners?.length > 0
        ? beneficialOwners?.map(({ id, fullName, nationality, dateOfBirth, address, shareholding, proofOfIdentity }: any) => ({
          id,
          fullName: fullName || '',
          nationality: nationality || '',
          dateOfBirth: dateOfBirth || '',
          address: address || '',
          shareholding: shareholding || '',
          proofOfIdentity,
        }))
        : [{ fullName: '', nationality: '', dateOfBirth: '', address: '', shareholding: '', proofOfAddress: null, proofOfIdentity: null }],
    corporateMembers:
      corporateMembers?.length > 0
        ? corporateMembers?.map(({ id, fullName, nationality, designation, proofOfIdentity }: any) => ({
          id,
          fullName: fullName || '',
          nationality: nationality || '',
          designation: designation || '',
          proofOfIdentity,
        }))
        : [{ fullName: '', nationality: '', designation: '', proofOfIdentity: null }],
    removedDocuments: [],
    removedBeneficialOwners: [],
    removedCorporateMembers: [],
  }
}

export const corporateTransformKycDto = (values: any) => {
  const {
    typeOfLegalEntity,
    countryOfIncorporation,
    country,
    residentialAddressCountry,
    sourceOfFunds,
    otherFunds,
    isUSTaxPayer,
    taxCountry,
    beneficialOwners,
    corporateMembers,
  } = values

  const newSourceOfFunds = sourceOfFunds ?? ''

  return {
    ...values,
    ...(!isUSTaxPayer && { usTin: '' }),
    typeOfLegalEntity: typeOfLegalEntity?.label,
    sourceOfFunds: [...newSourceOfFunds, ...(newSourceOfFunds.includes('Others') ? [otherFunds] : [])].join(', '),
    countryOfIncorporation: countryOfIncorporation?.label,
    country: country?.label,
    residentialAddressCountry: residentialAddressCountry?.label,
    taxCountry: taxCountry?.label,
    isUSTaxPayer: isUSTaxPayer ? true : false,
    beneficialOwners: JSON.stringify(
      beneficialOwners.map(({ id, fullName, nationality, dateOfBirth, address, shareholding, proofOfIdentity }: any) => ({
        id: id || null,
        fullName,
        nationality,
        dateOfBirth,
        address,
        shareholding: +shareholding,
        proofOfIdentity: proofOfIdentity?.id || null,
      }))
    ),
    corporateMembers: JSON.stringify(
      corporateMembers?.map(({ id, fullName, nationality, designation, proofOfIdentity }: any) => ({
        id: id || null,
        fullName,
        nationality,
        designation,
        proofOfIdentity: proofOfIdentity?.id || null,
      }))
    ),
    beneficialOwnersIdentity: beneficialOwners.map(({ proofOfIdentity }: any) => proofOfIdentity),
    corporateMembersIdentity: corporateMembers?.map(({ proofOfIdentity }: any) => proofOfIdentity),
    beneficialOwnersAddress: beneficialOwners.map(({ proofOfAddress }: any) => proofOfAddress),
  }
}

export const individualTransformApiData = (data: any, referralCode?: any) => {
  const {
    sourceOfFunds,
    address,
    documents,
    usTin,
    citizenship,
    employmentStatus,
    gender,
    nationality,
    income,
    secondaryContactDetails,
    occupation,
    idType,
  } = data
  const [funds = '', otherFunds = ''] = (sourceOfFunds ?? '').split(', Others, ')

  const idTypeKey = idType?.replaceAll(' ', '_') as keyof typeof IdentityDocumentType

  return {
    ...data,
    middleName: data.middleName ?? '',
    referralCode: referralCode ?? '',
    sourceOfFunds: (otherFunds?.length ? [...funds.split(', '), 'Others'] : funds.split(', ')).filter(
      (x: string) => x.length > 0
    ),
    isUSTaxPayer: usTin ? 1 : 0,
    otherFunds,
    address: address?.address,
    postalCode: address?.postalCode,
    country: { value: 0, label: address?.country },
    city: address?.city,
    proofOfAddress: documents?.filter(({ type }: any) => type === 'address'),
    proofOfIdentity: documents?.filter(({ type }: any) => type === 'identity'),
    selfie: documents?.filter(({ type }: any) => type === 'selfie'),
    evidenceOfAccreditation: documents?.filter(({ type }: any) => type === 'accreditation'),
    idType: { value: 0, label: IdentityDocumentType[idTypeKey] },
    citizenship: { value: 0, label: citizenship },
    employmentStatus: employmentStatus ? { value: 0, label: employmentStatus } : undefined,
    gender: { value: 0, label: gender },
    occupation: occupation ? { value: 0, label: occupation } : undefined,
    secondaryContactDetails: { value: 0, label: secondaryContactDetails },
    nationality: { value: 0, label: nationality },
    income: income ? { value: 0, label: income } : undefined,
    removedDocuments: [],

    taxDeclarations: data.taxDeclarations.map((t: any) => ({ ...t, country: { label: t.country } })),

    investorDeclarationIsFilled: [
      data.investorDeclaration?.isTotalAssets,
      data.investorDeclaration?.isAnnualIncome,
      data.investorDeclaration?.isFinancialAssets,
      data.investorDeclaration?.isJointIncome,
    ].some((x) => !!x),

    isTotalAssets: data.investorDeclaration?.isTotalAssets,
    isAnnualIncome: data.investorDeclaration?.isAnnualIncome,
    isFinancialAssets: data.investorDeclaration?.isFinancialAssets,
    isJointIncome: data.investorDeclaration?.isJointIncome,

    acceptOfQualification: data.investorDeclaration?.acceptOfQualification,
    acceptRefusalRight: data.investorDeclaration?.acceptRefusalRight,
  }
}

export const individualTransformKycDto = (values: any, referralCode?: any) => {
  const {
    dateOfBirth,
    sourceOfFunds,
    otherFunds,
    citizenship,
    nationality,
    country,
    employmentStatus,
    gender,
    income,
    isUSTaxPayer,
    occupation,
    secondaryContactDetails,
    idIssueDate,
    idExpiryDate,
    idType,
    taxDeclarations,
  } = values

  const isLabel = sourceOfFunds.some((x: any) => x.label)
  const emptyInvestorDeclaration = {
    status: null,
    confirmStatusDeclaration: false,
  }

  const result = {
    ...values,

    gender: gender?.label,
    dateOfBirth: typeof dateOfBirth === 'string' ? dateOfBirth : dateOfBirth?.format('MM/DD/YYYY'),

    nationality: nationality?.label,
    citizenship: citizenship?.label,

    declarationAcknowledgement: 'offers-acknowledgement',
    referralCode: referralCode ?? '',

    idType: idType?.label?.toUpperCase(),
    idIssueDate: typeof idIssueDate === 'string' ? idIssueDate : idIssueDate?.format('MM/DD/YYYY'),
    idExpiryDate: typeof idExpiryDate === 'string' ? idExpiryDate : idExpiryDate?.format('MM/DD/YYYY'),

    sourceOfFunds: [
      ...sourceOfFunds.map((x: any) => (isLabel ? x.label : x)),
      ...(sourceOfFunds.some((x: any) => (isLabel ? x.label === 'Others' : x === 'Others')) ? [otherFunds] : []),
    ].join(', '),

    secondaryContactDetails: secondaryContactDetails?.label,
    occupation: occupation?.label,
    employmentStatus: employmentStatus?.label,
    income: income?.label,

    ...(!isUSTaxPayer && { usTin: '' }),
    country: country?.label,
    isUSTaxPayer: isUSTaxPayer ? true : false,

    investorDeclaration: values?.accredited
      ? {
        ...values.investorDeclaration,

        isTotalAssets: values.isTotalAssets,
        isAnnualIncome: values.isAnnualIncome,
        isFinancialAssets: values.isFinancialAssets,
        isJointIncome: values.isJointIncome,

        acceptOfQualification: values?.acceptOfQualification,
        acceptRefusalRight: values?.acceptRefusalRight,
      }
      : emptyInvestorDeclaration,

    taxDeclarations: taxDeclarations?.map((t: any, idx: number) => ({
      ...t,
      country: t?.country?.label,
      isAdditional: t?.isAdditional === true ? 'true' : 'false',
    })),

    removedTaxDeclarations: values.removedTaxDeclarations,
  }

  for (const tax of result.taxDeclarations) {
    if (tax.reason === null) {
      delete tax.reason
    }
  }

  for (const entry of filterFields) {
    delete result[entry]
  }

  return Object.entries(result)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, any>)
}
