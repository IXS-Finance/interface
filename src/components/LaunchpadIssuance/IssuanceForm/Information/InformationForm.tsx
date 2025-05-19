import React, { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import { getData } from 'country-list'
import { useHistory } from 'react-router-dom'
import Portal from '@reach/portal'
import { FormikProps, setNestedObjectValues } from 'formik'
import Big from 'big.js'

import { useShowError } from 'state/application/hooks'
import { OfferReview } from '../Review'
import { IssuanceStatus, SMART_CONTRACT_STRATEGIES } from 'components/LaunchpadIssuance/types'
import { getMinutesAfter, getMinutesBefore } from 'utils/time'
import { text1, text44 } from 'components/LaunchpadMisc/typography'
import { filterNumberWithDecimals, integerNumberFilter, numberFilter, uppercaseFilter } from 'utils/input'
import { isDraftDisabled, isSubmitDisabled } from 'components/LaunchpadIssuance/utils/form'
import { OfferTokenStandart } from 'state/launchpad/types'

import { IssuanceActionButtons } from './sections/IssuanceActionButtons'
import { FAQBlock } from './sections/FAQ'
import { GalleryBlock } from './sections/Gallery'
import { TeamMembersBlock } from './sections/TeamMembers'
import { UploadDocuments } from './sections/UploadDocuments'
import { AdditionalInformation } from './sections/AdditionalInformation'

import {
  industryOptions,
  tokenTypeOptions as defaultTokenTypeOptions,
  tokenTypeOptionsByNetwork,
  networkOptions,
  standardOptions,
  distributionFrequencyOptions,
  investmentStructureOptions,
  isDefinedNumber,
  ERC20Option,
  calculateSupplyForSale,
} from './util'

import { InformationFormValues } from './types'
import { Column, Row, Separator, Spacer, LoaderContainer } from 'components/LaunchpadMisc/styled'
import { Loader } from 'components/LaunchpadOffer/util/Loader'
import { OutlineButton, FilledButton } from 'components/LaunchpadMisc/buttons'
import { ConfirmationForm } from 'components/Launchpad/ConfirmForm'
import { BaseCheckboxWithLabel } from 'components/LaunchpadOffer/InvestDialog/utils/Checkbox'
import { FormGrid } from '../shared/FormGrid'
import { FormField } from '../shared/fields/FormField'
import { ImageField } from '../shared/fields/ImageField'
import { DropdownField } from '../shared/fields/DropdownField'
import { TextareaField } from '../shared/fields/TextareaField'
import { CloseConfirmation } from '../shared/CloseConfirmation'
import { DateRangeField } from '../shared/fields/DateRangeField'
import { RejectInfo } from '../shared/RejectInfo'
import { FormSideBar, FormBody } from '../shared/styled'
import { IssuanceTooltip } from '../shared/fields/IssuanceTooltip'
import { text10 } from 'components/LaunchpadMisc/typography'
import { useWhitelabelState } from 'state/whitelabel/hooks'

interface Props {
  formikProps: FormikProps<InformationFormValues>
  setShowConfirmDialog: (foo: boolean) => void
  showConfirmDialog: boolean
  showCloseDialog: boolean
  issuanceId: number | string
  onConfirmationClose: () => void
  edit: boolean
  submit: (values: InformationFormValues) => void
  _submit: (values: InformationFormValues, draft: boolean) => void
  isLoading: boolean
  offerData?: InformationFormValues
  initialValues: InformationFormValues
  smartContractStrategy?: SMART_CONTRACT_STRATEGIES
  refetch?: () => void
}

export const InformationForm = (props: Props) => {
  const { config } = useWhitelabelState()

  const {
    formikProps,
    setShowConfirmDialog,
    showConfirmDialog,
    showCloseDialog,
    issuanceId,
    onConfirmationClose,
    edit,
    submit,
    _submit,
    isLoading,
    offerData,
    initialValues,
    smartContractStrategy,
  } = props
  const { values, errors, touched, setFieldValue, setFieldTouched, submitForm, resetForm, validateForm, setTouched } =
    formikProps

  // hooks
  const history = useHistory()
  const showError = useShowError()

  // memos
  const draftDisabled = useMemo(() => isDraftDisabled(errors, touched), [errors, touched])
  const submitDisabled = useMemo(() => isSubmitDisabled(errors, touched), [errors, touched])
  const countries = useMemo(() => {
    return getData().map((country) => ({ value: country.code, label: country.name }))
  }, [])
  const showSupplyHint = useMemo(
    () =>
      smartContractStrategy === SMART_CONTRACT_STRATEGIES.original && values.tokenStandart === OfferTokenStandart.erc20,
    [smartContractStrategy, values.tokenStandart]
  )
  const supplyHintValue = useMemo(
    () => calculateSupplyForSale(values),
    [
      showSupplyHint,
      values.tokenPrice,
      values.hasPresale,
      values.presaleTokenPrice,
      values.presaleAlocated,
      values.hardCap,
    ]
  )
  const filteredStandardOptions = useMemo(() => {
    return smartContractStrategy === SMART_CONTRACT_STRATEGIES.nonOriginalWithNoAccess ? [ERC20Option] : standardOptions
  }, [smartContractStrategy])

  // states
  const [showReview, setShowReview] = useState(false)
  const [isReset, setReset] = useState(false)
  const [tokenTypeOptions, setTokenTypeOptions] = useState(defaultTokenTypeOptions)

  // callbacks
  const saveDraft = useCallback((values: InformationFormValues) => _submit(values, true), [_submit])

  // methods
  const toSubmit = () => setShowConfirmDialog(true)

  const onSubmit = async () => {
    const newErrors = await validateForm()

    const shouldSubmit = !Object.keys(newErrors).length
    if (shouldSubmit) {
      submitForm()
    } else {
      setTouched(setNestedObjectValues(newErrors, true))
      showError('Unable to submit. Please check the form for errors.')
      setShowConfirmDialog(false)
    }
  }

  const onChangeTokenStandart = (value: OfferTokenStandart) => {
    setFieldValue('tokenStandart', value)
    if (value === OfferTokenStandart.xtokenlite) {
      setFieldValue('totalSupply', '')
      setFieldTouched('totalSupply', false)

      setFieldValue('tokenReceiverAddress', '')
      setFieldTouched('tokenReceiverAddress', false)
    }
  }

  const setPresale = (value: boolean) => {
    setFieldValue('timeframe.whitelist', undefined)
    setFieldValue('timeframe.preSale', undefined)
    setFieldValue('timeframe.sale', undefined)
    setFieldValue('timeframe.closed', undefined)
    setFieldValue('timeframe.claim', undefined)

    if (!value) {
      setFieldValue('presaleAlocated', '')
      setFieldValue('presaleMaxInvestment', '')
      setFieldValue('presaleMinInvestment', '')
    }

    setFieldValue('hasPresale', value)
  }

  const onSaveError = () => {
    onConfirmationClose()
    showError('Cannot save changes, please check the form for error messages')
  }

  const handleDateError = (field: string, errorText: string) => {
    const currentErrors = (errors as any)[field] || []
    const updatedErrors = [...currentErrors, ...errorText]
    setFieldValue(field, updatedErrors)
  }

  useEffect(() => {
    if (values.network) {
      const options = tokenTypeOptionsByNetwork[values.network]
      setTokenTypeOptions(options)

      if (options && !options.find((option: any) => option.value === values.tokenType)) {
        setFieldValue('tokenType', undefined)
      }
    }
  }, [values.network])

  return (
    <>
      <ConfirmationForm isOpen={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} onSave={onSubmit} />
      <CloseConfirmation
        isOpen={showCloseDialog}
        onDiscard={() => history.push(`/issuance/create?id=${issuanceId}`)}
        onClose={onConfirmationClose}
        onSave={() => {
          if (edit) {
            if (submitDisabled) return onSaveError()
            submit(values)
          } else {
            if (draftDisabled) return onSaveError()
            saveDraft(values)
          }
          onConfirmationClose()
        }}
      />
      {showReview && (
        <Portal>
          <OfferReview
            values={values}
            onClose={() => setShowReview(false)}
            onSubmit={(draft: boolean) => _submit(values, draft)}
            draftDisabled={draftDisabled}
            submitDisabled={submitDisabled}
          />
        </Portal>
      )}
      {isLoading && (
        <LoaderContainer width="100vw" height="100vh">
          <Loader />
        </LoaderContainer>
      )}
      <FormSideBar>
        {!isReset &&
          [IssuanceStatus.changesRequested, IssuanceStatus.declined].includes(offerData?.status as IssuanceStatus) && (
            <RejectInfo
              message={offerData?.reasonRequested}
              longMessage={offerData?.changesRequested}
              status={offerData?.status}
              issuanceId={issuanceId}
              onClear={() => {
                resetForm({ values: initialValues })
                setReset(true)
              }}
              onSubmit={toSubmit}
            />
          )}
        <IssuanceActionButtons
          onSaveDraft={() => saveDraft(values)}
          showDraft={!edit}
          onReview={() => setShowReview(true)}
          onSubmit={toSubmit}
          submitDisabled={submitDisabled}
          draftDisabled={draftDisabled}
          offerId={offerData?.id}
          status={offerData?.status as any}
          isReset={isReset}
          refetch={props.refetch}
        />
      </FormSideBar>
      <FormBody>
        <ImageBlock>
          <ImageField
            label="Profile Picture"
            image={values.profilePicture?.file}
            field="profilePicture"
            setter={setFieldValue}
            touch={setFieldTouched}
            error={errors.profilePicture as string}
          />

          <ImageField
            label="Deal Card's Image"
            image={values.cardPicture?.file}
            field="cardPicture"
            setter={setFieldValue}
            touch={setFieldTouched}
            error={errors.cardPicture as string}
          />
        </ImageBlock>

        <TextareaField
          value={values.shortDescription}
          label="Short Description"
          placeholder="A brief description on your deal card. 120-150 characters."
          field="shortDescription"
          setter={setFieldValue}
          touch={setFieldTouched}
          error={(touched.shortDescription && errors.shortDescription) as string}
          maxLength={150}
        />

        <FormGrid>
          <FormField
            field="title"
            setter={(field, value) => {
              setFieldValue(field, value)
              setFieldValue('tokenName', value)
            }}
            touch={(field, touched) => {
              setFieldTouched(field, touched)
              setFieldTouched('tokenName', touched)
            }}
            label="Name of Issuance"
            placeholder="Name of Issuance"
            disabled={edit}
            value={values.title}
            error={(touched.title && errors.title) as string}
          />

          <FormField
            field="issuerIdentificationNumber"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Company Identification Number"
            placeholder="Company Identification Number"
            disabled={edit}
            value={values.issuerIdentificationNumber}
            error={(touched.issuerIdentificationNumber && errors.issuerIdentificationNumber) as string}
            maxLength={64}
          />

          <DropdownField
            field="industry"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Industry"
            options={industryOptions}
            value={values.industry}
            error={(touched.industry && errors.industry) as string}
          />

          <DropdownField
            field="investmentType"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Investment Type"
            options={investmentStructureOptions}
            value={values.investmentType}
            error={(touched.investmentType && errors.investmentType) as string}
          />

          <DropdownField
            field="country"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Deal Country"
            options={countries}
            searchable
            value={values.country}
            error={(touched.country && errors.country) as string}
          />

          <div id="empty-row" />
          <BaseCheckboxWithLabel
            state={Boolean(values.allowOnlyAccredited)}
            toggle={() => setFieldValue('allowOnlyAccredited', !values.allowOnlyAccredited)}
            disabled={edit}
            label="Accredited investors only"
            labelStyle={{ fontSize: '14px' }}
          />
        </FormGrid>

        <Separator />
        <FormGrid title="Tokenomics">
          <FormField
            field="tokenName"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Token Name"
            placeholder="Is usually the same as the issuance name"
            disabled={edit}
            value={values.tokenName}
            error={(touched.tokenName && errors.tokenName) as string}
            maxLength={64}
          />
          <FormField
            field="tokenTicker"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Token Ticker"
            placeholder="2-10 letters"
            disabled={edit}
            inputFilter={uppercaseFilter}
            value={values.tokenTicker}
            error={(touched.tokenTicker && errors.tokenTicker) as string}
          />
          <FormField
            field="decimals"
            setter={(field, value) => setFieldValue(field, isDefinedNumber(value) ? Number(value) : null)}
            touch={setFieldTouched}
            label="Decimals"
            placeholder="Decimals"
            inputFilter={integerNumberFilter}
            disabled={edit}
            value={values.decimals?.toString()}
            error={(touched.decimals && errors.decimals) as string}
            maxLength={6}
          />
          {smartContractStrategy === SMART_CONTRACT_STRATEGIES.original && (
            <FormField
              field="trusteeAddress"
              setter={setFieldValue}
              touch={setFieldTouched}
              label="Trustee Address"
              placeholder="Trustee Address"
              disabled={edit}
              value={values.trusteeAddress}
              error={(touched.trusteeAddress && errors.trusteeAddress) as string}
              maxLength={64}
              trailing={
                <IssuanceTooltip
                  tooltipContent={
                    'The trustee wallet is a "super admin" and has the power to change the owner of the wallet in case of unforeseen or unavoidable situations. '
                  }
                />
              }
            />
          )}

          {smartContractStrategy !== SMART_CONTRACT_STRATEGIES.original && (
            <FormField
              field="tokenAddress"
              setter={setFieldValue}
              touch={setFieldTouched}
              label="Token Address"
              placeholder="Token Address"
              disabled={edit}
              value={values.tokenAddress}
              error={(touched.tokenAddress && errors.tokenAddress) as string}
              maxLength={64}
            />
          )}
          <DropdownField
            field="tokenType"
            setter={setFieldValue}
            touch={setFieldTouched}
            options={tokenTypeOptions}
            label="Token to Make Issuance in"
            placeholder="Token Type"
            disabled={edit}
            value={values.tokenType}
            error={(touched.tokenType && errors.tokenType) as string}
          />
          <DropdownField
            field="network"
            setter={setFieldValue}
            touch={setFieldTouched}
            options={networkOptions}
            label="Blockchain Network"
            placeholder="Blockchain Network"
            disabled={edit}
            value={values.network}
            error={(touched.network && errors.network) as string}
          />
          <FormField
            field="hardCap"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Total Amount to Raise (Amount in the selected token type)"
            placeholder="Total Amount to Raise"
            inputFilter={numberFilter}
            disabled={edit}
            value={values.hardCap}
            error={(touched.hardCap && errors.hardCap) as string}
            maxLength={64}
          />
          <FormField
            field="softCap"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Minimum Amount to Raise (Amount in the selected token type)"
            placeholder="Minimum Amount to Raise"
            inputFilter={numberFilter}
            disabled={edit}
            value={values.softCap}
            error={(touched.softCap && errors.softCap) as string}
            maxLength={64}
          />
          <FormField
            field="tokenPrice"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Public sale Price"
            placeholder="Public sale Price"
            inputFilter={numberFilter}
            disabled={edit}
            value={values.tokenPrice?.toString()}
            error={(touched.tokenPrice && errors.tokenPrice) as string}
            trailing={
              <IssuanceTooltip
                tooltipContent={
                  'The price input is based on the denominated currency selected under "Investment Currency".\nFor example, if you select USDC as the base currency, the price input will be in USDC.'
                }
              />
            }
            maxLength={64}
          />
          <DropdownField
            field="tokenStandart"
            setter={(_, value: any) => onChangeTokenStandart(value)}
            touch={setFieldTouched}
            options={filteredStandardOptions}
            label="Token Standard"
            placeholder="Token Standard"
            disabled={edit}
            value={values.tokenStandart}
            error={(touched.tokenStandart && errors.tokenStandart) as string}
          />
          {smartContractStrategy === SMART_CONTRACT_STRATEGIES.original && (
            <>
              <FormField
                field="totalSupply"
                setter={setFieldValue}
                touch={setFieldTouched}
                label="Total supply"
                placeholder="No. of Tokens"
                inputFilter={numberFilter}
                disabled={edit || values.tokenStandart !== OfferTokenStandart.erc20}
                value={`${values.totalSupply}`}
                error={(touched.totalSupply && errors.totalSupply) as string}
                maxLength={64}
              />
              <FormField
                field="tokenReceiverAddress"
                setter={setFieldValue}
                touch={setFieldTouched}
                label="Token receiver address"
                placeholder="Token receiver address"
                disabled={edit || values.tokenStandart !== OfferTokenStandart.erc20}
                value={`${values.tokenReceiverAddress}`}
                error={(touched.tokenReceiverAddress && errors.tokenReceiverAddress) as string}
                trailing={
                  <IssuanceTooltip tooltipContent={"It's a wallet address that will receive remaining tokens"} />
                }
                maxLength={64}
              />
            </>
          )}
          <FormField
            field="minInvestment"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Minimum Investment per Investor (Amount in the selected token type)"
            placeholder="No. of Tokens"
            inputFilter={numberFilter}
            disabled={edit}
            value={values.minInvestment}
            error={(touched.minInvestment && errors.minInvestment) as string}
            padding={'1rem 4px 1rem 1.25rem'}
            maxLength={64}
          />
          <FormField
            field="maxInvestment"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Maximum Investment per Investor (Amount in the selected token type)"
            placeholder="No. of Tokens"
            inputFilter={numberFilter}
            disabled={edit}
            value={values.maxInvestment}
            error={(touched.maxInvestment && errors.maxInvestment) as string}
            padding={'1rem 4px 1rem 1.25rem'}
            maxLength={64}
          />

          <Column gap="1rem">
            <BaseCheckboxWithLabel
              state={Boolean(values.tokenomicsAgreement)}
              toggle={() => {
                setFieldTouched('tokenomicsAgreement', true)
                setFieldValue('tokenomicsAgreement', !values.tokenomicsAgreement)
              }}
              disabled={edit}
              label={`I understand and agree that once I submit this form and it is approved, ${
                config?.name || 'IXS'
              } will mint and deposit the tokens into a smart contract based on the information provided.`}
            />
            {touched.tokenomicsAgreement && errors.tokenomicsAgreement && (
              <ErrorText>{errors.tokenomicsAgreement}</ErrorText>
            )}
          </Column>
        </FormGrid>

        <Separator />

        <FormGrid title="Pre-Sale">
          <PresaleFieldContainer disabled={edit}>
            <PresaleFieldLabel>Do you wish to apply a {'"Pre-Sale"'} stage to this deal?</PresaleFieldLabel>

            <Spacer />

            <PresaleButton isSelected={values.hasPresale === true} onClick={() => setPresale(true)} disabled={edit}>
              Yes
            </PresaleButton>

            <PresaleButton isSelected={values.hasPresale === false} onClick={() => setPresale(false)} disabled={edit}>
              No
            </PresaleButton>
          </PresaleFieldContainer>

          <FormField
            disabled={edit || !values.hasPresale}
            field="presaleAlocated"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Pre-Sale Allocation (Amount in the selected token type)"
            placeholder="Total fundraising amount allocated for Pre-Sale"
            inputFilter={numberFilter}
            value={values.presaleAlocated}
            error={(touched.presaleAlocated && errors.presaleAlocated) as string}
            maxLength={64}
          />

          <FormField
            disabled={edit || !values.hasPresale}
            field="presaleMaxInvestment"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Maximum Investment per Investor (Amount in the selected token type)"
            placeholder="No. of Tokens"
            inputFilter={numberFilter}
            value={values.presaleMaxInvestment}
            error={(touched.presaleMaxInvestment && errors.presaleMaxInvestment) as string}
            padding={'1rem 4px 1rem 1.25rem'}
            maxLength={64}
          />

          <FormField
            disabled={edit || !values.hasPresale}
            field="presaleMinInvestment"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Minimum Investment per Investor (Amount in the selected token type)"
            placeholder="No. of Tokens"
            inputFilter={numberFilter}
            value={values.presaleMinInvestment}
            error={(touched.presaleMinInvestment && errors.presaleMinInvestment) as string}
            padding={'1rem 4px 1rem 1.25rem'}
            maxLength={64}
          />

          <FormField
            span={2}
            disabled={edit || !values.hasPresale}
            field="presaleTokenPrice"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Pre-sale Price"
            placeholder="Pre-sale Price"
            inputFilter={numberFilter}
            value={values.presaleTokenPrice?.toString()}
            error={(touched.presaleTokenPrice && errors.presaleTokenPrice) as string}
            trailing={
              <IssuanceTooltip
                tooltipContent={
                  'The price input is based on the denominated currency selected under "Investment Currency".\nFor example, if you select USDC as the base currency, the price input will be in USDC.'
                }
              />
            }
            maxLength={64}
          />
        </FormGrid>

        {showSupplyHint && (
          <SupplyHintText>
            {supplyHintValue} tokens will be issued based on the price per token and total fundraising amount.
          </SupplyHintText>
        )}

        <Separator />

        <FormGrid
          title="Timeline"
          description={
            <>
              The timeline will be in the following order: Register To Invest {'>'} Pre-Sale {'>'} Public Sale {'>'}{' '}
              Token Claim. Exclude the Pre-Sale stage if you decide to not include this.
            </>
          }
        >
          <DateRangeField
            mode="single"
            showButton
            label="Register To Invest"
            field="timeframe.whitelist"
            setter={setFieldValue}
            value={values.timeframe.whitelist}
            disabled={edit || !values.hasPresale}
            minDate={moment().subtract(1, 'minute').toDate()}
            maxDate={values?.timeframe?.preSale ? getMinutesBefore(values?.timeframe?.preSale, 20) : undefined}
            onError={handleDateError}
            onChange={() => {
              setFieldTouched('timeframe.whitelist')
            }}
            error={`${
              (touched.timeframe?.whitelist && errors?.timeframe?.whitelist
                ? 'Please select a valid time'
                : '') as string
            }
            `}
          />

          <DateRangeField
            mode="single"
            showButton
            label="Pre-Sale"
            field="timeframe.preSale"
            setter={setFieldValue}
            value={values.timeframe.preSale}
            disabled={edit || !values.hasPresale || !values.timeframe.whitelist}
            minDate={getMinutesAfter(values?.timeframe?.whitelist, 20)}
            maxDate={values?.timeframe?.sale ? getMinutesBefore(values?.timeframe?.sale, 20) : undefined}
            onError={handleDateError}
            onChange={() => {
              setFieldTouched('timeframe.preSale')
            }}
            error={`${
              (touched.timeframe?.preSale && errors?.timeframe?.preSale ? 'Please select a valid time' : '') as string
            }
            `}
          />

          <DateRangeField
            mode="range"
            showButton
            label="Public Sale to Closed"
            field="timeframe.sale"
            value={[values.timeframe.sale, values.timeframe.closed].filter((x) => !!x).map((x) => moment(x))}
            disabled={edit || (values.hasPresale && !values.timeframe.preSale)}
            minDate={values.hasPresale ? getMinutesAfter(values.timeframe.preSale, 20) : new Date()}
            maxDate={values?.timeframe?.claim ? getMinutesBefore(values?.timeframe?.claim, 20) : undefined}
            onChange={([start, end]) => {
              setFieldTouched('timeframe.sale')
              setFieldTouched('timeframe.closed')
              setFieldValue('timeframe.sale', start)
              setFieldValue('timeframe.closed', end)
            }}
            onError={handleDateError}
            error={`
            ${
              (touched.timeframe?.closed && (errors?.timeframe?.closed || errors?.timeframe?.sale)
                ? 'Please select a valid time'
                : '') as string
            }`}
          />

          <DateRangeField
            mode="single"
            showButton
            label="Token Claim"
            field="timeframe.claim"
            setter={setFieldValue}
            disabled={edit || !values.timeframe.closed}
            minDate={getMinutesAfter(values.timeframe.closed, 20)}
            value={values.timeframe.claim}
            onError={handleDateError}
            onChange={() => {
              setFieldTouched('timeframe.claim')
            }}
            error={`${
              (touched.timeframe?.claim && errors?.timeframe?.claim ? 'Please select a valid time' : '') as string
            }
            `}
          />
        </FormGrid>

        <Separator />
        <FormGrid title="Offering Terms">
          <FormField
            field="terms.investmentStructure"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Investment Structure"
            placeholder="Holding Structure"
            disabled={edit}
            value={values.terms?.investmentStructure}
            error={
              (touched.terms?.investmentStructure && (touched.terms && errors.terms)?.investmentStructure) as string
            }
          />
          <FormField
            field="terms.dividentYield"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Dividend Yield"
            placeholder="In Percent"
            optional
            disabled={edit}
            value={values.terms?.dividentYield}
            error={(touched.terms?.dividentYield && (touched.terms && errors.terms)?.dividentYield) as string}
            inputFilter={filterNumberWithDecimals}
            maxLength={64}
          />
          <FormField
            field="terms.investmentPeriod"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Investment Period"
            placeholder="In months"
            optional
            disabled={edit}
            value={values.terms?.investmentPeriod?.toString()}
            error={(touched.terms?.investmentPeriod && (touched.terms && errors.terms)?.investmentPeriod) as string}
            inputFilter={integerNumberFilter}
            maxLength={64}
          />
          <FormField
            field="terms.grossIrr"
            setter={setFieldValue}
            touch={setFieldTouched}
            label="Gross IRR (%)"
            placeholder="In percent"
            optional
            disabled={edit}
            value={values.terms?.grossIrr}
            error={(touched.terms?.grossIrr && (touched.terms && errors.terms)?.grossIrr) as string}
            inputFilter={filterNumberWithDecimals}
            maxLength={64}
          />

          <DropdownField
            span={2}
            label="Distribution Frequency"
            placeholder="Frequency of return distribution"
            field="terms.distributionFrequency"
            setter={setFieldValue}
            touch={setFieldTouched}
            options={distributionFrequencyOptions}
            optional
            disabled={edit}
            value={values.terms?.distributionFrequency}
            error={
              (touched.terms?.distributionFrequency && (touched.terms && errors.terms)?.distributionFrequency) as string
            }
          />
        </FormGrid>

        <Separator />

        <AdditionalInformation
          setter={setFieldValue}
          touch={setFieldTouched}
          values={values}
          errors={errors}
          touched={touched}
        />

        <Separator />

        <UploadDocuments
          documents={values.additionalDocuments}
          otherExecutionDocuments={values.otherExecutionDocuments}
        />

        <Separator />

        <GalleryBlock
          description={values.longDescription}
          images={values.images}
          videos={values.videos}
          setter={setFieldValue}
          touch={setFieldTouched}
          errors={errors}
          touched={touched}
        />

        <Separator />

        <TeamMembersBlock members={values.members} />

        <Separator />

        <FAQBlock faq={values.faq} />

        <Row justifyContent="flex-end" gap="1rem" alignItems="center">
          {!edit && (
            <OutlineButton
              style={{ border: '1px solid #6666FF33' }}
              disabled={draftDisabled}
              onClick={() => saveDraft(values)}
            >
              Save Draft
            </OutlineButton>
          )}

          {offerData?.status !== undefined && offerData?.status !== IssuanceStatus.draft && (
            <OutlineButton style={{ border: '1px solid #6666FF33' }} onClick={() => setShowReview(true)}>
              Review
            </OutlineButton>
          )}
          {(offerData?.status !== IssuanceStatus.declined || isReset) && (
            <FilledButton onClick={toSubmit} disabled={submitDisabled}>
              Submit
            </FilledButton>
          )}
        </Row>
      </FormBody>
    </>
  )
}

const ImageBlock = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 240px;
  gap: 1.5rem;
  place-content: stretch;
`

const PresaleFieldContainer = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 6px;
  ${(props) =>
    props.disabled &&
    `
    background: ${props.theme.launchpad.colors.foreground};
  `}
`

const PresaleFieldLabel = styled.div`
  ${text44}
  color: ${(props) => props.theme.launchpad.colors.text.title};
`

const PresaleButton = styled.button<{ isSelected: boolean; disabled?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: 1px solid ${(props) => props.theme.launchpad.colors.primary + '33'};
  border-radius: 6px;
  cursor: pointer;

  ${text1}

  background: ${(props) => props.theme.launchpad.colors.background};
  color: ${(props) => props.theme.launchpad.colors.primary};

  ${(props) =>
    props.isSelected === true &&
    `
    background: ${props.theme.launchpad.colors.primary};
    color: ${props.theme.launchpad.colors.text.light};
  `}

  ${(props) =>
    props.disabled &&
    `
    cursor: default;
  `}
`

const ErrorText = styled.div`
  color: ${(props) => props.theme.launchpad.colors.error};

  font-style: normal;
  font-weight: 500;
  font-size: 10px;
`

const SupplyHintText = styled(Column)`
  ${text10}
  color: ${(props) => props.theme.text5};
  grid-column: span 2;
  background: ${(props) => props.theme.launchpad.colors.foreground};
  padding: 1rem 1.25rem;
  border-radius: 8px;
`
