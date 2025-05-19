import React, { useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Field, FieldArray, FieldProps, FormikProps, setNestedObjectValues } from 'formik'
import { useHistory } from 'react-router-dom'
import { ArrowLeft, Plus } from 'react-feather'
import { ReactComponent as Trash } from 'assets/launchpad/svg/trash-icon.svg'
import { FilledButton, OutlineButton } from 'components/LaunchpadMisc/buttons'
import { LoaderContainer, Row, Separator } from 'components/LaunchpadMisc/styled'
import { VettingFormValues } from './types'
import { defaultValues } from 'components/LaunchpadIssuance/IssuanceForm/Vetting/util'
import { isDraftDisabled, isSubmitDisabled } from 'components/LaunchpadIssuance/utils/form'
import { IssuanceStatus } from 'components/LaunchpadIssuance/types'
import { useShowError } from 'state/application/hooks'
import { FormField } from '../shared/fields/FormField'
import { FileField } from '../shared/fields/FileField'
import { DirectorField } from '../shared/fields/DirectorField'
import { RejectInfo } from '../shared/RejectInfo'
import { FormContainer, FormHeader, FormTitle, FormSideBar, FormBody, DeleteButton } from '../shared/styled'
import { CloseConfirmation } from '../shared/CloseConfirmation'
import { ConfirmationForm } from 'components/Launchpad/ConfirmForm'
import { TextareaField } from '../shared/fields/TextareaField'
import { FormGrid } from '../shared/FormGrid'
import { Loader } from 'components/LaunchpadOffer/util/Loader'
import { textFilter } from 'utils/input'
import { text19 } from 'components/LaunchpadMisc/typography'
import { VettingActionButtons } from './VettingActionButtons'
import { StrategyCard } from './StrategyCard'
import { strategyOptions } from './constants'

interface Props {
  formikProps: FormikProps<VettingFormValues>
  view: boolean
  showConfirmDialog: boolean
  setShowConfirmDialog: (foo: boolean) => void
  issuanceId: number
  vettingId?: number
  initialValues?: VettingFormValues
  showCloseDialog: boolean
  setShowCloseDialog: (foo: boolean) => void
  goBack: () => void
  saveDraft: (values: VettingFormValues) => void
  isLoading: boolean
}

export const VettingForm = (props: Props) => {
  const {
    formikProps,
    view,
    showConfirmDialog,
    setShowConfirmDialog,
    issuanceId,
    vettingId,
    initialValues,
    showCloseDialog,
    setShowCloseDialog,
    goBack,
    saveDraft,
    isLoading,
  } = props
  const { submitForm, setFieldValue, values, errors, resetForm, touched, setFieldTouched, validateForm, setTouched } =
    formikProps

  // hooks
  const theme = useTheme()
  const showError = useShowError()
  const history = useHistory()

  // memos
  const draftDisabled = useMemo(() => view || isDraftDisabled(errors, touched), [view, errors, touched])
  const submitDisabled = useMemo(() => view || isSubmitDisabled(errors, touched), [view, errors, touched])

  // states
  const [isReset, setReset] = useState(false)

  // methods
  const toSubmit = () => setShowConfirmDialog(true)
  const onConfirmationClose = (hasError = false) => {
    setShowCloseDialog(false)
    if (hasError) {
      showError('Cannot save changes, please check the form for error messages')
    }
  }
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

  return (
    <FormContainer>
      <ConfirmationForm isOpen={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} onSave={onSubmit} />

      <CloseConfirmation
        isOpen={showCloseDialog}
        onDiscard={() => history.push(`/issuance/create?id=${issuanceId}`)}
        onClose={() => onConfirmationClose(false)}
        onSave={() => (draftDisabled ? onConfirmationClose(true) : saveDraft(values))}
      />

      {isLoading && (
        <LoaderContainer width="100vw" height="100vh">
          <Loader />
        </LoaderContainer>
      )}

      <FormHeader>
        <OutlineButton background="none" onClick={goBack} padding="1rem 0.75rem">
          <ArrowLeft color={theme.launchpad.colors.primary} />
        </OutlineButton>

        <FormTitle>Vetting</FormTitle>
      </FormHeader>

      <FormSideBar>
        {!isReset &&
          [IssuanceStatus.changesRequested, IssuanceStatus.declined].includes(
            initialValues?.status as IssuanceStatus
          ) && (
            <RejectInfo
              message={initialValues?.reasonRequested}
              longMessage={initialValues?.changesRequested}
              status={initialValues?.status}
              issuanceId={issuanceId}
              onClear={() => {
                resetForm({ values: defaultValues })
                setReset(true)
              }}
              onSubmit={toSubmit}
            />
          )}
        <VettingActionButtons
          onSaveDraft={() => saveDraft(values)}
          onSubmit={toSubmit}
          isView={view}
          draftDisabled={draftDisabled}
          submitDisabled={submitDisabled}
          vettingId={String(vettingId)}
          issuanceId={issuanceId}
          status={initialValues?.status}
          isReset={isReset}
        />
      </FormSideBar>

      <FormBody>
        <StrategyInfoBlock>
          {strategyOptions.map((strategy, idx) => (
            <StrategyCard
              key={strategy.option + idx}
              field="smartContractStrategy"
              id={strategy.option}
              checked={
                strategy.option ===
                (values.smartContractStrategy ? values.smartContractStrategy : defaultValues.smartContractStrategy)
              }
              option={strategy.option}
              text={strategy.text}
              tooltipContent={strategy.tooltipContent}
              disabled={view}
              setter={setFieldValue}
              touch={setFieldTouched}
            />
          ))}
        </StrategyInfoBlock>

        <Separator />

        <IssuerInfoBlock>
          <FormField
            label="Applicant's Full Name"
            placeholder="Full name of the Applicant"
            field="applicantFullName"
            setter={setFieldValue}
            touch={setFieldTouched}
            disabled={view}
            value={values.applicantFullName}
            error={touched.applicantFullName ? errors.applicantFullName : ''}
            inputFilter={textFilter}
          />

          <FormField
            label="Email Address"
            placeholder="Email Address"
            field="email"
            disabled={view}
            setter={setFieldValue}
            touch={setFieldTouched}
            value={values.email}
            error={touched.email ? errors.email : ''}
            inputFilter={textFilter}
          />

          <FormField
            label="Name of Company"
            placeholder="Name of your company"
            field="companyName"
            setter={setFieldValue}
            touch={setFieldTouched}
            disabled={view}
            value={values.companyName}
            error={touched.companyName ? errors.companyName : ''}
            inputFilter={textFilter}
          />

          <FormField
            label="Company Website"
            placeholder="Company Website"
            field="companyWebsite"
            setter={setFieldValue}
            touch={setFieldTouched}
            disabled={view}
            value={values.companyWebsite}
            error={touched.companyWebsite ? errors.companyWebsite : ''}
            inputFilter={textFilter}
          />
        </IssuerInfoBlock>

        <Separator />

        <DescriptionBlock>
          <FileField
            label="Upload the company's pitch deck"
            field="document.pitchDeck"
            setter={setFieldValue}
            touch={setFieldTouched}
            disabled={view}
            value={values.document.pitchDeck}
            error={(touched.document?.pitchDeck && errors.document?.pitchDeck) as string}
            isDocument
          />

          <FieldArray name="fundingDocuments">
            {({ push, handleRemove }) => (
              <>
                <AdditionalFiles>
                  <Hint>Upload additional documents relevant to the funding objective. (Optional)</Hint>

                  <AddDocumentButton padding="0" onClick={() => push({ file: null })} disabled={view}>
                    <Plus size="14" /> Add Document
                  </AddDocumentButton>
                </AdditionalFiles>

                <FundingDocumentsGrid>
                  {values.fundingDocuments.map((entry, idx) => (
                    <Field name={`fundingDocuments[${idx}].file`} key={idx}>
                      {({ field: { name, value, onChange }, meta }: FieldProps) => (
                        <FileField
                          error={meta.touched ? meta.error : ''}
                          value={value}
                          disabled={view}
                          field={name}
                          setter={(name: string, value: any) =>
                            onChange({
                              target: { name, value },
                            })
                          }
                          touch={setFieldTouched}
                          trailing={
                            !view && (
                              <DeleteButton onClick={handleRemove(idx)}>
                                <Trash />
                              </DeleteButton>
                            )
                          }
                          isDocument
                        />
                      )}
                    </Field>
                  ))}
                </FundingDocumentsGrid>
              </>
            )}
          </FieldArray>

          <TextareaField
            label="Description"
            placeholder="Short description of the company/offering"
            field="description"
            disabled={view}
            setter={setFieldValue}
            touch={setFieldTouched}
            span={3}
            value={values.description}
            error={touched.description ? errors.description : ''}
          />
        </DescriptionBlock>

        <Separator />

        <FilesBlock>
          <FileField
            label="Certificate of Incorporation"
            disabled={view}
            hint="File size should not exceed 5.0 MB. Supported file formats are doc, docx, PNG, JPG, JPEG and PDF"
            field="document.certificateOfIncorporation"
            value={values.document.certificateOfIncorporation}
            error={
              (touched.document?.certificateOfIncorporation && errors.document?.certificateOfIncorporation) as string
            }
            setter={setFieldValue}
            touch={setFieldTouched}
            isDocument
          />
          <FileField
            optional
            label="Certificate of Incumbency"
            disabled={view}
            hint="File size should not exceed 5.0 MB. Supported file formats are doc, docx, PNG, JPG, JPEG and PDF"
            field="document.certificateOfIncumbency"
            value={values.document.certificateOfIncumbency}
            error={(touched.document?.certificateOfIncumbency && errors.document?.certificateOfIncumbency) as string}
            setter={setFieldValue}
            touch={setFieldTouched}
            isDocument
          />

          <FileField
            label="Share & Director Registry"
            disabled={view}
            hint="File size should not exceed 5.0 MB. Supported file formats are doc, docx, PNG, JPG, JPEG and PDF"
            field="document.shareDirectorRegistry"
            value={values.document.shareDirectorRegistry}
            error={(touched.document?.shareDirectorRegistry && errors.document?.shareDirectorRegistry) as string}
            setter={setFieldValue}
            touch={setFieldTouched}
            isDocument
          />
          <FileField
            optional
            label="Copy of Audited Financials"
            disabled={view}
            hint="Document must cover the last 3 years or the most recent financials dated within the last 12 months.
                  Not applicable to licensed entities.
                  Supported file formats are doc, docx, PNG, JPG, JPEG and PDF"
            field="document.auditedFinancials"
            value={values.document.auditedFinancials}
            error={(touched.document?.auditedFinancials && errors.document?.auditedFinancials) as string}
            setter={setFieldValue}
            touch={setFieldTouched}
            isDocument
          />

          <FileField
            label="Memorandum and Article of Association Company Constitution"
            disabled={view}
            hint="File size should not exceed 5.0 MB. Supported file formats are doc, docx, PNG, JPG, JPEG and PDF"
            field="document.memorandumArticle"
            value={values.document.memorandumArticle}
            error={(touched.document?.memorandumArticle && errors.document?.memorandumArticle) as string}
            setter={setFieldValue}
            touch={setFieldTouched}
            isDocument
          />
          <FileField
            label="Ownership Structure"
            hint={
              <div>
                <text>Supported file formats are doc, docx, PNG, JPG, JPEG and PDF.</text>
                <br />
                <ExampleLink
                  href="https://s3.eu-central-1.amazonaws.com/static.ixswap.io/ownership-structure-example.pdf"
                  target="_blank"
                >
                  See Examples
                </ExampleLink>
              </div>
            }
            field="document.ownershipStructure"
            value={values.document.ownershipStructure}
            error={(touched.document?.ownershipStructure && errors.document?.ownershipStructure) as string}
            disabled={view}
            setter={setFieldValue}
            touch={setFieldTouched}
            isDocument
          />

          <FileField
            label="Resolution of Authorized Signatory List"
            hint="Document must include specimen signatures or equivalent. Supported file formats are doc, docx, PNG, JPG, JPEG and PDF"
            field="document.resolutionAuthorizedSignatory"
            value={values.document.resolutionAuthorizedSignatory}
            error={
              (touched.document?.resolutionAuthorizedSignatory &&
                errors.document?.resolutionAuthorizedSignatory) as string
            }
            disabled={view}
            setter={setFieldValue}
            touch={setFieldTouched}
            isDocument
          />
        </FilesBlock>

        <Separator />

        <DirectorField
          directorTitle="Beneficial Owner"
          directors={values.beneficialOwners}
          setter={setFieldValue}
          disabled={view}
          field="beneficialOwners"
        />

        <DirectorField
          directorTitle="Director"
          disabled={view}
          directors={values.directors}
          setter={setFieldValue}
          field="directors"
        />
        <Row justifyContent="flex-end" alignItems="center" gap="1.5rem">
          <OutlineButton style={{ border: '1px solid #6666FF33' }} width="280px" onClick={goBack}>
            Back
          </OutlineButton>
          {!view && IssuanceStatus.approved !== initialValues?.status && (
            <FilledButton width="280px" onClick={toSubmit} disabled={submitDisabled}>
              Submit
            </FilledButton>
          )}
        </Row>
      </FormBody>
    </FormContainer>
  )
}

const StrategyInfoBlock = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
`

const IssuerInfoBlock = styled.div`
  display: grid;
  grid-template-rows: repeat(2, auto);
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
`

const DescriptionBlock = styled.div`
  display: grid;
  grid-template-rows: repeat(2, auto);
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    '. . .'
    'description description';
  gap: 2.5rem 1rem;
  align-items: end;
`

const AdditionalFiles = styled(FormGrid)`
  padding-top: 2.75rem;
  place-self: start;
`

const AddDocumentButton = styled(OutlineButton)`
  font-weight: 600;
`

const Hint = styled.div`
  ${text19}
  text-align: right;
  color: ${(props) => props.theme.launchpad.colors.text.hint};
`

const FilesBlock = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, auto);
  align-items: end;
  gap: 2rem;
`

const ExampleLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  ${text19}
  color: ${(props) => props.theme.launchpad.colors.primary};
`

const FundingDocumentsGrid = styled(FormGrid)`
  grid-column: span 3;
  gap: 0.5rem 2rem;
`
