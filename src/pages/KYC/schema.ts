import * as yup from 'yup'
import { IdentityDocumentType } from './enum'

interface TaxDeclaration {
  isAdditional: boolean
  country?: {
    value: string
  } | null
  idNumber: string | null
  reason: string | null
}

export const FinancialRequiredCoutries = ['Russian Federation', 'Nigeria', 'Turkey']
export const individualErrorsSchemaV2 = yup.object().shape({
  firstName: yup
    .string()
    .nullable()
    .matches(/^[A-Za-z\s]+$/, 'First name must be alphabetic')
    .min(2, 'Minimum length: 2 characters')
    .max(50, 'Maximum length: Must be less than 50 characters')
    .required('Required'),
  middleName: yup.string().nullable().max(50, 'Too Long!'),
  lastName: yup
    .string()
    .nullable()
    .matches(/^[A-Za-z\s]+$/, 'Last name must be alphabetic')
    .min(2, 'Minimum length: 2 characters')
    .max(50, 'Maximum length: Must be less than 50 characters')
    .required('Required'),
  email: yup.string().nullable().email('Invalid email').required('Required'),
})
export const businessEmailSchema = yup.object().shape({
  businessEmail: yup.string().email('Invalid email').required('Required'),
})

export const individualErrorsSchema = yup.object().shape({
  firstName: yup.string().min(1, 'Too short').max(50, 'Too Long!').required('Required'),
  middleName: yup.string().max(50, 'Too Long!'),
  lastName: yup.string().min(1, 'Too short').max(50, 'Too Long!').required('Required'),

  dateOfBirth: yup.mixed().nullable().required('Required'),
  // gender: yup.object().nullable().required('Required'),

  nationality: yup
    .object()
    .nullable()
    .required('Required')
    .test('nonZeroValue', 'Value must not be 0', (value: any) => {
      return value && value.label !== null
    }),
  citizenship: yup
    .object()
    .nullable()
    .required('Required')
    .test('nonZeroValue', 'Value must not be 0', (value: any) => {
      return value && value.label !== null
    }),
  email: yup.string().email('Invalid email').required('Required'),
  phoneNumber: yup
    .string()
    .nullable()
    .required('Required')
    .min(10, 'Must be valid phone number')
    .max(15, 'Must be valid phone number'),

  address: yup.string().required('Required'),
  postalCode: yup.string().required('Required'),
  country: yup
    .object()
    .nullable()
    .required('Required')
    .test('nonZeroValue', 'Value must not be 0', (value: any) => {
      return value && value.label !== undefined && value.label !== null
    }),

  city: yup.string().required('Required'),

  idType: yup
    .object()
    .nullable()
    .required('Required')
    .test('nonZeroValue', 'Value must not be 0', (value: any) => {
      return value && value.label !== undefined
    }),
  idNumber: yup.string().min(1, 'Too short').max(50, 'Too Long!').required('Required'),
  // idIssueDate: yup.mixed().nullable().required('Required'),
  idExpiryDate: yup
    .mixed()
    .nullable()
    .when('idType', {
      is: (idType: any) => {
        return idType?.label !== IdentityDocumentType.NATIONAL_ID && idType?.label
      },
      then: yup.mixed().nullable().required('Required'),
    }),

  idIssueDate: yup
    .mixed()
    .nullable()
    .when('idType', {
      is: (idType: any) => {
        return idType?.label !== IdentityDocumentType.NATIONAL_ID && idType?.label
      },
      then: yup.mixed().nullable().required('Required'),
    }),

  proofOfIdentity: yup.array().min(1, 'Required').nullable(),

  secondaryContactDetails: yup
    .object()
    .nullable()
    .required('Required')
    .test('nonZeroValue', 'Value must not be 0', (value: any) => {
      // Assuming that value is an object with a 'value' property
      return value && value.label !== null
    }),

  proofOfAddress: yup.array().when('secondaryContactDetails', {
    is: (value: any) => value && value.value === 1,
    then: yup.array().min(1, 'Required').nullable(),
  }),

  alternateEmail: yup
    .string()
    .nullable()
    .when('secondaryContactDetails', {
      is: (value: any) => value && value.value === 2,
      then: yup.string().nullable().email('Invalid email').required('Required'),
    })
    .test('dupplicatedEmail', ' ', (value, context) => value?.toLowerCase() !== context.parent.email?.toLowerCase()),

  socialPlatform: yup
    .string()
    .nullable()
    .when('secondaryContactDetails', {
      is: (value: any) => value && value.value === 3,
      then: yup.string().nullable().required('Required'),
    }),

  handleName: yup
    .string()
    .nullable()
    .when('secondaryContactDetails', {
      is: (value: any) => value && value.value === 3,
      then: yup.string().nullable().required('Required'),
    }),
  // proofOfAddress: yup.array().min(1, 'Required').nullable(),
  // alternateEmail: yup.string().email('Invalid email').required('Required'),
  // socialPlatform: yup.string().required('Required'),
  // handleName: yup.string().required('Required'),

  selfie: yup.array().min(1, 'Required').nullable(),
  occupation: yup
    .object()
    .nullable()
    .when(['nationality', 'country', 'citizenship'], {
      is: (nationality: any, country: any, citizenship: any) =>
        (nationality && FinancialRequiredCoutries.includes(nationality.label)) ||
        (country && FinancialRequiredCoutries.includes(country.label)) ||
        (citizenship && FinancialRequiredCoutries.includes(citizenship.label)),
      then: yup.object().nullable().required('Required'),
    }),
  employmentStatus: yup
    .object()
    .nullable()
    .when(['nationality', 'country', 'citizenship'], {
      is: (nationality: any, country: any, citizenship: any) =>
        (nationality && FinancialRequiredCoutries.includes(nationality.label)) ||
        (country && FinancialRequiredCoutries.includes(country.label)) ||
        (citizenship && FinancialRequiredCoutries.includes(citizenship.label)),
      then: yup.object().nullable().required('Required'),
    }),
  employer: yup
    .string()
    .nullable()
    .when(['nationality', 'country', 'citizenship'], {
      is: (nationality: any, country: any, citizenship: any) =>
        (nationality && FinancialRequiredCoutries.includes(nationality.label)) ||
        (country && FinancialRequiredCoutries.includes(country.label)) ||
        (citizenship && FinancialRequiredCoutries.includes(citizenship.label)),
      then: yup.string().nullable().required('Required'),
    }),
  income: yup
    .object()
    .nullable()
    .when(['nationality', 'country', 'citizenship'], {
      is: (nationality: any, country: any, citizenship: any) =>
        (nationality && FinancialRequiredCoutries.includes(nationality.label)) ||
        (country && FinancialRequiredCoutries.includes(country.label)) ||
        (citizenship && FinancialRequiredCoutries.includes(citizenship.label)),
      then: yup.object().nullable().required('Required'),
    }),

  // investorDeclarationIsFilled: yup
  //   .boolean()
  //   .when('accredited', { is: 1, then: yup.boolean().equals([true], 'Required') }),

  isTotalAssets: yup.boolean(),
  isAnnualIncome: yup.boolean(),
  isFinancialAssets: yup.boolean(),
  isJointIncome: yup.boolean(),
  isAdditional: yup.bool(),
  taxDeclarations: yup
    .array()
    .of(
      yup.object().shape({
        isAdditional: yup.bool(),
        country: yup.object().nullable().required('Required'),
        idNumber: yup.string().when('isAdditional', {
          is: true,
          then: yup.string().nullable(),
          otherwise: yup.string().required('Required'),
        }),
        reason: yup.string().when('isAdditional', {
          is: true,
          then: yup.string().required('Required'),
          otherwise: yup.string().nullable(),
        }),
      })
    )
    .min(1, 'Add at least 1 tax declaration')
    .required('Required'),

  // taxDeclarations: yup
  // .array()
  // .of(
  //   yup.object().shape({
  //     isAdditional: yup.bool(),
  //     country: yup
  //       .object()
  //       .nullable()
  //       .required('Required')
  //       .test('nonZeroValue', 'Required', (value: any) => {
  //         return value && value.value !== undefined;
  //       }),
  //     idNumber: yup.string().when('isAdditional', {
  //       is: true,
  //       then: yup.string().nullable(),
  //       otherwise: yup.string().required('Required'),
  //     }),
  //     reason: yup.string().when('isAdditional', {
  //       is: true,
  //       then: yup.string().required('Required'),
  //       otherwise: yup.string().nullable(),
  //     }),
  //   })
  // )
  // .min(1, 'Add at least 1 tax declaration')
  // .required('Required'),

  taxIdentification: yup
    .string()
    .when('taxCountry', { is: (country: any) => !!country, then: yup.string().required('Required') }),
  taxIdentificationReason: yup.string().when('taxisAdditional', { is: true, then: yup.string().required('Required') }),

  sourceOfFunds: yup.array().when(['nationality', 'country', 'citizenship'], {
    is: (nationality: any, country: any, citizenship: any) =>
      (nationality && FinancialRequiredCoutries.includes(nationality.label)) ||
      (country && FinancialRequiredCoutries.includes(country.label)) ||
      (citizenship && FinancialRequiredCoutries.includes(citizenship.label)),
    then: yup.array().nullable().min(1, ' ').required('Required'),
  }),
  otherFunds: yup.string().when('sourceOfFunds', {
    is: (sourceOfFunds: string[]) => sourceOfFunds.includes('Others'),
    then: yup.string().required('Required'),
    otherwise: yup.string().nullable(),
  }),

  isUSTaxPayer: yup.number().min(0).max(1),
  usTin: yup
    .string()
    .nullable()
    .when('isUSTaxPayer', {
      is: 1,
      then: yup.string().required('Required'),
      otherwise: yup.string().nullable(),
    }),

  // accredited: yup.number().min(0).max(1),
  // acceptOfQualification: yup.boolean().when('accredited', { is: 1, then: yup.boolean().equals([true], 'Required') }),
  // acceptRefusalRight: yup.boolean().when('accredited', { is: 1, then: yup.boolean().equals([true], 'Required') }),
  // evidenceOfAccreditation: yup.array().when('accredited', {
  //   is: 1,
  //   then: yup.array().min(1, 'Required').nullable().required('Evidence of Accreditation is required'),
  //   otherwise: yup.array().nullable(),
  // }),
  // confirmStatusDeclaration: yup.boolean().when('accredited', {
  //   is: 1,
  //   then: yup.boolean().isTrue('Required').required('Required'),
  //   otherwise: yup.boolean().nullable(),
  // }),
})

export const corporateErrorsSchema = yup.object().shape({
  corporateName: yup.string().min(1, 'Too short').max(50, 'Too Long!').required('Required'),
  typeOfLegalEntity: yup
    .object()
    .nullable()
    .required('Required')
    .test('validSelection', 'Required', (value: any) => {
      return value && value.label !== null && value.label !== undefined && value.label !== ''
    }),
  countryOfIncorporation: yup
    .object()
    .nullable()
    .required('Required')
    .test('validSelection', 'Required', (value: any) => {
      return value && value.label !== null && value.label !== undefined && value.label !== ''
    }),
  businessActivity: yup.string().nullable().required('Required'),

  registrationNumber: yup.string().nullable().required('Required'),
  inFatfJurisdiction: yup
    .mixed()
    .required('Choose one')
    .test('validChoice', 'Choose one', (value: any) => {
      return value === true || value === false
    }),

  personnelName: yup.string().required('Required'),
  designation: yup.string().nullable().required('Required'),
  email: yup.string().email('Invalid email').required('Required'),
  phoneNumber: yup
    .string()
    .nullable()
    .min(10, 'Must be valid phone number')
    .max(15, 'Must be valid phone number')
    .required('Required'),
  authorizationDocuments: yup.array().min(1, 'Required').nullable(),
  authorizationIdentity: yup.array().min(1, 'Required').nullable(),
  address: yup.string().required('Required'),
  postalCode: yup.string().required('Required'),
  country: yup
    .object()
    .nullable()
    .required('Required')
    .test('validSelection', 'Required', (value: any) => {
      return value && value.label !== null && value.label !== undefined && value.label !== ''
    }),
  city: yup.string().required('Required'),
  residentialAddressAddress: yup.string().required('Required'),
  residentialAddressPostalCode: yup.string().required('Required'),
  residentialAddressCountry: yup
    .object()
    .nullable()
    .required('Required')
    .test('validSelection', 'Required', (value: any) => {
      return value && value.label !== null && value.label !== undefined && value.label !== ''
    }),
  residentialAddressCity: yup.string().required('Required'),
  sourceOfFunds: yup
    .array()
    .required('Choose one')
    .test('hasSelection', 'Choose one', (value: any) => {
      const validSelections = value && Array.isArray(value) ? value.filter((item) => item && item.trim() !== '') : []

      const result = validSelections.length > 0
      return result
    }),
  otherFunds: yup.string().when('sourceOfFunds', {
    is: (sourceOfFunds: string[]) => sourceOfFunds.includes('Others'),
    then: yup.string().required('Required'),
    otherwise: yup.string().nullable(),
  }),
  // accredited: yup.number().min(0).max(1),
  isUSTaxPayer: yup
    .number()
    .required('Choose one')
    .test('validChoice', 'Choose one', (value: any) => {
      return value === 0 || value === 1
    }),
  usTin: yup
    .string()
    .nullable()
    .when('isUSTaxPayer', {
      is: 1,
      then: yup.string().required('Required'),
      otherwise: yup.string().nullable(),
    }),
  taxCountry: yup
    .object()
    .nullable()
    .required('Required')
    .test('validSelection', 'Required', (value: any) => {
      return value && value.label !== null && value.label !== undefined && value.label !== ''
    }),
  taxNumber: yup
    .string()
    .nullable()
    .when('taxIdAvailable', {
      is: true,
      then: yup.string().required('Required'),
      otherwise: yup.string().nullable(),
    }),
  reason: yup
    .string()
    .nullable()
    .when('taxIdAvailable', {
      is: false,
      then: yup.string().nullable().required('Required'),
      otherwise: yup.string().nullable(),
    }),

  beneficialOwners: yup
    .array()
    .of(
      yup.object().shape({
        fullName: yup.string().required('Required'),
        nationality: yup.string().required('Required'),
        dateOfBirth: yup
          .mixed()
          .nullable()
          .required('Required')
          .test('validDate', 'Required', (value: any) => {
            return value && value !== '' && value !== null && value !== undefined
          }),
        address: yup.string().required('Required'),
        shareholding: yup
          .number()
          .transform((value, originalValue) => {
            // Handle empty string case
            if (originalValue === '' || originalValue === null || originalValue === undefined) {
              return undefined // This will trigger required validation
            }
            return value
          })
          .min(1, 'Min 1')
          .max(100, 'Total sum of shareholding must be max 100')
          .required('Required'),
        proofOfIdentity: yup.mixed().nullable().required('Required'),
      })
    )
    .min(1, 'At least one beneficial owner')
    .required('Required')
    .test('isShareholdingAmountValid', (value = []) => {
      const sum = value.reduce((acc, next) => acc + Number(next.shareholding || 0), 0)
      if (sum > 100) {
        return false
      }
      return true
    }),
  corporateMembers: yup
    .array()
    .of(
      yup.object().shape({
        fullName: yup.string().required('Required'),
        nationality: yup.string().required('Required'),
        designation: yup.string().required('Required'),
        proofOfIdentity: yup.mixed().nullable().required('Required'),
      })
    )
    .min(1, 'At least one corporate member')
    .required('Required'),
  corporateDocuments: yup.array().min(1, 'Required').nullable(),
  financialDocuments: yup.array().min(1, 'Required').nullable(),
})
