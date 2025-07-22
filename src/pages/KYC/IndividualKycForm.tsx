import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { FieldArray, Formik } from 'formik'
import { Prompt, useHistory } from 'react-router-dom'
import moment from 'moment'
import dayjs from 'dayjs'
import { isMobile } from 'react-device-detect'
import { useCookies } from 'react-cookie'

import usePrevious from 'hooks/usePrevious'
import Column from 'components/Column'
import { ButtonGradientBorder, ButtonIXSGradient, ButtonText, PinnedContentButton } from 'components/Button'
import { LinkStyledButton, TYPE } from 'theme'
import { ReactComponent as TrashIcon } from 'assets/images/newDelete.svg'
import { GradientText } from 'pages/CustodianV2/styleds'
import { StyledBodyWrapper } from 'pages/SecurityTokens'
import Row, { RowBetween, RowCenter, RowStart } from 'components/Row'
import { PhoneInput } from 'components/PhoneInput'
import { DateInput } from 'components/DateInput'
import { Checkbox } from 'components/Checkbox'
import { getIndividualProgress, useCreateIndividualKYC, useKYCState, useUpdateIndividualKYC } from 'state/kyc/hooks'

import { useActiveWeb3React } from 'hooks/web3'
import { useAuthState } from 'state/auth/hooks'
import { Loadable } from 'components/LoaderHover'
import { LoadingIndicator } from 'components/LoadingIndicator'
import { MAX_FILE_UPLOAD_SIZE, MAX_FILE_UPLOAD_SIZE_ERROR } from 'constants/constants'
import { countriesList } from 'constants/countriesList'
import { ReactComponent as ArrowLeft } from 'assets/images/newBack.svg'
import { useAddPopup, useShowError } from 'state/application/hooks'

import { KycSelect as Select, KycTextInput as TextInput, SelfieUploader } from './common'
import { KYCProgressBar } from './KYCProgressBar'
import {
  empleymentStatuses,
  individualFormInitialValues,
  genders,
  incomes,
  sourceOfFunds,
  promptValue,
  occupationList,
  // SecondaryContactDetails,
  // socialMediaPlatform,
} from './mock'
import {
  FormCard,
  FormGrid,
  ExtraInfoCard,
  FormWrapper,
  StyledStickyBox,
  StyledBigPassed,
  ExtraInfoCardCountry,
} from './styleds'
import { FinancialRequiredCoutries, individualErrorsSchema } from './schema'
import { individualTransformApiData, individualTransformKycDto } from './utils'
import { KYCStatuses, IdentityDocumentType } from './enum'
import { Box } from 'rebass'
import Modal from 'components/Modal'
import { IconButton } from '@material-ui/core'
import { HrLine } from 'pages/CreateNFT/styleds'
import { Plus } from 'react-feather'
import { ReactComponent as InvalidFormInputIcon } from 'assets/svg/invalid-form-input-icon.svg'
import { KYCValidationErrors } from './KYCValidationErrors'
import { error } from 'console'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import { Uploader } from 'components/Uploader'
import useQuery from 'hooks/useQuery'

type FormSubmitHanderArgs = {
  createFn: (body: any) => any
  updateFn: (id: number, body: any) => any
  validate: boolean
}

const SecondaryContactDetails = [
  { value: 1, label: 'Proof of Address Document' },
  { value: 2, label: 'Business Email Address' },
  { value: 3, label: 'Social Media Handle' },
  // Add more items as needed
]

const socialMediaPlatform = [
  { value: 'Telegram', label: 'Telegram' },
  { value: 'Discord', label: 'Discord' },
  { value: 'X.com', label: 'X.com' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  // Add more items as needed
]

export const FormRow = styled(Row)`
  align-items: flex-start;
  gap: 35px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
  `};
`

export const FormContainer = styled(FormWrapper)`
  flex-grow: 1;
`

export default function IndividualKycForm() {
  const { config } = useWhitelabelState()
  const canLeavePage = useRef(false)
  const [cookies] = useCookies(['annoucementsSeen'])
  const [waitingForInitialValues, setWaitingForInitialValues] = useState(true)
  const [updateKycId, setUpdateKycId] = useState<any>(null)
  const [formData, setFormData] = useState<any>(null)
  const [canSubmit, setCanSubmit] = useState(true)
  const [isSubmittedOnce, setIsSubmittedOnce] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [hasInitialized, setHasInitialized] = useState(false)
  const addPopup = useAddPopup()
  const history = useHistory()
  const createIndividualKYC = useCreateIndividualKYC()
  const showError = useShowError()
  const updateIndividualKYC = useUpdateIndividualKYC()
  const { kyc, loadingRequest } = useKYCState()
  const { account } = useActiveWeb3React()
  const { token } = useAuthState()
  const query = useQuery()

  const [showTaxModal, setShowTaxModal] = useState(false)
  const [showFATCAModal, setShowFATCAModal] = useState(false)
  const [showSafeguardModal, setShowSafeguardModal] = useState(false)
  const [showOptoutModal, setShowOptoutModal] = useState(false)
  const [showOptoutConfirmationModal, setShowOptoutConfirmationModal] = useState(false)
  const [idExpiryDateLabel, setIdExpiryDateLabel] = useState('ID Expiration Date')
  const [idIssuanceLabel, setIdIssuanceLabel] = useState('ID Issuance Date')
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const openConfirmationModal = useCallback(() => {
    setShowOptoutModal(false)
    setShowOptoutConfirmationModal(true)
  }, [])

  const [nationalityState, setNationalityState] = useState('')
  const [countryState, setCountryState] = useState('')
  const [citizenshipState, setCitizenshipState] = useState('')
  const [requiredFinancial, setRequiredFinancial] = useState(false)
  const [financialFilledState, setFinancialFilled] = useState(false)

  const confirmOptOut = useCallback((setFieldValue: any) => {
    setShowOptoutConfirmationModal(false)
    setFieldValue('accredited', 0, false)
  }, [])

  const form = useRef<any>(null)

  const isLoggedIn = !!token && !!account

  const prevAccount = usePrevious(account)

  useEffect(() => {
    const code = query.get('referralCode')
    const storedReferralCode = localStorage.getItem('referralCode')
    if (code) {
      setReferralCode(code)
      localStorage.setItem('referralCode', code)
    } else if (storedReferralCode) {
      setReferralCode(storedReferralCode)
    }

    if (account && prevAccount && account !== prevAccount) {
      history.push('/kyc')
    }
  }, [account, prevAccount, history])

  useEffect(() => {
    setWaitingForInitialValues(true)

    const getProgress = async () => {
      const data = await getIndividualProgress()
      if (data) {
        const transformedData = individualTransformApiData(data, new URL(window.location.href).href?.split('=')[1])
        const taxDeclarations =
          transformedData.taxDeclarations?.length === 0
            ? [{ country: null, idNumber: '' }]
            : transformedData.taxDeclarations

        const formData = { ...transformedData, taxDeclarations }

        setFormData(formData)
        setHasInitialized(true)
        // Remove direct form value setting since we're using formData as initial values

        if (kyc?.status === KYCStatuses.DRAFT) {
          setCanSubmit(true)
        }

        if (
          FinancialRequiredCoutries.includes(formData?.nationality?.label) ||
          FinancialRequiredCoutries.includes(formData?.country?.label) ||
          FinancialRequiredCoutries.includes(formData?.citizenship?.label)
        ) {
          setRequiredFinancial(true)
        } else {
          setRequiredFinancial(false)
        }
      }
    }

    // Only initialize once when the component mounts and has KYC data
    if (!hasInitialized && kyc && [KYCStatuses.CHANGES_REQUESTED, KYCStatuses.DRAFT].includes(kyc.status)) {
      getProgress()
      setUpdateKycId(kyc.id)
    } else if (!hasInitialized) {
      setFormData(individualFormInitialValues)
    }

    setWaitingForInitialValues(false)
  }, [kyc, hasInitialized])

  useEffect(() => {
    window.addEventListener('beforeunload', alertUser)
    const IsNewKyc = localStorage.getItem('newKyc')
    if (IsNewKyc) {
      addPopup({ info: { success: true, summary: 'The email address has been verified successfully' } })
      localStorage.removeItem('newKyc') // Remove the item so it doesn't trigger again
    }

    return () => {
      window.removeEventListener('beforeunload', alertUser)
    }
  }, [])

  useEffect(() => {
    if (
      FinancialRequiredCoutries.includes(nationalityState) ||
      FinancialRequiredCoutries.includes(countryState) ||
      FinancialRequiredCoutries.includes(citizenshipState)
    ) {
      setRequiredFinancial(true)
    } else {
      setRequiredFinancial(false)
    }
  }, [nationalityState, countryState, citizenshipState])

  const alertUser = (e: any) => {
    e.preventDefault()
    e.returnValue = ''
  }

  const validateValue = async (key: string, value: any) => {
    if (form.current.values[key] === value) {
      return
    }

    try {
      let root = { [key]: value }

      if (key.startsWith('taxDeclarations[')) {
        const match = /taxDeclarations\[([0-9]+)\]\.(\w+)/.exec(key)
        if (!match) return
        const index = match[1]
        const field = match[2]

        const declaration = { ...form.current.values.taxDeclarations[index], [field]: value }

        root = form.current.values

        root.taxDeclarations[index] = declaration
      }

      await individualErrorsSchema.validateAt(key, root)

      const errorCopy = { ...errors }

      delete errorCopy[key]

      setErrors(errorCopy)
      form.current.setErrors(errorCopy)
    } catch (err: any) {
      setErrors(Object.assign(errors, { [key]: err.message }))
      form.current.setFieldError(key, err.message)
    }

    form.current.setFieldTouched(key, true)
  }

  const validationSeen = (key: string) => {
    if (errors[key]) {
      const newErrors = { ...errors }
      delete newErrors[key]
      setErrors(newErrors)
    }

    setCanSubmit(true)
  }

  const onIsAdditionalChange = async (index: number, setFieldValue: any) => {
    const values = form.current.values
    console.log(values.taxDeclarations[index].isAdditional, 'kkkkk')
    if (!values.taxDeclarations[index].isAdditional) {
      setFieldValue(`taxDeclarations[${index}].idNumber`, '') // Clear TIN
      setFieldValue(`taxDeclarations[${index}].country`, null) // Clear country
    }

    const declaration = { ...values.taxDeclarations[index] }

    declaration.isAdditional = !values.taxDeclarations[index].isAdditional
    declaration.idNumber = ''
    declaration.country = ''
    declaration.reason = ''

    const root = { ...values }

    root.taxDeclarations[index] = declaration

    const fields = [
      `taxDeclarations[${index}].isAdditional`,
      `taxDeclarations[${index}].idNumber`,
      `taxDeclarations[${index}].reason`,
      `taxDeclarations[${index}].country`,
    ]

    const validationErrors: Record<string, string> = {}

    for (const field of fields) {
      try {
        await individualErrorsSchema.validateAt(field, root)
      } catch (err: any) {
        validationErrors[field] = err.message
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      const updatedErrors = Object.assign(errors, validationErrors)

      for (const field of fields) {
        if (updatedErrors[field] && !validationErrors[field]) {
          delete updatedErrors[field]
        }
      }

      setErrors(updatedErrors)
      form.current.setErrors(updatedErrors)
    } else {
      const prunedErrors = { ...errors }

      for (const field of fields) {
        delete prunedErrors[field]
      }

      setErrors(prunedErrors)
      form.current.setErrors(prunedErrors)
    }

    setFieldValue(`taxDeclarations[${index}].isAdditional`, declaration.isAdditional, false)
    setFieldValue(`taxDeclarations[${index}].idNumber`, declaration.idNumber, false)
    setFieldValue(`taxDeclarations[${index}].reason`, declaration.reason, false)
    setFieldValue(`taxDeclarations[${index}].country`, declaration.country, false)
  }

  const onChangeInput = (key: string, value: any, values: any, setFieldValue: any) => {
    if (values[key] !== value) {
      setFieldValue(key, value, false)
    }

    validateValue(key, value)
    validationSeen(key)
  }

  const onSelectChange = (key: string, value: any, setFieldValue: any) => {
    setFieldValue(key, value, false)
    validateValue(key, value)
    validationSeen(key)

    if (key === 'nationality') setNationalityState(value?.label)
    if (key === 'country') setCountryState(value?.label)
    if (key === 'citizenship') setCitizenshipState(value?.label)
  }

  const onSelectChangeNew = (key: string, value: any, setFieldValue: any) => {
    const formattedValue = value.label
    setFieldValue(key, formattedValue, false)
    validateValue(key, value)
    validationSeen(key)
  }

  const onRadioChange = (key: string, value: any, setFieldValue: any) => {
    setFieldValue(key, value, false)
    validateValue(key, value)
    validationSeen(key)
  }

  const onAccreditedChange = (value: number, setFieldValue: any) => {
    setFieldValue('accredited', value, false)
    validationSeen('accredited')

    if (value === 0) {
      const keys = [
        'investorDeclarationStatus',
        'acceptOfQualification',
        'acceptRefusalRight',
        'confirmStatusDeclaration',
        'evidenceOfAccreditation',
      ]

      setFieldValue('investorDeclarationIsFilled', individualFormInitialValues.investorDeclarationIsFilled)
      setFieldValue('acceptOfQualification', individualFormInitialValues.acceptOfQualification)
      setFieldValue('acceptRefusalRight', individualFormInitialValues.acceptRefusalRight)
      setFieldValue('confirmStatusDeclaration', individualFormInitialValues.confirmStatusDeclaration)
      setFieldValue('evidenceOfAccreditation', individualFormInitialValues.evidenceOfAccreditation)

      const newErrors = { ...errors }

      for (const key of keys) {
        delete newErrors[key]
      }

      setErrors(newErrors)
      setCanSubmit(true)
    }
  }

  const onInvestorDeclarationChange = (field: string, value: boolean, values: any, setFieldValue: any) => {
    onChangeInput(field, value, values, setFieldValue)

    const relevantField = ['isTotalAssets', 'isAnnualIncome', 'isFinancialAssets', 'isJointIncome']

    const atLeastOneFieldIsFilled = relevantField.some((f) => (f === field ? value : values[f]))

    // Check whether any of investor declaration fields are checked
    setFieldValue('investorDeclarationIsFilled', atLeastOneFieldIsFilled, false)

    validateValue('investorDeclarationIsFilled', value)
    validationSeen('investorDeclarationIsFilled')
  }

  const onSourceOfFundsChange = (source: { value: string; label: string }[], fields: any[], setFieldValue: any) => {
    const oldSources = new Set(fields.map((x) => x.value))
    const newSources = new Set(source.map((x) => x.value))

    const addedSources = new Set(source.filter((x) => !oldSources.has(x.value)).map((x) => x.value))
    const removedSources = new Set(fields.filter((x) => !newSources.has(x.value)).map((x) => x.value))

    const result = fields
      .filter((x) => !removedSources.has(x.value))
      .concat(source.filter((x) => addedSources.has(x.value)))

    if (result.length > 1 && result.some((x) => x.label === 'Others')) {
      result.push(
        result
          .splice(
            result.findIndex((x) => x.label === 'Others'),
            1
          )
          .pop()
      )
    }

    setFieldValue('sourceOfFunds', result, false)

    validateValue('sourceOfFunds', result)
    // validateValue('otherFunds', value)

    validationSeen('sourceOfFunds')
    validationSeen('otherFunds')
  }

  const removeTaxDeclaration = (values: any, index: number, setFieldValues: any, callback: (idx: number) => void) => {
    if (values.taxDeclarations[index]?.id) {
      setFieldValues('removedTaxDeclarations', [
        ...(values.removedTaxDeclarations ?? []),
        values.taxDeclarations[index]?.id,
      ])
    }

    callback(index)
  }

  const goBack = (e?: any) => {
    if (e) e.preventDefault()
    history.push('/kyc')
  }

  const handleDropImage = (acceptedFile: any, values: any, key: string, setFieldValue: any) => {
    const file = acceptedFile
    if (file?.size > MAX_FILE_UPLOAD_SIZE) {
      showError(MAX_FILE_UPLOAD_SIZE_ERROR)
    } else {
      const arrayOfFiles = [...(values[key] ?? [])]
      arrayOfFiles.push(file)

      setFieldValue(key, arrayOfFiles, false)
      validateValue(key, arrayOfFiles)
      validationSeen(key)
    }
  }

  const handleImageDelete =
    (values: any, key: string, removedDocuments: any[], setFieldValue: any) => (index: number) => {
      const arrayOfFiles = [...values[key]]

      if (arrayOfFiles[index]?.id) {
        setFieldValue('removedDocuments', [...removedDocuments, arrayOfFiles[index].id])
      }

      arrayOfFiles.splice(index, 1)

      setFieldValue(key, arrayOfFiles, false)
      validateValue(key, arrayOfFiles)
      validationSeen(key)
    }

  const countries = useMemo(() => {
    return countriesList
      ?.map((name, index) => ({ value: ++index, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const idTypes = useMemo(() => {
    return Object.values(IdentityDocumentType)?.map((value, index) => ({ value: ++index, label: value }))
  }, [])

  const formSubmitHandler = useCallback(
    async (values: any, { createFn, updateFn, validate = true }: FormSubmitHanderArgs) => {
      localStorage.removeItem('newKyc')
      try {
        if (validate) {
          await individualErrorsSchema.validate(values, { abortEarly: false })
        }

        canLeavePage.current = true
        setCanSubmit(false)
        const body = individualTransformKycDto(values, referralCode)
        let data: any = null

        if (updateKycId) {
          data = await updateFn(updateKycId, body)
        } else {
          data = await createFn(body)
        }

        if (data?.id) {
          history.push('/kyc')
          addPopup({ info: { success: true, summary: 'KYC was successfully saved' } })
        } else {
          setCanSubmit(true)
          addPopup({ info: { success: false, summary: 'Something went wrong' } })
        }
      } catch (error: any) {
        const newErrors: any = {}

        error.inner.forEach((e: any) => {
          newErrors[e.path] = e.message
        })

        addPopup({ info: { success: false, summary: 'Please, fill the valid data' } })

        setIsSubmittedOnce(true)
        setErrors(newErrors)
        setCanSubmit(false)

        canLeavePage.current = false
      }
    },
    []
  )

  const onSecondaryContactDetailsChange = (item: { value: number | null }) => {
    setSelectedOption(item?.value)
  }

  const saveProgress = useCallback(
    async (values: any) => {
      localStorage.removeItem('newKyc')
      await formSubmitHandler(values, {
        createFn: (body) => createIndividualKYC(body, true),
        updateFn: (id, body) => updateIndividualKYC(id, body, true),
        validate: false,
      })
    },
    [formSubmitHandler]
  )

  return (
    <Loadable loading={!isLoggedIn}>
      <Prompt when={!canLeavePage.current} message={promptValue} />
      <LoadingIndicator isLoading={loadingRequest} />
      <StyledBodyWrapper style={{ background: 'none', boxShadow: 'none' }} hasAnnouncement={!cookies.annoucementsSeen}>
        {!waitingForInitialValues && formData && (
          <Formik
            innerRef={form}
            initialValues={formData || individualFormInitialValues}
            initialErrors={errors}
            validateOnBlur={false}
            validateOnChange={false}
            validateOnMount={false}
            isInitialValid={false}
            enableReinitialize
            onSubmit={async (values) => {
              try {
                localStorage.removeItem('newKyc')
                await individualErrorsSchema.validate(values, { abortEarly: false })
                canLeavePage.current = true

                setCanSubmit(false)

                const body = individualTransformKycDto(values, referralCode)
                const data = updateKycId
                  ? await updateIndividualKYC(updateKycId, body)
                  : await createIndividualKYC(body)

                if (data?.id) {
                  history.push('/kyc')
                  addPopup({ info: { success: true, summary: 'KYC was successfully submitted' } })
                  localStorage.removeItem('referralCode')
                } else {
                  addPopup({ info: { success: false, summary: 'Something went wrong' } })
                  setCanSubmit(true)
                }
              } catch (error: any) {
                const newErrors: any = {}

                error.inner.forEach((e: any) => {
                  newErrors[e.path] = e.message
                })

                addPopup({ info: { success: false, summary: 'Please, fill the valid data' } })

                setIsSubmittedOnce(true)
                setErrors(newErrors)
                setCanSubmit(true)

                canLeavePage.current = false
              }
            }}
          >
            {({ values, handleSubmit, setFieldValue, dirty, initialValues }) => {
              if (values.accredited === -1) {
                onAccreditedChange(0, setFieldValue)
              }

              const hasNoErrors = (name: string) => !errors[name]
              const isFilled = (name: string): boolean =>
                values[name] !== null &&
                values[name] !== undefined &&
                values[name] !== initialValues[name] &&
                hasNoErrors(name)

              const shouldValidate = dirty

              const personalFilled =
                shouldValidate &&
                isFilled('firstName') &&
                hasNoErrors('middleName') &&
                isFilled('lastName') &&
                isFilled('dateOfBirth') &&
                // isFilled('gender') &&
                isFilled('nationality') &&
                isFilled('citizenship') &&
                isFilled('phoneNumber') &&
                isFilled('email') &&
                isFilled('secondaryContactDetails')

              const financialFilled =
                FinancialRequiredCoutries.includes(formData?.nationality?.label) ||
                FinancialRequiredCoutries.includes(formData?.country?.label) ||
                FinancialRequiredCoutries.includes(formData?.citizenship?.label)
                  ? shouldValidate &&
                    isFilled('occupation') &&
                    isFilled('employmentStatus') &&
                    isFilled('employer') &&
                    isFilled('income') &&
                    isFilled('sourceOfFunds')
                  : true

              setFinancialFilled(financialFilled)

              const statusDeclarationFilled = shouldValidate && isFilled('accredited')

              const identityDocumentFilled =
                shouldValidate && isFilled('idType') && isFilled('idNumber') && isFilled('idIssueDate')

              const addressFilled =
                shouldValidate &&
                isFilled('address') &&
                isFilled('postalCode') &&
                isFilled('country') &&
                isFilled('city')

              const fatcaFilled = shouldValidate && isFilled('usTin') && isFilled('isUSTaxPayer')
              const filesFilled =
                shouldValidate && isFilled('proofOfIdentity') && isFilled('proofOfAddress') && isFilled('selfie')

              const investorStatusAcknowledgementFilled = shouldValidate && isFilled('confirmStatusDeclaration')

              const personalPassed = personalFilled && addressFilled && filesFilled && identityDocumentFilled
              const personalFailed = !personalFilled || !addressFilled || !filesFilled

              const financialFailed = !financialFilled
              const statusDeclarationFailed = !statusDeclarationFilled
              return (
                <FormRow>
                  <FormContainer onSubmit={handleSubmit} style={{ gap: '35px' }}>
                    <Column style={{ gap: '35px' }}>
                      <FormCard style={{ marginTop: isMobile ? '90px' : '0px' }} id="personal">
                        <ButtonText
                          style={{ textDecoration: 'none' }}
                          display="flex"
                          marginBottom={isMobile ? '32px' : '30px'}
                          marginTop={isMobile ? '10px' : '10px'}
                          onClick={goBack}
                        >
                          <ArrowLeft style={{ width: isMobile ? 20 : 26 }} />
                          <TYPE.title4
                            fontWeight={'800'}
                            fontSize={isMobile ? 24 : 24}
                            style={{ whiteSpace: 'nowrap' }}
                            marginLeft="10px"
                          >
                            <Trans>KYC as Individual</Trans>
                          </TYPE.title4>
                        </ButtonText>
                        <RowStart marginBottom="32px">
                          <TYPE.title7>
                            <Trans>Personal Information</Trans>
                          </TYPE.title7>
                          {referralCode && (
                            <span
                              style={{
                                border: '1px solid #E6E6FF',
                                background: '#F7F7F8',
                                padding: '12px 16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                marginLeft: '20px',
                                fontWeight: '600',
                              }}
                            >
                              Referred by <span style={{ color: '#6666FF' }}>{referralCode}</span>
                            </span>
                          )}

                          {/* {personalPassed && <StyledBigPassed />}
                          {personalFailed && <InvalidFormInputIcon />} */}
                        </RowStart>
                        <Column style={{ gap: '20px' }}>
                          <FormGrid columns={3}>
                            <TextInput
                              id="firstNameInput"
                              label="First Name"
                              placeholder="First Name"
                              value={values.firstName}
                              error={errors.firstName}
                              onChange={(e: any) =>
                                onChangeInput('firstName', e.currentTarget.value, values, setFieldValue)
                              }
                            />
                            <TextInput
                              id="middleNameInput"
                              label="Middle Name"
                              placeholder="Middle Name"
                              value={values.middleName}
                              error={errors.middleName}
                              onChange={(e: any) =>
                                onChangeInput('middleName', e.currentTarget.value, values, setFieldValue)
                              }
                            />
                            <TextInput
                              id="lastNameInput"
                              label="Last Name"
                              placeholder="Last Name"
                              value={values.lastName}
                              error={errors.lastName}
                              onChange={(e: any) =>
                                onChangeInput('lastName', e.currentTarget.value, values, setFieldValue)
                              }
                            />
                          </FormGrid>

                          <FormGrid>
                            <DateInput
                              maxHeight={60}
                              error={errors.dateOfBirth}
                              value={values.dateOfBirth}
                              id="dateOfBirthButton"
                              placeholder="Date of Birth"
                              onChange={(value) => {
                                setFieldValue('dateOfBirth', dayjs(value).local().format('YYYY-MM-DD'), false)
                                validationSeen('dateOfBirth')
                              }}
                              maxDate={moment().subtract(18, 'years')}
                            />
                            <Select
                              error={errors.nationality}
                              withScroll
                              id="nationalityDropdown"
                              label="Nationality"
                              placeholder="Nationality"
                              selectedItem={values.nationality}
                              items={countries}
                              onSelect={(nationality) => onSelectChange('nationality', nationality, setFieldValue)}
                            />
                            {/* <Select
                              error={errors.gender}
                              id="genderDropdown"
                              label="Gender"
                              placeholder="Gender"
                              selectedItem={values.gender}
                              items={genders}
                              onSelect={(gender) => onSelectChange('gender', gender, setFieldValue)}
                            /> */}
                          </FormGrid>

                          <FormGrid>
                            <Select
                              error={errors.citizenship}
                              withScroll
                              id="citizenshipDropdown"
                              label="Citizenship"
                              placeholder="Citizenship"
                              selectedItem={values.citizenship}
                              items={countries}
                              onSelect={(citizenship) => onSelectChange('citizenship', citizenship, setFieldValue)}
                            />

                            <PhoneInput
                              error={errors.phoneNumber}
                              value={values.phoneNumber}
                              onChange={(value) => {
                                setFieldValue('phoneNumber', value, false)
                                validateValue('phoneNumber', value)
                                validationSeen('phoneNumber')
                              }}
                            />
                          </FormGrid>
                          {/* <FormGrid> */}
                          <TextInput
                            disabled={true}
                            style={{ background: '#F7F7FA' }}
                            placeholder="Email address"
                            id="emailAddressField"
                            label="Email address"
                            value={values.email}
                            error={errors.email}
                            onChange={(e: any) => onChangeInput('email', e.currentTarget.value, values, setFieldValue)}
                          />
                          {/* </FormGrid> */}
                        </Column>

                        <RowBetween marginBottom="32px" marginTop="64px">
                          <TYPE.title7>
                            <Trans>Address</Trans>
                          </TYPE.title7>
                          {/* {addressFilled && <StyledBigPassed />} */}
                        </RowBetween>

                        <Column style={{ gap: '20px' }}>
                          <FormGrid>
                            <TextInput
                              placeholder="Address"
                              label="Address"
                              id="addressField"
                              value={values.address}
                              error={errors.address}
                              onChange={(e: any) =>
                                onChangeInput('address', e.currentTarget.value, values, setFieldValue)
                              }
                            />
                            <TextInput
                              placeholder="Postal Code"
                              label="Postal Code"
                              id="postalCodeField"
                              value={values.postalCode}
                              error={errors.postalCode}
                              onChange={(e: any) =>
                                onChangeInput('postalCode', e.currentTarget.value, values, setFieldValue)
                              }
                            />
                          </FormGrid>

                          <FormGrid>
                            <Select
                              withScroll
                              label="Country"
                              placeholder="Country"
                              id="countryDropdown"
                              selectedItem={values.country}
                              items={countries.filter(
                                ({ label }) =>
                                  !['United States of America', 'United States Minor Outlying Islands'].includes(label)
                              )}
                              onSelect={(country) => onSelectChange('country', country, setFieldValue)}
                              error={errors.country}
                            />
                            <TextInput
                              label="City"
                              id="cityField"
                              placeholder="City"
                              value={values.city}
                              error={errors.city}
                              onChange={(e: any) => onChangeInput('city', e.currentTarget.value, values, setFieldValue)}
                            />
                          </FormGrid>
                        </Column>

                        {/* <input
                          value={referralCode || ''}
                          onChange={(e) => onChangeInput('referralCode', referralCode, values, setFieldValue)}
                          type="text"
                          id="hiddenField"
                          name="referralCode"
                        /> */}

                        {/* <input
                          value={values.referralCode}
                          onChange={(e) => onChangeInput('referralCode', e.currentTarget.value, values, setFieldValue)}
                          type="text"
                          id="hiddenField"
                          name="hiddenField"
                        ></input> */}

                        {/* <RowBetween marginBottom="32px" marginTop="64px">
                          <TYPE.title7>
                            <Trans>Referral</Trans>
                          </TYPE.title7>
                          {identityDocumentFilled && <StyledBigPassed />}
                        </RowBetween>

                        <TextInput
                          placeholder="Referral code"
                          label="Referral code"
                          value={values.referralCode}
                          onChange={(e) => onChangeInput('referralCode', e.currentTarget.value, values, setFieldValue)}
                        /> */}

                        <RowBetween marginBottom="32px" marginTop="64px">
                          <TYPE.title7>
                            <Trans>Identification</Trans>
                          </TYPE.title7>
                          {/* {identityDocumentFilled && <StyledBigPassed />} */}
                        </RowBetween>
                        <Column style={{ gap: '20px' }}>
                          <FormGrid>
                            <Select
                              placeholder="ID Type"
                              error={errors.idType}
                              withScroll
                              id="documentTypeDropdown"
                              label="ID Type"
                              selectedItem={values.idType}
                              items={idTypes}
                              onSelect={(idType) => {
                                onSelectChange('idType', idType, setFieldValue)
                                if (
                                  idType?.label === IdentityDocumentType.NATIONAL_ID
                                  // idType?.label === IdentityDocumentType.OTHERS
                                ) {
                                  setIdExpiryDateLabel('ID Expiration Date (Optional)')
                                  setIdIssuanceLabel('ID Issuance Date (Optional)')
                                } else {
                                  setIdExpiryDateLabel('ID Expiration Date')
                                  setIdIssuanceLabel('ID Issuance Date')
                                }
                              }}
                            />
                            <TextInput
                              onChange={(e: any) =>
                                onChangeInput('idNumber', e.currentTarget.value, values, setFieldValue)
                              }
                              value={values.idNumber}
                              id="documentNumberField"
                              label="ID Number"
                              placeholder="ID Number"
                              error={errors.idNumber}
                            />
                          </FormGrid>

                          <FormGrid>
                            <DateInput
                              label={idIssuanceLabel}
                              placeholder="ID Issuance Date"
                              id="documentIssueDateButton"
                              maxHeight={60}
                              error={errors.idIssueDate}
                              value={values.idIssueDate}
                              onChange={(value) => {
                                setFieldValue('idIssueDate', dayjs(value).local().format('YYYY-MM-DD'), false)
                                validationSeen('idIssueDate')
                              }}
                              maxDate={new Date()}
                            />
                            <DateInput
                              label={idExpiryDateLabel}
                              id="documentExpiryDateButton"
                              placeholder="ID Expiration Date"
                              maxHeight={60}
                              error={errors.idExpiryDate}
                              value={values.idExpiryDate}
                              onChange={(value) => {
                                setFieldValue('idExpiryDate', dayjs(value).local().format('YYYY-MM-DD'), false)
                                validationSeen('idExpiryDate')
                              }}
                              minDate={new Date()}
                            />
                          </FormGrid>
                        </Column>

                        <RowBetween marginBottom="10px" marginTop="64px">
                          <TYPE.title7>
                            <Trans>Upload Documents</Trans>
                          </TYPE.title7>
                          {/* {filesFilled && <StyledBigPassed />} */}
                        </RowBetween>

                        <TYPE.description3>
                          Please upload the following documents. All account statements and documents should be dated
                          within the last 3 months. Type of document format supported is PDF, JPG, and PNG.
                        </TYPE.description3>

                        <Column style={{ gap: '40px', marginTop: '32px' }}>
                          <Uploader
                            subtitle="Passport, National ID, or Driving License"
                            error={errors.proofOfIdentity}
                            title="Proof of Identity"
                            files={values.proofOfIdentity}
                            onDrop={(file: any) => {
                              handleDropImage(file, values, 'proofOfIdentity', setFieldValue)
                            }}
                            handleDeleteClick={handleImageDelete(
                              values,
                              'proofOfIdentity',
                              values.removedDocuments,
                              setFieldValue
                            )}
                          />

                          <SelfieUploader
                            title="Selfie with Proof of Identity"
                            subtitle="Selfie displaying your face, your Proof of Identity, and the present date written down on a piece of paper"
                            error={errors.selfie}
                            files={values.selfie}
                            onDrop={(file) => handleDropImage(file, values, 'selfie', setFieldValue)}
                            handleDeleteClick={handleImageDelete(
                              values,
                              'selfie',
                              values.removedDocuments,
                              setFieldValue
                            )}
                          />

                          <div>
                            <Select
                              error={errors.secondaryContactDetails}
                              subText="Please select one from the following options in the dropdown (Proof of Address Document, Business Email Address, or Social Media Handle)"
                              withScroll
                              label="Secondary Contact Details"
                              placeholder="Secondary Contact Details"
                              id="SecondaryContactDetailsDropDown"
                              selectedItem={values.secondaryContactDetails}
                              items={SecondaryContactDetails}
                              onSelect={(secondaryContactDetails) => {
                                onSelectChange('secondaryContactDetails', secondaryContactDetails, setFieldValue)
                                onSecondaryContactDetailsChange(secondaryContactDetails)
                              }}
                            />

                            <div style={{ marginTop: '20px' }}>
                              {(values?.secondaryContactDetails?.label === 'Social Media Handle' ||
                                selectedOption === 3) && (
                                <FormGrid>
                                  <Select
                                    subText="Please select one from the following Social Media Platform options in the dropdown (Telegram, Discord, Facebook, Instagram, LinkedIn, or X.com)"
                                    error={errors.socialPlatform}
                                    withScroll
                                    id="socialPlatform"
                                    label="Social Media Platform"
                                    placeholder="Social Media Platform"
                                    selectedItem={values.socialPlatform}
                                    items={socialMediaPlatform}
                                    onSelect={(socialMediaPlatform) =>
                                      onSelectChange('socialPlatform', socialMediaPlatform?.value, setFieldValue)
                                    }
                                  />

                                  <TextInput
                                    style={{ marginTop: '14px' }}
                                    subText="Please provide your Social Media Handle in the selected Social Media Platform as an alternative contact method"
                                    placeholder="Social Media Handle"
                                    id="handleName"
                                    label="Social Media Handle"
                                    value={values.handleName}
                                    error={errors.handleName}
                                    onChange={(e) =>
                                      onChangeInput('handleName', e.currentTarget.value, values, setFieldValue)
                                    }
                                  />
                                </FormGrid>
                              )}

                              {(values?.secondaryContactDetails?.label === 'Proof of Address Document' ||
                                selectedOption === 1) && (
                                <Uploader
                                  title="Proof of Address"
                                  subtitle="Latest 3 months Utility Bill, Bank Statement/Credit Card Statement, Tenancy Agreement or Telecom Bill"
                                  error={errors.proofOfAddress}
                                  files={values.proofOfAddress}
                                  onDrop={(file: any) => handleDropImage(file, values, 'proofOfAddress', setFieldValue)}
                                  handleDeleteClick={handleImageDelete(
                                    values,
                                    'proofOfAddress',
                                    values.removedDocuments,
                                    setFieldValue
                                  )}
                                />
                              )}

                              {(values?.secondaryContactDetails?.label === 'Business Email Address' ||
                                selectedOption === 2) && (
                                <TextInput
                                  subText="Please input Business Email Address as alternative contact method. The business email address needs to be different from your primary email address."
                                  placeholder="Business Email Address"
                                  id="businessEmailAddress"
                                  label="Business Email Address"
                                  error={errors.alternateEmail}
                                  value={values.alternateEmail}
                                  onChange={(e) =>
                                    onChangeInput('alternateEmail', e.currentTarget.value, values, setFieldValue)
                                  }
                                />
                              )}

                              <p style={{ color: '#B8B8CC', fontSize: '12px', padding: '0px 80px 0px 0px' }}>
                                *Selecting a business email address or social media handle requires an acknowledgment
                                process for identity verification. A verification message and/or email will be sent to
                                your provided personal and/or business email address and/or social media account, that
                                will require a response from you.
                              </p>
                            </div>

                            {/* <div style={{ marginTop: '20px' }}>
                              {(selectedOption === 1 ) && (
                                <Uploader
                                  title="Proof of Address"
                                  subtitle="Latest 3 months Utility Bill, Bank Statement/Credit Card Statement, Tenancy Agreement or Telecom Bill"
                                  error={errors.proofOfAddress}
                                  files={values.proofOfAddress}
                                  onDrop={(file) => handleDropImage(file, values, 'proofOfAddress', setFieldValue)}
                                  handleDeleteClick={handleImageDelete(
                                    values,
                                    'proofOfAddress',
                                    values.removedDocuments,
                                    setFieldValue
                                  )}
                                />
                              )}

                              {(selectedOption === 2) && (
                                <TextInput
                                  subText="Please input Business Email Address as an alternative contact method"
                                  placeholder="Business Email Address"
                                  id="businessEmailAddress"
                                  label="Business Email Address"
                                  error={errors.alternateEmail}
                                  value={values.alternateEmail}
                                  onChange={(e) =>
                                    onChangeInput('alternateEmail', e.currentTarget.value, values, setFieldValue)
                                  }
                                />
                              )}

                              {(selectedOption === 3) && (
                                <FormGrid>
                                  <Select
                                    subText="Please select one from the following Social Media Platform options in the dropdown (Telegram, Discord, Facebook, Instagram, LinkedIn, or X.com)"
                                    error={errors.socialPlatform}
                                    withScroll
                                    id="socialPlatform"
                                    label="Social Media Platform"
                                    placeholder="Social Media Platform"
                                    selectedItem={values.socialPlatform}
                                    items={socialMediaPlatform}
                                    onSelect={(socialMediaPlatform) =>
                                      onSelectChange('socialPlatform', socialMediaPlatform?.value, setFieldValue)
                                    }
                                  />

                                  <TextInput
                                    subText="Please provide your Social Media Handle in the selected Social Media Platform as an alternative contact method"
                                    placeholder="Social Media Handle"
                                    id="handleName"
                                    label="Social Media Handle"
                                    value={values.handleName}
                                    error={errors.handleName}
                                    onChange={(e) =>
                                      onChangeInput('handleName', e.currentTarget.value, values, setFieldValue)
                                    }
                                  />
                                </FormGrid>
                              )}
                              <p style={{ color: '#B8B8CC', fontSize: '12px', padding: '0px 80px 0px 0px' }}>
                                *Selecting a business email address or social media handle requires an acknowledgment
                                process for identity verification. A verification message and/or email will be sent to
                                your provided personal and/or business email address and/or social media account, that
                                will require a response from you.
                              </p>
                            </div> */}
                          </div>

                          {/* <Select
                            withScroll
                            label="Secondary Contact Details"
                            placeholder="Secondary Contact Details"
                            id="SecondaryContactDetails"
                            selectedItem={values.sourceOfFunds}
                            items={SecondaryContactDetails}

                            onSelect={(item) => onSecondaryContactDetailsChange(item, values.SecondaryContactDetails, setFieldValue)}
                          />

                          <Uploader
                            title="Proof of Address"
                            subtitle="Latest 3 months Utility Bill, Bank Statement/Credit Card Statement, Tenancy Agreement or Telecom Bill"
                            error={errors.proofOfAddress}
                            files={values.proofOfAddress}
                            onDrop={(file) => handleDropImage(file, values, 'proofOfAddress', setFieldValue)}
                            handleDeleteClick={handleImageDelete(
                              values,
                              'proofOfAddress',
                              values.removedDocuments,
                              setFieldValue
                            )}
                          /> */}
                        </Column>
                      </FormCard>

                      <FormCard id="financial">
                        <RowBetween marginBottom="32px">
                          <Flex>
                            <TYPE.title7>
                              <Trans>Financial Information</Trans>
                            </TYPE.title7>
                            {/* {financialFilled && <StyledBigPassed />}
                          {financialFailed && <InvalidFormInputIcon />} */}
                            {requiredFinancial ? (
                              <RequiredBadge>Required</RequiredBadge>
                            ) : (
                              <OptionalBadge>Optional</OptionalBadge>
                            )}
                          </Flex>
                        </RowBetween>

                        <Column style={{ gap: '20px' }}>
                          <FormGrid columns={2}>
                            <Select
                              placeholder="Occupation"
                              label="Occupation"
                              id="occupationDropdown"
                              selectedItem={values.occupation}
                              items={occupationList}
                              onSelect={(status) => onSelectChange('occupation', status, setFieldValue)}
                              error={errors.occupation}
                            />
                            <Select
                              placeholder="Employment Status"
                              label="Employment Status"
                              id="employmentStatusDropdown"
                              selectedItem={values.employmentStatus}
                              items={empleymentStatuses}
                              onSelect={(status: any) => onSelectChange('employmentStatus', status, setFieldValue)}
                              error={errors.employmentStatus}
                            />
                          </FormGrid>

                          <FormGrid columns={2}>
                            <TextInput
                              placeholder="Employer"
                              label="Employer"
                              id="employerField"
                              value={values.employer}
                              error={errors.employer}
                              onChange={(e: any) =>
                                onChangeInput('employer', e.currentTarget.value, values, setFieldValue)
                              }
                            />
                            <Select
                              placeholder="Total Income (in USD) in the Last 12 Months"
                              label="Total Income (in USD) in the Last 12 Months"
                              id="incomeUsdDropdown"
                              items={incomes}
                              selectedItem={values.income}
                              onSelect={(income) => onSelectChange('income', income, setFieldValue)}
                              error={errors.income}
                            />
                          </FormGrid>

                          <Select
                            isMulti
                            withScroll
                            label="Source of Funds"
                            placeholder="Source of Funds"
                            id="sourceOfFundsDropdown"
                            selectedItem={values.sourceOfFunds}
                            items={sourceOfFunds}
                            value={values.sourceOfFunds}
                            error={errors.sourceOfFunds}
                            onSelect={(item) => onSourceOfFundsChange(item, values.sourceOfFunds, setFieldValue)}
                          />

                          {values.sourceOfFunds.some((x: any) => x.label === 'Others' || x === 'Others') && (
                            <TextInput
                              style={{ marginTop: 20 }}
                              placeholder="Other Source of Funds...."
                              value={values.otherFunds}
                              error={errors.otherFunds}
                              onChange={(e: any) =>
                                onChangeInput('otherFunds', e.currentTarget.value, values, setFieldValue)
                              }
                            />
                          )}
                          {errors.sourceOfFunds && (
                            <TYPE.small marginTop="8px" color={'red1'}>
                              {errors.sourceOfFunds}
                            </TYPE.small>
                          )}
                        </Column>

                        <RowBetween marginBottom="32px" marginTop="64px">
                          <TYPE.title7>
                            <Trans>Tax Declaration</Trans>
                          </TYPE.title7>
                          {/* {fatcaFilled && <StyledBigPassed />} */}
                        </RowBetween>

                        <ExtraInfoCard>
                          <RowBetween>
                            <TYPE.buttonMuted>Why We Need Your Tax Declaration?</TYPE.buttonMuted>
                            <LinkButton type="button" onClick={() => setShowTaxModal(true)}>
                              Learn More
                            </LinkButton>

                            <Modal isOpen={showTaxModal} onDismiss={() => setShowTaxModal(false)}>
                              <FormCard>
                                <Column style={{ alignItems: 'stretch' }}>
                                  <TYPE.mediumHeader>Why We Need Your Tax Declaration?</TYPE.mediumHeader>

                                  <br />

                                  <TYPE.description2>
                                    Foreign Account Tax Compliance Act aims to collect information on United States (US)
                                    Tax residents using foreign accounts. It requires Financial Institutions outside the
                                    US to report customers who are US tax residents to the US tax authorities.
                                    <br />
                                    <br />
                                    {config?.name || 'IXS'} is collecting information regarding tax residency status of each Account
                                    holder in order to comply with Income Tax Act and Singapore Income Tax
                                    (International Tax Compliance Agreements) (Common Reporting Standard) Regulations
                                    2016.
                                  </TYPE.description2>

                                  <PinnedContentButton
                                    type="button"
                                    onClick={() => setShowTaxModal(false)}
                                    style={{ width: '100%', marginTop: '32px' }}
                                  >
                                    OK
                                  </PinnedContentButton>
                                </Column>
                              </FormCard>
                            </Modal>
                          </RowBetween>
                        </ExtraInfoCard>

                        <FieldArray name="taxDeclarations">
                          {({ remove, push }) => (
                            <>
                              {values.taxDeclarations?.map((tax: any, index: number) => (
                                <>
                                  <RowBetween
                                    key={`tax-${tax.country}`}
                                    width="100%"
                                    style={{ padding: '1rem' }}
                                    alignItems="center"
                                  >
                                    <FormGrid columns={2} style={{ flexGrow: 1 }}>
                                      <div>
                                        <Select
                                          withScroll
                                          label="Country of Tax Declaration"
                                          placeholder="Country of Tax Declaration"
                                          id="countryOfTaxDeclaration"
                                          selectedItem={values.taxDeclarations[index].country}
                                          items={countries.filter(
                                            ({ label }) =>
                                              ![
                                                'United States of America',
                                                'United States Minor Outlying Islands',
                                              ].includes(label)
                                          )}
                                          onSelect={(country) =>
                                            onSelectChange(`taxDeclarations[${index}].country`, country, setFieldValue)
                                          }
                                          error={errors[`taxDeclarations[${index}].country`]}
                                        />
                                        {/*
                                        {errors[`taxDeclarations[${index}].country`] && (
                                          <TYPE.small marginTop="8px" color={'red1'}>
                                            {errors[`taxDeclarations[${index}].country`]}
                                          </TYPE.small>
                                        )} */}
                                      </div>

                                      <div>
                                        <TextInput
                                          label="Tax Identification Number (TIN)"
                                          id="taxIdentificationNumberField"
                                          placeholder="Tax Identification Number (TIN)"
                                          value={
                                            values.taxDeclarations[index].isAdditional
                                              ? ''
                                              : values.taxDeclarations[index].idNumber
                                          }
                                          error={errors[`taxDeclarations[${index}].idNumber`]}
                                          disabled={values.taxDeclarations[index].isAdditional}
                                          onChange={(e) =>
                                            onChangeInput(
                                              `taxDeclarations[${index}].idNumber`,
                                              e.currentTarget.value,
                                              values,
                                              setFieldValue
                                            )
                                          }
                                        />
                                        {/* {errors[`taxDeclarations[${index}].idNumber`] && (
                                          <TYPE.small marginTop="8px" color={'red1'}>
                                            {errors[`taxDeclarations[${index}].idNumber`]}
                                          </TYPE.small>
                                        )} */}
                                      </div>
                                    </FormGrid>

                                    {index > 0 && (
                                      <IconButton
                                        onClick={() => removeTaxDeclaration(values, index, setFieldValue, remove)}
                                        style={{ padding: '0 1rem', marginTop: '2rem' }}
                                      >
                                        <TrashIcon />
                                      </IconButton>
                                    )}
                                  </RowBetween>
                                  <br />

                                  <LabeledCheckBox>
                                    <Checkbox
                                      label={''}
                                      checked={values.taxDeclarations[index].isAdditional}
                                      onClick={() => onIsAdditionalChange(index, setFieldValue)}
                                    />

                                    <TYPE.description3>
                                      TIN is not available (please indicate reason):
                                    </TYPE.description3>
                                  </LabeledCheckBox>

                                  {values.taxDeclarations[index].isAdditional && (
                                    <>
                                      <TextInput
                                        label="Reason"
                                        placeholder="Reason"
                                        value={values.taxDeclarations[index].reason}
                                        onChange={(e) =>
                                          onChangeInput(
                                            `taxDeclarations[${index}].reason`,
                                            e.currentTarget.value,
                                            values,
                                            setFieldValue
                                          )
                                        }
                                      />

                                      {errors[`taxDeclarations[${index}].reason`] && (
                                        <TYPE.small marginTop="8px" color={'red1'}>
                                          {errors[`taxDeclarations[${index}].reason`]}
                                        </TYPE.small>
                                      )}
                                    </>
                                  )}
                                </>
                              ))}

                              {/* <HrLine /> */}

                              <LinkButton
                                type="button"
                                onClick={() => push({ country: null, idNumber: '', isAdditional: false })}
                                style={{ marginTop: '32px', width: '100%', textDecoration: 'none' }}
                              >
                                <ExtraInfoCardCountry>
                                  <RowCenter>
                                    <Plus style={{ width: '20px', marginRight: '5px' }} />
                                    <Box> Add Country </Box>
                                  </RowCenter>
                                </ExtraInfoCardCountry>
                              </LinkButton>

                              {errors.taxDeclarations && (
                                <TYPE.small marginTop="8px" color={'red1'}>
                                  {errors.taxDeclarations}
                                </TYPE.small>
                              )}
                            </>
                          )}
                        </FieldArray>

                        {/* <RowBetween marginBottom="32px" marginTop="64px">
                          <TYPE.title7>
                            <Trans>FATCA</Trans>
                          </TYPE.title7>

                        </RowBetween>

                        {/* <ExtraInfoCard>
                          <RowBetween>
                            <TYPE.buttonMuted>Declaration of US Citizenship or US residence for FATCA</TYPE.buttonMuted>
                            <LinkButton type="button" onClick={() => setShowFATCAModal(true)}>
                              Learn More
                            </LinkButton>

                            <Modal isOpen={showFATCAModal} onDismiss={() => setShowFATCAModal(false)}>
                              <FormCard>
                                <Column style={{ alignItems: 'stretch' }}>
                                  <TYPE.mediumHeader>
                                    Under FATCA, You are Citizen Of The United States Of America if:
                                  </TYPE.mediumHeader>

                                  <br />

                                  <TYPE.description2>
                                    You were born in US, Puerto Rico, Guam or the US Virgin Islands;
                                    <ol>
                                      <li>Your parent is a US citizen;</li>
                                      <li>You have been naturalized as a US citizen.</li>
                                    </ol>
                                  </TYPE.description2>

                                  <PinnedContentButton
                                    type="button"
                                    onClick={() => setShowFATCAModal(false)}
                                    style={{ width: '100%', marginTop: '32px' }}
                                  >
                                    OK
                                  </PinnedContentButton>
                                </Column>
                              </FormCard>
                            </Modal>
                          </RowBetween>
                        </ExtraInfoCard>

                        <Column style={{ gap: '20px', marginTop: 20 }}>
                          <Column style={{ gap: '8px' }}>
                            <Checkbox
                              isRadio
                              id="citizenOfUS"
                              checked={values.isUSTaxPayer === 1}
                              onClick={() => onRadioChange('isUSTaxPayer', 1, setFieldValue)}
                              label={`I confirm that I am a US citizen and/or resident in the US for tax purposes and my US federal taxpayer ID number (US TIN) is as follows: `}
                            />
                            {values.isUSTaxPayer === 1 && (
                              <TextInput
                                style={{ width: '100%' }}
                                placeholder="ID Number.."
                                value={values.usTin}
                                onChange={(e: any) =>
                                  onChangeInput('usTin', e.currentTarget.value, values, setFieldValue)
                                }
                                error={errors.usTin && errors.usTin}
                              />
                            )}
                          </Column>
                          <Checkbox
                            isRadio
                            id="notCitizenOfUS"
                            checked={values.isUSTaxPayer === 0}
                            onClick={() => onRadioChange('isUSTaxPayer', 0, setFieldValue)}
                            label="I confirm that I am not a US citizen or resident in the US for tax purposes "
                          />
                          {errors.isUSTaxPayer && (
                            <TYPE.small marginTop="-4px" color={'red1'}>
                              <Trans>Choose one</Trans>
                            </TYPE.small>
                          )}
                        </Column> */}
                      </FormCard>
                    </Column>
                  </FormContainer>

                  <StyledStickyBox>
                    <KYCValidationErrors fields={Object.keys(errors)} />
                    <KYCProgressBar
                      handleSubmit={handleSubmit}
                      handleSaveProgress={() => saveProgress(form?.current?.values)}
                      // disabled={!(dirty && Object.keys(errors).length === 0)}
                      disabled={!canSubmit || Object.keys(errors).length !== 0}
                      topics={[
                        {
                          title: 'Personal Information',
                          href: 'personal',
                          passed: personalPassed,
                          failed: personalFailed,
                        },
                        {
                          title: 'Financial Information',
                          href: 'financial',
                          passed: financialFilledState,
                          failed: !financialFilledState,
                        },
                        // {
                        //   title: 'Investor Status Declaration',
                        //   href: 'status-declaration',
                        //   passed: statusDeclarationFilled,
                        //   failed: statusDeclarationFailed,
                        // },
                        // { title: 'Investor Declaration', href: 'investor-declaration', passed: investorFilled },
                        // { title: 'Acknowledgement', href: 'acknowledgement', passed: investorStatusAcknowledgementFilled },
                      ]}
                      description={kyc?.message || null}
                      reasons={['Last name', 'Gender', 'Middle name']}
                    />
                  </StyledStickyBox>
                </FormRow>
              )
            }}
          </Formik>
        )}
      </StyledBodyWrapper>
    </Loadable>
  )
}

const BorderBox = styled.div<{ active: boolean }>`
  background-clip: padding-box; /* !importanté */
  border: solid 1px transparent;
  border-radius: 10rem;

  padding: 0.5rem 2rem;

  background: ${({ theme }) => theme.bg0};
  position: relative;

  width: 50%;

  :before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    margin: -3px; /* !importanté */
    border-radius: inherit;
    background: ${({ active }) => (active ? 'linear-gradient(86.36deg, #6B2EE6 29.09%, #FF0080 107.32%)' : 'none')};
  }
`

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const OptionalBadge = styled.div`
  background-color: #f7f7fa;
  color: #c3c3d4;
  padding: 4px 8px;
  text-align: center;
  border-radius: 5px;
`

const RequiredBadge = styled.div`
  background-color: #fff0f0;
  color: #ff6161;
  border-color: #ffd3d3;
  padding: 4px 8px;
  text-align: center;
  border-radius: 5px;
`

const LabeledCheckBox = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  grid-template-rows: auto;

  place-items: start;
`

const LinkButton = styled(LinkStyledButton)`
  color: #6666ff;
`

const InlineLinkButton = styled(LinkStyledButton)`
  color: #ac83ff;
`
