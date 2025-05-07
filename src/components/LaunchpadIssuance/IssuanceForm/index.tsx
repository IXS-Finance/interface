import React, { useRef } from 'react'
import Portal from '@reach/portal'
import styled, { useTheme } from 'styled-components'

import { useHistory } from 'react-router-dom'

import { ArrowLeft, Check, ChevronDown } from 'react-feather'
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'

import { ReactComponent as VettingIcon } from 'assets/launchpad/svg/issuance-vetting-check.svg'
import { ReactComponent as IssuanceInformationIcon } from 'assets/launchpad/svg/issuance-information-icon.svg'
import { ReactComponent as IssuanceRejectedIcon } from 'assets/launchpad/svg/issuance-rejected.svg'
import { ReactComponent as IssuanceRequestedChangesIcon } from 'assets/launchpad/svg/issuance-requested-changes.svg'
import { ReactComponent as CrossIcon } from 'assets/launchpad/svg/close.svg'

import { Loader } from 'components/LaunchpadOffer/util/Loader'
import { FilledButton, OutlineButton } from 'components/LaunchpadMisc/buttons'
import { ContactForm } from 'components/Launchpad/KYCPrompt/ContactForm'
import { ExitIconContainer } from 'components/Launchpad/KYCPrompt/styled'

import { IssuanceFormStep } from './IssuanceFormStep'
import { IssuanceCreateButton } from '../IssuanceCreateButton'
import { IssuanceStatus } from '../types'
import { useGetIssuance, useGetIssuancePlain } from 'state/launchpad/hooks'
import { routes } from 'utils/routes'
import { DiscreteInternalLink } from 'theme'
import { useQueryParams } from 'hooks/useParams'
import { text30, text42, text53 } from 'components/LaunchpadMisc/typography'
import { useRole } from 'state/user/hooks'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { OfferStatus } from 'state/launchpad/types'
import { Line } from 'components/Line'
import { useWhitelabelState } from 'state/whitelabel/hooks'

export const NewIssuanceForm = () => {
  const theme = useTheme()
  const history = useHistory()
  const { isAdmin, isMasterTenant } = useRole()
  const { config } = useWhitelabelState()

  const issuance = useGetIssuance()
  const issuances = useGetIssuancePlain()

  const [contactFormOpen, setContactForm] = React.useState<boolean>(false)
  const [showDropdown, setShowDropdown] = React.useState(false)
  const ref = useRef<HTMLDivElement>()
  const [selectedIssuanceId, setSelectedIssuanceId] = React.useState<number | null>(null)
  useOnClickOutside(ref, showDropdown ? () => setShowDropdown(false) : undefined)

  const toggleContactForm = React.useCallback(() => setContactForm((state) => !state), [])
  const {
    objectParams: { id: issuanceId },
  } = useQueryParams<{ id: number }>(['id'])

  const vettingStatus = React.useMemo(() => issuance.data?.vetting?.status, [issuance.data])
  const issuanceStatus = React.useMemo(() => issuance.data?.vetting?.offer?.status, [issuance.data])
  const selectIssuance = React.useCallback(
    (id: number) => {
      if (window.history.pushState) {
        const url =
          window.location.protocol + '//' + window.location.host + '#' + history.location.pathname + `?id=${id}`

        window.history.pushState(null, '', url)
        issuance.load(id)
      }
    },
    [history]
  )
  const supportEmail = config?.supportEmail || 'c@ixs.finance'

  React.useEffect(() => {
    issuance.load(Number(issuanceId))
  }, [issuanceId])

  const approvedVetting = vettingStatus === IssuanceStatus.approved
  return (
    <Wrapper>
      <FormHeader>
        <BackButton as={DiscreteInternalLink} to={routes.issuance} background="none">
          <ArrowLeft color={theme.launchpad.colors.primary} />
        </BackButton>

        <FormTitle>New Issuance</FormTitle>

        <IssuanceNameContainer
          ref={ref as any}
          disabled={issuances.items?.length === 0}
          onClick={() => {
            if (issuances.items?.length > 0) {
              setShowDropdown((state) => !state)
            }
          }}
        >
          <IssuanceName>{issuance.data?.name}</IssuanceName>

          {issuances.items!.length > 1 && <DropDown style={{ cursor: 'pointer' }} />}

          {showDropdown && (
            <IssuanceList>
              {issuances.items.map((item) => (
                <>
                  <Line style={{ marginBottom: '3px' }} />
                  <IssuanceEntry
                    key={item.id}
                    onClick={() => {
                      selectIssuance(item.id)
                      setSelectedIssuanceId(item.id)
                      setShowDropdown(true)
                    }}
                    style={{
                      color:
                        selectedIssuanceId === null
                          ? Number(issuanceId) === item.id
                            ? 'blue'
                            : theme.launchpad.colors.text.title
                          : selectedIssuanceId === item?.id
                          ? 'blue'
                          : theme.launchpad.colors.text.title,
                    }}
                  >
                    {item.name}
                  </IssuanceEntry>
                </>
              ))}
            </IssuanceList>
          )}
        </IssuanceNameContainer>

        <NewIssuanceButtonContainer>
          <IssuanceCreateButton background={theme.launchpad.colors.background} />
        </NewIssuanceButtonContainer>
      </FormHeader>

      <FormContainer>
        {issuance.loading && (
          <LoaderContainer>
            <Loader />
          </LoaderContainer>
        )}

        {!issuance.loading && !issuance.data && (
          <LoaderContainer>
            <FormTitle>Issuance not found</FormTitle>
          </LoaderContainer>
        )}

        {!issuance.loading && issuance.data && (
          <>
            {(vettingStatus === undefined || vettingStatus === IssuanceStatus.draft) && (
              <IssuanceFormStep
                stepNumber={1}
                icon={<VettingIcon />}
                title="Initiate Vetting Process"
                description="The new issuance created will have to undergo a vetting process before it can be approved and issued to investors."
              >
                <FilledButton
                  width="320px"
                  color={theme.launchpad.colors.text.light}
                  background={theme.launchpad.colors.primary}
                  as={DiscreteInternalLink}
                  to={`/issuance/create/vetting?id=${issuance.data?.id}`}
                >
                  Proceed
                </FilledButton>
              </IssuanceFormStep>
            )}

            {approvedVetting && (
              <IssuanceFormStep
                stepNumber={1}
                icon={<VettingApprovedIcon />}
                title="Vetting is approved"
                description={
                  <>
                    To make changes to your application, please contact{' '}
                    <ContactEmail href={`mailto:${supportEmail}`}>{supportEmail}</ContactEmail>
                  </>
                }
              >
                <OutlineButton
                  color={theme.launchpad.colors.success}
                  background={theme.launchpad.colors.success + '0d'}
                  borderColor={theme.launchpad.colors.success + '4d'}
                  width="320px"
                >
                  Approved <Check color={theme.launchpad.colors.success} size="12" />
                </OutlineButton>

                <OutlineButton
                  style={{ border: '1px solid #6666FF33' }}
                  width="320px"
                  as={DiscreteInternalLink}
                  to={`/issuance/view/vetting?id=${issuance.data?.id}`}
                >
                  View Form
                </OutlineButton>
              </IssuanceFormStep>
            )}

            {vettingStatus === IssuanceStatus.declined && (
              <IssuanceFormStep
                stepNumber={1}
                icon={<IssuanceRejectedIcon />}
                title="Your application has been denied "
                description="See why your application got denied and try again."
              >
                <OutlineButton
                  color={theme.launchpad.colors.error}
                  background={theme.launchpad.colors.error + '0d'}
                  borderColor={theme.launchpad.colors.error + '4d'}
                  width="320px"
                  as={DiscreteInternalLink}
                  to={`/issuance/create/vetting?id=${issuance.data?.id}`}
                >
                  Try again
                </OutlineButton>

                <OutlineButton style={{ border: '1px solid #6666FF33' }} width="320px" onClick={toggleContactForm}>
                  Contact support
                </OutlineButton>
              </IssuanceFormStep>
            )}

            {vettingStatus === IssuanceStatus.changesRequested && (
              <IssuanceFormStep
                stepNumber={1}
                icon={<IssuanceRequestedChangesIcon />}
                title="Requested changes"
                description="Your application has requested an update."
              >
                <OutlineButton
                  color={theme.launchpad.colors.success}
                  background={theme.launchpad.colors.success + '0d'}
                  borderColor={theme.launchpad.colors.success + '4d'}
                  width="320px"
                  as={DiscreteInternalLink}
                  to={`/issuance/create/vetting?id=${issuance.data?.id}`}
                >
                  Update
                </OutlineButton>
              </IssuanceFormStep>
            )}

            {vettingStatus === IssuanceStatus.pendingApproval && (
              <IssuanceFormStep
                stepNumber={1}
                icon={<Loader color={theme.launchpad.colors.warn} />}
                title="Pending approval"
                description="We are looking over your application"
              >
                <OutlineButton
                  color={theme.launchpad.colors.warn}
                  background={theme.launchpad.colors.warn + '0d'}
                  borderColor={theme.launchpad.colors.warn + '4d'}
                  width="320px"
                  as={DiscreteInternalLink}
                  to={
                    isAdmin
                      ? `/issuance/create/vetting?id=${issuance.data?.id}`
                      : `/issuance/view/vetting?id=${issuance.data?.id}`
                  }
                >
                  Pending approval
                </OutlineButton>
              </IssuanceFormStep>
            )}

            {(issuanceStatus === undefined || issuanceStatus === OfferStatus.draft) && (
              <IssuanceFormStep
                stepNumber={2}
                icon={<IssuanceInformationIcon />}
                title="Issuance Information"
                description="All information provided about the new issuance created will be displayed to the investors."
              >
                <FilledButton
                  disabled={!approvedVetting}
                  width="320px"
                  color={theme.launchpad.colors.text.light}
                  background={theme.launchpad.colors.primary}
                  as={DiscreteInternalLink}
                  to={approvedVetting ? `/issuance/create/information?id=${issuance.data?.id}` : null}
                >
                  Proceed
                </FilledButton>
              </IssuanceFormStep>
            )}

            {issuanceStatus === OfferStatus.approved && (
              <IssuanceFormStep
                stepNumber={2}
                icon={<IssuanceApprovedIcon />}
                title="Issuance is approved"
                description={
                  <>
                    To make changes to your listing, please contact{' '}
                    <ContactEmail href={`mailto:${supportEmail}`}>{supportEmail}</ContactEmail>
                  </>
                }
              >
                <OutlineButton
                  color={theme.launchpad.colors.success}
                  background={theme.launchpad.colors.success + '0d'}
                  borderColor={theme.launchpad.colors.success + '4d'}
                  width="320px"
                >
                  Approved <Check color={theme.launchpad.colors.success} size="12" />
                </OutlineButton>

                <OutlineButton
                  style={{ border: '1px solid #6666FF33' }}
                  width="320px"
                  as={DiscreteInternalLink}
                  to={`/issuance/review/information?id=${issuance.data?.id}`}
                >
                  View Form
                </OutlineButton>
              </IssuanceFormStep>
            )}

            {issuanceStatus === OfferStatus.declined && (
              <IssuanceFormStep
                stepNumber={2}
                icon={<IssuanceRejectedIcon />}
                title="Your application has been denied "
                description="See why your listing got denied and try again."
              >
                <OutlineButton
                  color={theme.launchpad.colors.error}
                  background={theme.launchpad.colors.error + '0d'}
                  borderColor={theme.launchpad.colors.error + '4d'}
                  width="320px"
                  as={DiscreteInternalLink}
                  to={`/issuance/create/information?id=${issuance.data?.id}`}
                >
                  Try again
                </OutlineButton>

                <OutlineButton style={{ border: '1px solid #6666FF33' }} width="320px">
                  Contact support
                </OutlineButton>
              </IssuanceFormStep>
            )}

            {issuanceStatus === OfferStatus.changesRequested && (
              <IssuanceFormStep
                stepNumber={2}
                icon={<IssuanceRequestedChangesIcon />}
                title="Requested changes"
                description="Your listing has requested to be updated."
              >
                <OutlineButton
                  color={theme.launchpad.colors.success}
                  background={theme.launchpad.colors.success + '0d'}
                  borderColor={theme.launchpad.colors.success + '4d'}
                  width="320px"
                  as={DiscreteInternalLink}
                  to={`/issuance/create/information?id=${issuance.data?.id}`}
                >
                  Update
                </OutlineButton>
              </IssuanceFormStep>
            )}
            {issuanceStatus === OfferStatus.pendingApproval && (
              <IssuanceFormStep
                stepNumber={2}
                icon={<Loader color={theme.launchpad.colors.warn} />}
                title="Pending approval"
                description="We are looking over your listing"
              >
                <OutlineButton
                  color={theme.launchpad.colors.warn}
                  background={theme.launchpad.colors.warn + '0d'}
                  borderColor={theme.launchpad.colors.warn + '4d'}
                  width="320px"
                  as={DiscreteInternalLink}
                  to={
                    isAdmin || isMasterTenant
                      ? `/issuance/edit/information?id=${issuance.data?.id}`
                      : `/issuance/review/information?id=${issuance.data?.id}`
                  }
                >
                  Pending approval
                </OutlineButton>
              </IssuanceFormStep>
            )}

            {contactFormOpen && (
              <Portal>
                <ModalWrapper>
                  <ContactFormWrapper>
                    <ExitIconContainer onClick={toggleContactForm}>
                      <CrossIcon />
                    </ExitIconContainer>

                    <ContactForm issuanceId={issuance.data?.id} onSubmit={() => setContactForm(false)} />
                  </ContactFormWrapper>
                </ModalWrapper>
              </Portal>
            )}
          </>
        )}
      </FormContainer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 1rem;
  max-width: 1300px;
  padding: 1rem;
  margin: auto;
  margin-top: 20px;
`

const FormHeader = styled.div`
  display: grid;
  grid-template-columns: 50px 230px 1fr 180px;
  grid-template-rows: repeat(2, 48px);
  grid-template-areas:
    'back title . button'
    'name name . .';

  place-content: center stretch;
  gap: 1rem;
`

const FormContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 530px;
  place-content: stretch;
  gap: 1.5rem;

  position: relative;
`

const IssuanceNameContainer = styled.div<{ disabled: boolean }>`
  grid-area: name;
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  background: ${(props) =>
    props.disabled ? props.theme.launchpad.colors.disabled : props.theme.launchpad.colors.background};
  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 6px;
`

const IssuanceName = styled.div`
  ${text42}
  width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: ${(props) => props.theme.launchpad.colors.text.title};
`

const FormTitle = styled.div`
  grid-area: title;
  place-self: center start;

  ${text53}

  color: ${(props) => props.theme.launchpad.colors.text.title};
`

const BackButton = styled(FilledButton)`
  grid-area: back;
  padding: 0;

  // background: ${(props) => props.theme.launchpad.colors.background};
  // border: 1px solid ${(props) => props.theme.launchpad.colors.primary + '14'};
  // border-radius: 6px;
`

const NewIssuanceButtonContainer = styled.div`
  grid-area: button;
  place-self: center end;
`

const VettingApprovedIcon = styled(VettingIcon)`
  path {
    stroke: ${(props) => props.theme.launchpad.colors.success};
  }
`

const IssuanceApprovedIcon = styled(IssuanceInformationIcon)`
  path {
    stroke: ${(props) => props.theme.launchpad.colors.success};
  }
`

const ContactEmail = styled.a`
  color: ${(props) => props.theme.launchpad.colors.primary};

  text-decoration: none;
`

const IssuanceList = styled.div`
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  right: 0;
  transform: translate(0, 100%);
  z-index: 30;
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  max-height: 300px;
  overflow-y: auto;

  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 6px;
`

const IssuanceEntry = styled.div`
  padding: 0.5rem 1rem;
  ${text30}
  cursor: pointer;
  background: ${(props) => props.theme.launchpad.colors.background};
  color: ${(props) => props.theme.launchpad.colors.text.title};

  :hover {
    background: ${(props) => props.theme.launchpad.colors.foreground};
  }
`

const LoaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  place-content: center;
`

const ModalWrapper = styled.div`
  display: grid;
  place-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  backdrop-filter: blur(20px);
`

const ContactFormWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 1rem;
  position: relative;
  width: 480px;
  background: ${(props) => props.theme.launchpad.colors.background};
  border-radius: 8px;
  padding: 2rem;
`
