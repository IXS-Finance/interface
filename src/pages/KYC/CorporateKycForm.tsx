import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t, Trans } from '@lingui/macro'
import { FileWithPath } from 'react-dropzone'
import { useHistory } from 'react-router-dom'
import { Formik } from 'formik'
import { isMobile } from 'react-device-detect'
import { useCookies } from 'react-cookie'
import { Prompt } from 'react-router-dom'
import { ReactComponent as TrashNoBorder } from 'assets/images/TrashNoBorder.svg'
import usePrevious from 'hooks/usePrevious'
import Column from 'components/Column'
import { ButtonText } from 'components/Button'
import { TYPE } from 'theme'
import { StyledBodyWrapper } from 'pages/SecurityTokens'
import { RowBetween, RowCenter } from 'components/Row'
import { PhoneInput } from 'components/PhoneInput'
import { Checkbox } from 'components/Checkbox'
import { Loadable } from 'components/LoaderHover'
import { useAuthState } from 'state/auth/hooks'
import { useAddPopup, useShowError } from 'state/application/hooks'
import { LoadingIndicator } from 'components/LoadingIndicator'
import { ReactComponent as ArrowLeft } from 'assets/images/newBack.svg'
import { getCorporateProgress, useCreateCorporateKYC, useKYCState, useUpdateCorporateKYC } from 'state/kyc/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { countriesList } from 'constants/countriesList'
import { MAX_FILE_UPLOAD_SIZE, MAX_FILE_UPLOAD_SIZE_ERROR } from 'constants/constants'
import { DateInput } from 'components/DateInput'
import moment from 'moment'
import dayjs from 'dayjs'

import { Select, TextInput } from './common'
import { KYCProgressBar } from './KYCProgressBar'
import { corporateSourceOfFunds, legalEntityTypes, corporateFormInitialValues, promptValue } from './mock'
import { FormCard, FormGrid, ExtraInfoCard, StyledStickyBox, StyledBigPassed, ExtraInfoCardCountry } from './styleds'
import { ChooseFile } from './common'
import { FormContainer, FormRow } from './IndividualKycForm'
import { corporateErrorsSchema } from './schema'
import { KYCStatuses } from './enum'
import { corporateTransformApiData, corporateTransformKycDto } from './utils'
import { Box } from 'rebass'
import { Plus } from 'react-feather'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import { Uploader } from 'components/Uploader'

type FormSubmitHanderArgs = {
  createFn: (body: any) => any
  updateFn: (id: number, body: any) => any
  validate: boolean
}

export default function CorporateKycForm() {
  const canLeavePage = useRef(false)
  const [cookies] = useCookies(['annoucementsSeen'])
  const form = useRef<any>(null)
  const history = useHistory()
  const { kyc } = useKYCState()
  const showError = useShowError()
  const addPopup = useAddPopup()
  const createCorporateKYC = useCreateCorporateKYC()
  const updateCorporateKYC = useUpdateCorporateKYC()
  const { account } = useActiveWeb3React()
  const { token } = useAuthState()
  const prevAccount = usePrevious(account)
  const { config } = useWhitelabelState()

  const [isTaxNumberDisabled, setIsTaxNumberDisabled] = useState<boolean>(false)
  const [updateKycId, setUpdateKycId] = useState<any>(null)
  const [canSubmit, setCanSubmit] = useState(true)
  const [isSubmittedOnce, setIsSubmittedOnce] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [initialFormValues, setInitialFormValues] = useState<any>(corporateFormInitialValues)
  const [hasInitialized, setHasInitialized] = useState(false)

  const isLoggedIn = !!token && !!account

  useEffect(() => {
    if (account && prevAccount && account !== prevAccount) {
      history.push('/kyc')
    }
  }, [account, prevAccount, history])

  useEffect(() => {
    const getProgress = async () => {
      const data = await getCorporateProgress()
      if (data) {
        const transformedData = corporateTransformApiData(data)
        const formData = { ...transformedData }
        // Update initial values instead of directly setting form values
        setInitialFormValues(formData)
        setHasInitialized(true)

        if (kyc?.status === KYCStatuses.DRAFT) {
          setCanSubmit(true)
        }
      }
    }

    // Only initialize once when the component mounts and has KYC data
    if (!hasInitialized && (kyc?.status === KYCStatuses.CHANGES_REQUESTED || kyc?.status === KYCStatuses.DRAFT)) {
      getProgress()
      setUpdateKycId(kyc.id)
    }
  }, [kyc, hasInitialized])

  useEffect(() => {
    window.addEventListener('beforeunload', alertUser)

    return () => {
      window.removeEventListener('beforeunload', alertUser)
    }
  }, [])

  const alertUser = (e: any) => {
    e.preventDefault()
    e.returnValue = ''
  }

  const goBack = (e?: any) => {
    if (e) e.preventDefault()
    history.push('/kyc')
  }

  const changeBeneficiar = (
    fieldName: string,
    value: string | FileWithPath | null,
    index: number,
    owners: any,
    setFieldValue: any,
    specificErrorField: string
  ) => {
    const beneficiar = owners[index]
    const newData = [...owners]

    if (value && typeof value === 'object' && value?.size > MAX_FILE_UPLOAD_SIZE) {
      showError(MAX_FILE_UPLOAD_SIZE_ERROR)
      return
    }

    if (beneficiar[fieldName]?.id) {
      setFieldValue('removedDocuments', [beneficiar[fieldName].id])
    }
    newData.splice(index, 1, { ...beneficiar, [fieldName]: value })

    setFieldValue('beneficialOwners', newData, false)
    validationSeen(specificErrorField)
    validationSeen('beneficialOwners')
  }

  const addBeneficiary = (owners: any, setFieldValue: any) => {
    setFieldValue(
      'beneficialOwners',
      [
        ...owners,
        { fullName: '', nationality: '', dateOfBirth: '', address: '', shareholding: '', proofOfIdentity: null },
      ],
      false
    )
  }

  const deleteBeneficiar = (index: number, owners: any, removedBeneficialOwners: any[], setFieldValue: any) => {
    const newData = [...owners]
    if (newData[index]?.id) {
      setFieldValue('removedBeneficialOwners', [...removedBeneficialOwners, newData[index].id])
    }
    newData.splice(index, 1)

    if (!newData.length) {
      newData.push({
        fullName: '',
        nationality: '',
        dateOfBirth: '',
        address: '',
        shareholding: '',
        proofOfIdentity: null,
      })
    }
    setFieldValue('beneficialOwners', newData, false)
  }

  const changeCorporateMembers = (
    fieldName: string,
    value: string | FileWithPath | null,
    index: number,
    owners: any,
    setFieldValue: any,
    specificErrorField: string
  ) => {
    const beneficiar = owners[index]
    const newData = [...owners]

    if (value && typeof value === 'object' && value?.size > MAX_FILE_UPLOAD_SIZE) {
      showError(MAX_FILE_UPLOAD_SIZE_ERROR)
      return
    }

    if (beneficiar[fieldName]?.id) {
      setFieldValue('removedDocuments', [beneficiar[fieldName].id])
    }
    newData.splice(index, 1, { ...beneficiar, [fieldName]: value })

    setFieldValue('corporateMembers', newData, false)
    validationSeen(specificErrorField)
    validationSeen('corporateMembers')
  }

  const addCorporateMember = (owners: any, setFieldValue: any) => {
    setFieldValue(
      'corporateMembers',
      [...owners, { fullName: '', nationality: '', designation: '', proofOfIdentity: null }],
      false
    )
  }

  const deleteCorporateMembers = (index: number, owners: any, removedBeneficialOwners: any[], setFieldValue: any) => {
    const newData = [...owners]
    if (newData[index]?.id) {
      setFieldValue('removedCorporateMembers', [...removedBeneficialOwners, newData[index].id])
    }
    newData.splice(index, 1)

    if (!newData.length) {
      newData.push({ fullName: '', nationality: '', designation: '', proofOfIdentity: null })
    }
    setFieldValue('corporateMembers', newData, false)
  }

  const onSourceOfFundsChange = (source: string, fields: any[], setFieldValue: any) => {
    fields = fields ?? []
    const newSources = [...fields]
    const indexOfSource = fields.indexOf(source)

    // check for existence
    if (indexOfSource > -1) {
      newSources.splice(indexOfSource, 1)
    } else if (fields.includes('Others')) {
      const othersIndex = fields.indexOf('Others')
      newSources.splice(othersIndex - 1, 0, source)
    } else {
      newSources.push(source)
    }

    setFieldValue('sourceOfFunds', newSources, false)
    validationSeen('sourceOfFunds')
    validationSeen('otherFunds')
  }

  const countries = useMemo(() => {
    return countriesList.map((label, index) => ({ id: ++index, label })).sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const validationSeen = (key: string) => {
    if (errors[key]) {
      const newErrors = { ...errors }
      delete newErrors[key]
      setErrors(newErrors)
      setCanSubmit(true)
    }
  }

  const onChangeInput = (key: string, value: string | boolean, values: any, setFieldValue: any) => {
    if (values[key] !== value) {
      setFieldValue(key, value, false)
    }

    validationSeen(key)
  }

  const onSelectChange = (key: string, value: any, setFieldValue: any) => {
    setFieldValue(key, value, false)
    validationSeen(key)
  }

  const handleDropImage = (acceptedFile: any, values: any, key: string, setFieldValue: any) => {
    const file = acceptedFile
    if (file?.size > MAX_FILE_UPLOAD_SIZE) {
      showError(MAX_FILE_UPLOAD_SIZE_ERROR)
    } else {
      const arrayOfFiles = [...values[key]]
      arrayOfFiles.push(file)

      setFieldValue(key, arrayOfFiles, false)
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
      validationSeen(key)
    }

  const formSubmitHandler = useCallback(
    async (values: any, { createFn, updateFn, validate = true }: FormSubmitHanderArgs) => {
      try {
        if (validate) {
          await corporateErrorsSchema.validate(values, { abortEarly: false })
        }

        canLeavePage.current = true
        setCanSubmit(false)
        const body = corporateTransformKycDto(values)
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

        error?.inner.forEach((e: any) => {
          newErrors[e.path] = e?.message
        })

        addPopup({ info: { success: false, summary: 'Please, fill the valid data' } })

        setIsSubmittedOnce(true)
        setErrors(newErrors)
        setCanSubmit(false)

        canLeavePage.current = false
      }
    },
    [updateKycId]
  )

  const saveProgress = useCallback(
    async (values: any) => {
      await formSubmitHandler(values, {
        createFn: (body) => createCorporateKYC(body, true),
        updateFn: (id, body) => updateCorporateKYC(id, body, true),
        validate: false,
      })
    },
    [formSubmitHandler]
  )

  return (
    <Loadable loading={!isLoggedIn}>
      <Prompt when={!canLeavePage.current} message={promptValue} />

      <StyledBodyWrapper style={{ background: 'none', boxShadow: 'none' }} hasAnnouncement={!cookies.annoucementsSeen}>
        <Formik
          innerRef={form}
          initialValues={initialFormValues}
          initialErrors={errors}
          validateOnBlur={false}
          validateOnChange={false}
          validateOnMount={false}
          isInitialValid={false}
          enableReinitialize
          onSubmit={async (values) => {
            try {
              await corporateErrorsSchema.validate(values, { abortEarly: false })
              // .then(async () => {
              canLeavePage.current = true
              setCanSubmit(false)
              if (values?.taxIdAvailable === false) {
                values.taxNumber = ''
              } else {
                values.reason = ''
              }
              const body = corporateTransformKycDto(values)
              const data = updateKycId ? await updateCorporateKYC(updateKycId, body) : await createCorporateKYC(body)

              if (data?.id) {
                history.push('/kyc')
                addPopup({
                  info: {
                    success: true,
                    summary: `KYC was successfully ${updateKycId ? 'updated' : 'submitted'}`,
                  },
                })
              } else {
                setCanSubmit(true)
                addPopup({
                  info: {
                    success: false,
                    summary: 'Something went wrong',
                  },
                })
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
          {({ values, setFieldValue, handleSubmit }) => {
            const shouldValidate = isSubmittedOnce
            const infoFilled =
              shouldValidate &&
              !errors.corporateName &&
              !errors.typeOfLegalEntity &&
              !errors.countryOfIncorporation &&
              !errors.businessActivity &&
              !errors.registrationNumber &&
              !errors.inFatfJurisdiction
            const authorizedPersonnelFilled =
              shouldValidate &&
              !errors.personnelName &&
              !errors.designation &&
              !errors.email &&
              !errors.phoneNumber &&
              !errors.authorizationIdentity &&
              !errors.authorizationDocuments
            const addressFilled =
              shouldValidate && !errors.address && !errors.postalCode && !errors.city && !errors.country
            const residentialAddressFilled =
              shouldValidate &&
              !errors.residentialAddressAddress &&
              !errors.residentialAddressPostalCode &&
              !errors.residentialAddressCountry &&
              !errors.residentialAddressCity
            const fundsFilled = shouldValidate && !errors.sourceOfFunds && !errors.otherFunds
            const fatcaFilled = shouldValidate && !errors.usTin && !errors.isUSTaxPayer
            const taxDeclarationFilled = values.taxIdAvailable
              ? shouldValidate && !errors.taxCountry && !errors.taxNumber
              : shouldValidate && !errors.reason
            const filesFilled = shouldValidate && !errors.financialDocuments && !errors.corporateDocuments
            const beneficialOwnersFilled =
              shouldValidate && !Object.keys(errors).some((errorField) => errorField.startsWith('beneficialOwners'))
            const corporateMembersFilled =
              shouldValidate && !Object.keys(errors).some((errorField) => errorField.startsWith('corporateMembers'))

            return (
              <FormRow>
                <FormContainer onSubmit={handleSubmit} style={{ gap: '35px' }}>
                  <Column style={{ gap: '35px' }}>
                    <FormCard style={{ marginTop: isMobile ? '90px' : '0px' }} id="info">
                      <ButtonText
                        style={{ textDecoration: 'none' }}
                        display="flex"
                        marginBottom={isMobile ? '32px' : '30px'}
                        marginTop={isMobile ? '20px' : '10px'}
                        onClick={goBack}
                      >
                        <ArrowLeft style={{ width: isMobile ? 20 : 26 }} />
                        <TYPE.title4
                          fontWeight={'800'}
                          fontSize={isMobile ? 24 : 24}
                          style={{ whiteSpace: 'nowrap' }}
                          marginLeft="10px"
                        >
                          <Trans>KYC as Corporate</Trans>
                        </TYPE.title4>
                      </ButtonText>
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Corporate Information</Trans>
                        </TYPE.title7>
                        {infoFilled && <StyledBigPassed />}
                      </RowBetween>

                      <Column style={{ gap: '20px' }}>
                        <FormGrid columns={3}>
                          <TextInput
                            onChange={(e: any) =>
                              onChangeInput('corporateName', e.currentTarget.value, values, setFieldValue)
                            }
                            value={values.corporateName}
                            label="Corporate Name"
                            placeholder="Corporate Name"
                            error={errors.corporateName && errors.corporateName}
                          />
                          <TextInput
                            onChange={(e: any) =>
                              onChangeInput('registrationNumber', e.currentTarget.value, values, setFieldValue)
                            }
                            value={values.registrationNumber}
                            label="Registration Number"
                            placeholder="Registration Number"
                            error={errors.registrationNumber && errors.registrationNumber}
                          />
                          <TextInput
                            label="Business Activity"
                            placeholder="Business Activity"
                            value={values.businessActivity}
                            onChange={(e: any) =>
                              onChangeInput('businessActivity', e.currentTarget.value, values, setFieldValue)
                            }
                            error={errors.businessActivity && errors.businessActivity}
                          />
                        </FormGrid>

                        <FormGrid columns={2}>
                          <Select
                            withScroll
                            placeholder="Country of Incorporation"
                            label="Country of Incorporation"
                            selectedItem={values.countryOfIncorporation}
                            items={countries}
                            onSelect={(country) => onSelectChange('countryOfIncorporation', country, setFieldValue)}
                            error={errors.countryOfIncorporation && errors.countryOfIncorporation}
                          />
                          <Select
                            withScroll
                            label="Type of Legal Entity"
                            placeholder="Type of Legal Entity"
                            selectedItem={values.typeOfLegalEntity}
                            items={legalEntityTypes}
                            onSelect={(entityType) => onSelectChange('typeOfLegalEntity', entityType, setFieldValue)}
                            error={errors.typeOfLegalEntity && errors.typeOfLegalEntity}
                          />
                        </FormGrid>
                      </Column>
                    </FormCard>

                    <FormCard id="authorizedPersonnel">
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Authorized Personnel</Trans>
                        </TYPE.title7>
                        {authorizedPersonnelFilled && <StyledBigPassed />}
                      </RowBetween>

                      <Column style={{ gap: '20px' }}>
                        <FormGrid>
                          <TextInput
                            onChange={(e: any) =>
                              onChangeInput('personnelName', e.currentTarget.value, values, setFieldValue)
                            }
                            value={values.personnelName}
                            label="Full Name"
                            placeholder="Full Name"
                            error={errors.personnelName && errors.personnelName}
                          />
                          <TextInput
                            onChange={(e: any) =>
                              onChangeInput('designation', e.currentTarget.value, values, setFieldValue)
                            }
                            value={values.designation}
                            label="Designation"
                            placeholder="Designation"
                            error={errors.designation && errors.designation}
                          />
                        </FormGrid>

                        <FormGrid>
                          <TextInput
                            onChange={(e: any) => onChangeInput('email', e.currentTarget.value, values, setFieldValue)}
                            value={values.email}
                            label="Email address"
                            placeholder="Email address"
                            error={errors.email && errors.email}
                            disabled={true}
                          />
                          <PhoneInput
                            onChange={(value) => onChangeInput('phoneNumber', value, values, setFieldValue)}
                            value={values.phoneNumber}
                            label="Phone Number"
                            error={errors.phoneNumber && errors.phoneNumber}
                          />
                        </FormGrid>
                        <FormGrid columns={1}>
                          <Uploader
                            title="Authorization Document"
                            subtitle="Board Resolution or equivalent dated within the last 3 months"
                            files={values.authorizationDocuments}
                            onDrop={(file: any) => {
                              handleDropImage(file, values, 'authorizationDocuments', setFieldValue)
                            }}
                            error={errors.authorizationDocuments && errors.authorizationDocuments}
                            handleDeleteClick={handleImageDelete(
                              values,
                              'authorizationDocuments',
                              values.removedDocuments,
                              setFieldValue
                            )}
                          />
                          <Uploader
                            subtitle="Passport, National ID, or Driving License"
                            error={errors.authorizationIdentity}
                            title="Proof of Identity"
                            files={values.authorizationIdentity}
                            onDrop={(file: any) => {
                              handleDropImage(file, values, 'authorizationIdentity', setFieldValue)
                            }}
                            handleDeleteClick={handleImageDelete(
                              values,
                              'authorizationIdentity',
                              values.removedDocuments,
                              setFieldValue
                            )}
                          />
                        </FormGrid>
                      </Column>
                    </FormCard>

                    <FormCard id="address">
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Business Address</Trans>
                        </TYPE.title7>
                        {addressFilled && <StyledBigPassed />}
                      </RowBetween>

                      <Column style={{ gap: '20px' }}>
                        <FormGrid>
                          <TextInput
                            onChange={(e: any) =>
                              onChangeInput('address', e.currentTarget.value, values, setFieldValue)
                            }
                            value={values.address}
                            label="Address"
                            placeholder="Address"
                            error={errors.address && errors.address}
                          />
                          <TextInput
                            onChange={(e: any) =>
                              onChangeInput('postalCode', e.currentTarget.value, values, setFieldValue)
                            }
                            value={values.postalCode}
                            label="Postal Code"
                            placeholder="Postal Code"
                            error={errors.postalCode && errors.postalCode}
                          />
                        </FormGrid>

                        <FormGrid>
                          <Select
                            withScroll
                            label="Country"
                            placeholder="Country"
                            selectedItem={values.country}
                            items={countries}
                            onSelect={(country) => onSelectChange('country', country, setFieldValue)}
                            error={errors.country && errors.country}
                          />
                          <TextInput
                            onChange={(e: any) => onChangeInput('city', e.currentTarget.value, values, setFieldValue)}
                            value={values.city}
                            label="City"
                            placeholder="City"
                            error={errors.city && errors.city}
                          />
                        </FormGrid>
                      </Column>
                    </FormCard>

                    <FormCard id="residentialAddress">
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Registered Address</Trans>
                        </TYPE.title7>
                        {residentialAddressFilled && <StyledBigPassed />}
                      </RowBetween>

                      <Column style={{ gap: '20px' }}>
                        <FormGrid>
                          <TextInput
                            placeholder="Address"
                            onChange={(e: any) =>
                              onChangeInput('residentialAddressAddress', e.currentTarget.value, values, setFieldValue)
                            }
                            value={values.residentialAddressAddress}
                            label="Address"
                            error={errors.residentialAddressAddress && errors.residentialAddressAddress}
                          />
                          <TextInput
                            onChange={(e: any) =>
                              onChangeInput(
                                'residentialAddressPostalCode',
                                e.currentTarget.value,
                                values,
                                setFieldValue
                              )
                            }
                            placeholder="Postal Code"
                            value={values.residentialAddressPostalCode}
                            label="Postal Code"
                            error={errors.residentialAddressPostalCode && errors.residentialAddressPostalCode}
                          />
                        </FormGrid>

                        <FormGrid>
                          <Select
                            withScroll
                            label="Country"
                            placeholder="Country"
                            selectedItem={values.residentialAddressCountry}
                            items={countries}
                            onSelect={(country) => onSelectChange('residentialAddressCountry', country, setFieldValue)}
                            error={errors.residentialAddressCountry && errors.residentialAddressCountry}
                          />
                          <TextInput
                            onChange={(e: any) =>
                              onChangeInput('residentialAddressCity', e.currentTarget.value, values, setFieldValue)
                            }
                            value={values.residentialAddressCity}
                            label="City"
                            placeholder="City"
                            error={errors.residentialAddressCity && errors.residentialAddressCity}
                          />
                        </FormGrid>
                      </Column>
                    </FormCard>

                    <FormCard id="funds">
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Source of Funds</Trans>
                        </TYPE.title7>
                        {fundsFilled && <StyledBigPassed />}
                      </RowBetween>
                      <FormGrid columns={3}>
                        {corporateSourceOfFunds.map(({ value, label }: any) => (
                          <Checkbox
                            checked={values?.sourceOfFunds?.includes(label)}
                            onClick={() => onSourceOfFundsChange(label, values.sourceOfFunds, setFieldValue)}
                            key={`funds-${value}`}
                            label={label}
                          />
                        ))}
                      </FormGrid>
                      {values?.sourceOfFunds?.includes('Others') && (
                        <TextInput
                          style={{ marginTop: 20 }}
                          placeholder="Other Source of Funds...."
                          onChange={(e: any) =>
                            onChangeInput('otherFunds', e.currentTarget.value, values, setFieldValue)
                          }
                          value={values.otherFunds || ''}
                          error={errors.otherFunds && errors.otherFunds}
                        />
                      )}
                      {errors.sourceOfFunds && (
                        <TYPE.small marginTop="8px" color={'red1'}>
                          {errors.sourceOfFunds}
                        </TYPE.small>
                      )}
                    </FormCard>

                    <FormCard id="fatca">
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>FATCA</Trans>
                        </TYPE.title7>
                        {fatcaFilled && <StyledBigPassed />}
                      </RowBetween>

                      <ExtraInfoCard>
                        <TYPE.buttonMuted>Declaration of US Citizenship or US residence for FATCA</TYPE.buttonMuted>
                      </ExtraInfoCard>

                      <Column style={{ gap: '20px', marginTop: 20 }}>
                        <Column style={{ gap: '8px' }}>
                          <Checkbox
                            isRadio
                            checked={values.isUSTaxPayer === 1}
                            onClick={() => onSelectChange('isUSTaxPayer', 1, setFieldValue)}
                            label={`I confirm that the entity is in the US for tax purposes and its US federal taxpayer ID number (US TIN) is as follows: `}
                          />
                          {values.isUSTaxPayer === 1 && (
                            <TextInput
                              placeholder="ID Number.."
                              value={values.usTin || ''}
                              onChange={(e: any) =>
                                onChangeInput('usTin', e.currentTarget.value, values, setFieldValue)
                              }
                              error={errors.usTin && errors.usTin}
                            />
                          )}
                        </Column>
                        <Checkbox
                          isRadio
                          checked={values.isUSTaxPayer === 0}
                          onClick={() => onSelectChange('isUSTaxPayer', 0, setFieldValue)}
                          label="I confirm that the entity is not resident in the US for tax purposes "
                        />
                        {errors.isUSTaxPayer && (
                          <TYPE.small marginTop="-4px" color={'red1'}>
                            <Trans>Choose one</Trans>
                          </TYPE.small>
                        )}
                      </Column>
                    </FormCard>

                    <FormCard id="tax-declaration">
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Tax Declaration</Trans>
                        </TYPE.title7>
                        {taxDeclarationFilled && <StyledBigPassed />}
                      </RowBetween>

                      <ExtraInfoCard>
                        <TYPE.buttonMuted>
                          Please list all countries where the entity is a resident for tax purposes and the respective
                          TIN for each country.
                        </TYPE.buttonMuted>
                      </ExtraInfoCard>

                      <Column style={{ gap: '20px', marginTop: 20 }}>
                        <FormGrid>
                          <Select
                            withScroll
                            label="Country of tax residency"
                            placeholder="Country of tax residency"
                            selectedItem={values.taxCountry}
                            items={countries}
                            onSelect={(country) => onSelectChange('taxCountry', country, setFieldValue)}
                            error={errors.taxCountry && errors.taxCountry}
                          />
                          <TextInput
                            value={values.taxNumber}
                            label="Tax Indentification Number"
                            placeholder="Tax Indentification Number"
                            disabled={isTaxNumberDisabled || !values.taxIdAvailable}
                            onChange={(e: any) =>
                              onChangeInput('taxNumber', e.currentTarget.value, values, setFieldValue)
                            }
                            error={errors.taxNumber && errors.taxNumber}
                          />
                        </FormGrid>
                      </Column>

                      <Column style={{ gap: '20px', marginTop: 20 }}>
                        <FormGrid columns={1}>
                          <Checkbox
                            checked={!values.taxIdAvailable}
                            onClick={() => {
                              onChangeInput('taxIdAvailable', !values.taxIdAvailable, values, setFieldValue)
                              if (values.taxIdAvailable === true) {
                                setFieldValue('taxNumber', '', false)
                                setIsTaxNumberDisabled(true)
                              } else {
                                setFieldValue('reason', '', false)
                                setIsTaxNumberDisabled(false)
                              }
                            }}
                            label="TIN Is Not Available"
                          />
                        </FormGrid>
                      </Column>

                      {!values.taxIdAvailable && (
                        <Column style={{ gap: '20px', marginTop: 20 }}>
                          <TextInput
                            value={values.reason}
                            label="Reason"
                            placeholder="Reason"
                            onChange={(e: any) => onChangeInput('reason', e.currentTarget.value, values, setFieldValue)}
                            error={errors.reason && errors.reason}
                          />
                        </Column>
                      )}
                    </FormCard>

                    <FormCard id="beneficial-owners">
                      <Box marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Beneficial Owners Information</Trans>
                        </TYPE.title7>
                        <TYPE.small>
                          <Trans>Beneficial Owners Information with more than 10% Beneficial Interest</Trans>
                        </TYPE.small>
                        {beneficialOwnersFilled && <StyledBigPassed />}
                      </Box>
                      <ExtraInfoCard style={{ marginBottom: 20 }}>
                        <TYPE.buttonMuted>
                          Please upload Proof of Identity (Passport, National ID or Driving License) dated within the
                          last 3 months.
                        </TYPE.buttonMuted>
                      </ExtraInfoCard>
                      {/* <BeneficialOwnersTable data={values.beneficialOwners} /> */}
                      {values.beneficialOwners?.map((beneficiar: Record<string, string | any>, index: number) => (
                        <Column
                          style={{
                            gap: '20px',
                            marginBottom: '24px',
                            borderRadius: '8px',
                            border: 'solid 1px #222328',
                            padding: '24px 24px',
                          }}
                          key={index}
                        >
                          <FormGrid columns={2}>
                            <TextInput
                              value={beneficiar.fullName}
                              placeholder="Full Name"
                              label="Full Name"
                              onChange={(e: any) =>
                                changeBeneficiar(
                                  'fullName',
                                  e.currentTarget.value,
                                  index,
                                  values.beneficialOwners,
                                  setFieldValue,
                                  `beneficialOwners[${index}].fullName`
                                )
                              }
                              error={
                                errors[`beneficialOwners[${index}].fullName`] &&
                                errors[`beneficialOwners[${index}].fullName`]
                              }
                            />
                            <TextInput
                              value={beneficiar.nationality}
                              placeholder="Nationality"
                              label="Nationality"
                              onChange={(e: any) =>
                                changeBeneficiar(
                                  'nationality',
                                  e.currentTarget.value,
                                  index,
                                  values.beneficialOwners,
                                  setFieldValue,
                                  `beneficialOwners[${index}].nationality`
                                )
                              }
                              error={
                                errors[`beneficialOwners[${index}].nationality`] &&
                                errors[`beneficialOwners[${index}].nationality`]
                              }
                            />
                            <DateInput
                              // maxHeight={60}
                              error={
                                errors[`beneficialOwners[${index}].dateOfBirth`] &&
                                errors[`beneficialOwners[${index}].dateOfBirth`]
                              }
                              value={beneficiar.dateOfBirth}
                              id="dateOfBirthButton"
                              placeholder="Date of Birth"
                              onChange={(value) =>
                                changeBeneficiar(
                                  'dateOfBirth',
                                  dayjs(value).local().format('YYYY-MM-DD'),
                                  index,
                                  values.beneficialOwners,
                                  setFieldValue,
                                  `beneficialOwners[${index}].dateOfBirth`
                                )
                              }
                              maxDate={moment().subtract(18, 'years')}
                            />
                            <TextInput
                              value={beneficiar.address}
                              placeholder="Address"
                              label="Address"
                              onChange={(e: any) =>
                                changeBeneficiar(
                                  'address',
                                  e.currentTarget.value,
                                  index,
                                  values.beneficialOwners,
                                  setFieldValue,
                                  `beneficialOwners[${index}].address`
                                )
                              }
                              error={
                                errors[`beneficialOwners[${index}].address`] &&
                                errors[`beneficialOwners[${index}].address`]
                              }
                            />
                            {/* </DeleteRow> */}
                            {/* </IconButton> */}
                          </FormGrid>
                          <FormGrid columns={1}>
                            <TextInput
                              type="number"
                              onWheel={() => (document.activeElement as HTMLElement).blur()}
                              placeholder="%"
                              label="% Beneficial Ownership"
                              value={beneficiar.shareholding}
                              onChange={(e: any) =>
                                changeBeneficiar(
                                  'shareholding',
                                  e.currentTarget.value,
                                  index,
                                  values.beneficialOwners,
                                  setFieldValue,
                                  `beneficialOwners[${index}].shareholding`
                                )
                              }
                              error={errors[`beneficialOwners[${index}].shareholding`]}
                            />
                            <ChooseFile
                              file={beneficiar.proofOfIdentity}
                              label="Proof of Identity"
                              onDrop={(file) =>
                                changeBeneficiar(
                                  'proofOfIdentity',
                                  file,
                                  index,
                                  values.beneficialOwners,
                                  setFieldValue,
                                  `beneficialOwners[${index}].proofOfIdentity`
                                )
                              }
                              error={
                                errors[`beneficialOwners[${index}].proofOfIdentity`] &&
                                errors[`beneficialOwners[${index}].proofOfIdentity`]
                              }
                              handleDeleteClick={() =>
                                changeBeneficiar(
                                  'proofOfIdentity',
                                  null,
                                  index,
                                  values.beneficialOwners,
                                  setFieldValue,
                                  `beneficialOwners[${index}].proofOfIdentity`
                                )
                              }
                            />
                            <ButtonText
                              style={{
                                width: '100%',
                                minHeight: 18,
                                borderRadius: '8px',
                                border: 'solid 1px #222328',
                                padding: '18px 21px',
                              }}
                              onClick={(e) => {
                                e.preventDefault()
                                deleteBeneficiar(
                                  index,
                                  values?.beneficialOwners,
                                  values?.removedBeneficialOwners,
                                  setFieldValue
                                )
                              }}
                            >
                              <TrashNoBorder style={{ margin: 'auto' }} type="button" />
                            </ButtonText>
                          </FormGrid>
                        </Column>
                      ))}

                      <ExtraInfoCardCountry
                        style={{ fontSize: 16, padding: 15 }}
                        onClick={() => addBeneficiary(values.beneficialOwners, setFieldValue)}
                      >
                        <RowCenter style={{ color: '#fff' }}>
                          <Plus style={{ width: '20px', marginRight: '5px', cursor: 'pointer' }} />
                          <Box> Add Beneficiary </Box>
                        </RowCenter>
                      </ExtraInfoCardCountry>
                    </FormCard>

                    <FormCard id="corporate-members">
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Directors / Officers / Managers Information</Trans>
                        </TYPE.title7>
                        {corporateMembersFilled && <StyledBigPassed />}
                      </RowBetween>
                      <ExtraInfoCard style={{ marginBottom: 20 }}>
                        <TYPE.buttonMuted>
                          Please upload Proof of Identity (Passport, National ID or Driving License) dated within the
                          last 3 months.
                        </TYPE.buttonMuted>
                      </ExtraInfoCard>

                      {values.corporateMembers?.map((corporateMember: Record<string, string | any>, index: number) => (
                        <Column
                          style={{
                            gap: '20px',
                            marginBottom: '24px',
                            borderRadius: '8px',
                            border: 'solid 1px #222328',
                            padding: '24px 24px',
                          }}
                          key={index}
                        >
                          <FormGrid columns={3}>
                            <TextInput
                              label="Full Name"
                              value={corporateMember.fullName}
                              placeholder="Full Name"
                              onChange={(e: any) =>
                                changeCorporateMembers(
                                  'fullName',
                                  e.currentTarget.value,
                                  index,
                                  values.corporateMembers,
                                  setFieldValue,
                                  `corporateMembers[${index}].fullName`
                                )
                              }
                              error={
                                errors[`corporateMembers[${index}].fullName`] &&
                                errors[`corporateMembers[${index}].fullName`]
                              }
                            />
                            <TextInput
                              label="Nationality"
                              value={corporateMember.nationality}
                              placeholder="Nationality"
                              onChange={(e: any) =>
                                changeCorporateMembers(
                                  'nationality',
                                  e.currentTarget.value,
                                  index,
                                  values.corporateMembers,
                                  setFieldValue,
                                  `corporateMembers[${index}].nationality`
                                )
                              }
                              error={
                                errors[`corporateMembers[${index}].nationality`] &&
                                errors[`corporateMembers[${index}].nationality`]
                              }
                            />
                            <TextInput
                              label="Designation"
                              value={corporateMember.designation}
                              placeholder="Designation"
                              onChange={(e: any) =>
                                changeCorporateMembers(
                                  'designation',
                                  e.currentTarget.value,
                                  index,
                                  values.corporateMembers,
                                  setFieldValue,
                                  `corporateMembers[${index}].designation`
                                )
                              }
                              error={
                                errors[`corporateMembers[${index}].designation`] &&
                                errors[`corporateMembers[${index}].designation`]
                              }
                            />
                          </FormGrid>
                          <FormGrid columns={1}>
                            <ChooseFile
                              file={corporateMember.proofOfIdentity}
                              label="Proof of Identity"
                              onDrop={(file) =>
                                changeCorporateMembers(
                                  'proofOfIdentity',
                                  file,
                                  index,
                                  values.corporateMembers,
                                  setFieldValue,
                                  `corporateMembers[${index}].proofOfIdentity`
                                )
                              }
                              error={
                                errors[`corporateMembers[${index}].proofOfIdentity`] &&
                                errors[`corporateMembers[${index}].proofOfIdentity`]
                              }
                              handleDeleteClick={() =>
                                changeCorporateMembers(
                                  'proofOfIdentity',
                                  null,
                                  index,
                                  values.corporateMembers,
                                  setFieldValue,
                                  `corporateMembers[${index}].proofOfIdentity`
                                )
                              }
                            />
                            <ButtonText
                              style={{
                                width: '100%',
                                minHeight: 18,
                                borderRadius: '8px',
                                border: 'solid 1px #222328',
                                padding: '18px 21px',
                              }}
                              onClick={(e) => {
                                e.preventDefault()
                                deleteCorporateMembers(
                                  index,
                                  values?.corporateMembers,
                                  values?.removedCorporateMembers,
                                  setFieldValue
                                )
                              }}
                            >
                              <TrashNoBorder style={{ margin: 'auto' }} type="button" />
                            </ButtonText>
                          </FormGrid>
                          {/* {values.corporateMembers.length - 1 > index && <Divider />} */}
                        </Column>
                      ))}

                      {errors.corporateMembers && (
                        <TYPE.small marginTop="4px" color={'red1'}>{t`${errors.corporateMembers}`}</TYPE.small>
                      )}
                      <ExtraInfoCardCountry
                        // type="button"
                        style={{ marginTop: 32, fontSize: 16, padding: 15 }}
                        onClick={() => addCorporateMember(values.corporateMembers, setFieldValue)}
                      >
                        <RowCenter style={{ color: '#fff' }}>
                          <Plus style={{ width: '20px', marginRight: '5px', cursor: 'pointer' }} />
                          <Box> Add Corporate Member </Box>
                        </RowCenter>
                      </ExtraInfoCardCountry>
                    </FormCard>

                    <FormCard id="upload">
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Corporate Documents</Trans>
                        </TYPE.title7>
                        {filesFilled && <StyledBigPassed />}
                      </RowBetween>
                      <ExtraInfoCard style={{ marginBottom: 20 }}>
                        <TYPE.buttonMuted>
                          Please upload the following documents. All documents should be dated within the last 3 months.
                          Type of document format supported is PDF, JPG and PNG.
                        </TYPE.buttonMuted>
                      </ExtraInfoCard>

                      <Column style={{ gap: '40px' }}>
                        <Uploader
                          title="Corporate documents"
                          subtitle="Certificate of Incorporation, Registration or Formation, Certificate of Good Standing, Memorandum and Articles of Association, Register of Shareholders, Directors, Managers and/or Officers, Board Resolution or Mandate authorizing the establishment of business relationship with AMM (Bahamas) Ltd, Partnership or Trust Agreement or Deed, or their respective equivalents."
                          files={values.corporateDocuments}
                          onDrop={(file: any) => {
                            handleDropImage(file, values, 'corporateDocuments', setFieldValue)
                          }}
                          error={errors.corporateDocuments && errors.corporateDocuments}
                          handleDeleteClick={handleImageDelete(
                            values,
                            'corporateDocuments',
                            values.removedDocuments,
                            setFieldValue
                          )}
                        />
                      </Column>
                    </FormCard>

                    <FormCard id="upload">
                      <RowBetween marginBottom="32px">
                        <TYPE.title7>
                          <Trans>Additional Documents</Trans>
                        </TYPE.title7>
                        {filesFilled && <StyledBigPassed />}
                      </RowBetween>
                      <ExtraInfoCard style={{ marginBottom: 20 }}>
                        <TYPE.buttonMuted>
                          Please upload the following documents. All documents should be dated within the last 3 months.
                          Type of document format supported is PDF, JPG and PNG.
                        </TYPE.buttonMuted>
                      </ExtraInfoCard>

                      <Column style={{ gap: '40px' }}>
                        <Uploader
                          title="Additional Documents"
                          subtitle={`For ${config?.name || 'IXS'} Launchpad Issuers and ${
                            config?.name || 'IXS'
                          } DEX Applicants, please also enclose the most recent financial documents (balance sheet, P&L statement or Annual Returns), Certificate of Incumbency and Company Organization Chart showing Ownership Structure (signed copy). All documents must be dated within the last 3 months.`}
                          files={values.financialDocuments}
                          onDrop={(file: any) => {
                            handleDropImage(file, values, 'financialDocuments', setFieldValue)
                          }}
                          error={errors.financialDocuments && errors.financialDocuments}
                          handleDeleteClick={handleImageDelete(
                            values,
                            'financialDocuments',
                            values.removedDocuments,
                            setFieldValue
                          )}
                        />
                      </Column>
                    </FormCard>
                  </Column>
                </FormContainer>

                <StyledStickyBox
                  style={{ width: isMobile ? '100%' : 296, maxWidth: isMobile ? '100%' : 296 }}
                  offsetTop={100}
                >
                  <KYCProgressBar
                    handleSubmit={handleSubmit}
                    handleSaveProgress={() => saveProgress(form?.current?.values)}
                    // disabled={!dirty || !canSubmit || Object.keys(errors).length !== 0}
                    disabled={!canSubmit || Object.keys(errors).length !== 0}
                    topics={Object.values({
                      info: {
                        title: 'Corporate Information',
                        href: 'info',
                        passed: infoFilled,
                      },
                      authorizedPersonnel: {
                        title: 'Authorized Personnel',
                        href: 'authorizedPersonnel',
                        passed: authorizedPersonnelFilled,
                      },
                      address: {
                        title: 'Address',
                        href: 'address',
                        passed: addressFilled,
                      },
                      residentialAddress: {
                        title: 'Registered Address',
                        href: 'residentialAddress',
                        passed: residentialAddressFilled,
                      },
                      funds: {
                        title: 'Source of Funds',
                        href: 'funds',
                        passed: fundsFilled,
                      },
                      fatca: {
                        title: 'FATCA',
                        href: 'fatca',
                        passed: fatcaFilled,
                      },
                      taxDeclaration: {
                        title: 'Tax Declaration',
                        href: 'tax-declaration',
                        passed: taxDeclarationFilled,
                      },
                      beneficialOwners: {
                        title: 'Beneficial Owners Information',
                        href: 'beneficial-owners',
                        passed: beneficialOwnersFilled,
                      },
                      corporateMembers: {
                        title: 'Directors / Officers / Managers Information',
                        href: 'corporate-members',
                        passed: corporateMembersFilled,
                      },
                      upload: {
                        title: 'Corporate Documents',
                        href: 'upload',
                        passed: filesFilled,
                      },
                    })}
                    description={kyc?.message || null}
                    reasons={['Last name', 'Gender', 'Middle name']}
                  />
                </StyledStickyBox>
              </FormRow>
            )
          }}
        </Formik>
      </StyledBodyWrapper>
    </Loadable>
  )
}
