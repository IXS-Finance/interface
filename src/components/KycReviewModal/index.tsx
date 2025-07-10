import React, { useEffect, useState } from 'react'
import { Trans, t } from '@lingui/macro'
import styled from 'styled-components'
import { ModalBlurWrapper, ModalContentWrapper, MEDIA_WIDTHS, CloseIcon, TYPE } from 'theme'
import RedesignedWideModal from 'components/Modal/RedesignedWideModal'
import {  ButtonPinkBorder, ButtonGradientBorder, PinnedContentButton } from 'components/Button'
import { ReasonModal } from 'components/ReasonModal'
import { CorporateKyc, IndividualKyc, KycItem } from 'state/admin/actions'
import { shortenAddress } from 'utils'
import { useApproveKyc, useRejectKyc, useResetKyc, useResubmitKyc } from 'state/admin/hooks'
import { getCynopsisRisks } from 'state/kyc/hooks'
import { LoadingIndicator } from 'components/LoadingIndicator'
import { KYCStatuses } from 'pages/KYC/enum'
import { CorporateForm } from './CorporateForm'
import { IndividualForm } from './IndividualForm'

import { ReactComponent as ArrowLeft } from '../../assets/images/newBack.svg'
import { isMobile } from 'react-device-detect'
import Copy from 'components/AccountDetails/Copy'
import { KycReviewModalV2 } from './KycReviewModalV2'

interface Props {
  isOpen: boolean
  onClose: () => void
  data: KycItem
  currentFilters?: Record<string, string | number>
}

export const KycReviewModal = ({ isOpen, onClose, data, currentFilters }: Props) => {
  const [openReasonModal, handleOpenReasonModal] = useState('')
  const [riskJSON, setRiskJSON] = useState<any>(null)
  const [loadingCynopsis, handleLoadingCynopsis] = useState(false)
  const [riskReportId, handleRiskReportId] = useState(0)
  const approveKyc = useApproveKyc()
  const rejectKyc = useRejectKyc()
  const resetKyc = useResetKyc()
  const resubmitKyc = useResubmitKyc()

  useEffect(() => {
    const fetchCynopsisRisks = async () => {
      handleLoadingCynopsis(true)
      const result = await getCynopsisRisks(data?.user.ethAddress)
      setRiskJSON(
        result?.riskReport?.riskScore
          ? result.riskReport
          : result?.riskReport?.riskJson?.riskScore
          ? result.riskReport.riskJson
          : null
      )
      handleRiskReportId(result?.riskReport?.id || 0)
      handleLoadingCynopsis(false)
    }

    fetchCynopsisRisks()
  }, [data?.user.ethAddress])

  const kyc = (data?.individualKycId ? data?.individual : data?.corporate) || ({} as IndividualKyc | CorporateKyc)

  const approve = async () => {
    onClose()
    await approveKyc(data.id, riskReportId, currentFilters)
  }

  const resubmit = async () => {
    onClose()
    await resubmitKyc(data.id, currentFilters)
  }

  const closeModal = () => handleOpenReasonModal('')

  const reject = () => {
    handleOpenReasonModal('reject')
  }

  const changeRequest = () => {
    handleOpenReasonModal('changeRequest')
  }

  const onReasonAction = (reason?: string) => {
    if (openReasonModal === 'reject') {
      rejectKyc({ id: data.id, message: reason, riskReportId }, currentFilters)
    } else {
      resetKyc({ id: data.id, message: reason }, currentFilters)
    }
    closeModal()
    onClose()
    // TO DO - handle action
  }
  const constructName = (data: KycItem) => {
    if (data?.individualKycId) {
      return `${data?.individual?.firstName} ${data?.individual?.middleName || ''} ${data?.individual?.lastName || ''}`
    } else {
      return data?.corporate?.corporateName || ''
    }
  }

  if (loadingCynopsis) return <LoadingIndicator isLoading size={96} />

  const needResubmit = [KYCStatuses.DRAFT, KYCStatuses.FAILED].includes(data?.status as any)

  const renderReferralInfo = () => {
    const referredBy = data?.individual?.referredBy || '-'
    const referredByName = data?.individual?.referredByName || '-'
    const referralCode = data?.individual?.referralCode || '-'

    return (
      <span
        style={{
          border: '1px solid #E6E6FF',
          background: '#F7F7F8',
          padding: isMobile ? '8px' : '12px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          marginLeft: '20px',
          fontWeight: '600',
        }}
      >
        <span style={{ color: '#B8B8CC' }}>Referred by</span>{' '}
        <span style={{ color: '#292933' }}>{referredByName} </span>
        <span style={{ color: '#6666FF' }}>{referralCode}</span>
        <div
          style={{
            padding: isMobile ? '5px' : '10px',
            border: '1px solid #E6E6FF',
            background: '#FFFFFF',
            marginTop: '10px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Copy isAdmin={true} toCopy={`${data.individual?.referralAddress}`}>
            {t`${shortenAddress(data.individual?.referralAddress)}`}
          </Copy>
        </div>
      </span>
    )
  }
  return (
    <>
      {data?.individual?.version === 'v2' ? (
        <KycReviewModalV2 isOpen={isOpen} onClose={onClose} data={data} currentFilters={currentFilters} />
      ) : (
        <>
          <ReasonModal
            isOpen={Boolean(openReasonModal)}
            onAction={onReasonAction}
            onClose={closeModal}
            actionBtnText="Submit"
            inputLabel="Accompanying text"
            title={openReasonModal === 'reject' ? 'Reject annotation' : 'Change request'}
            isRejectingApprovedKYC={openReasonModal === 'reject' && data.status === KYCStatuses.APPROVED}
          />
          <RedesignedWideModal
            isOpen={isOpen}
            onDismiss={onClose}
            minHeight={false}
            maxHeight={'fit-content'}
            scrollable
            isLarge
          >
            <ModalBlurWrapper touchable data-testid="kyc-review">
              <ModalContent>
                <TitleContainer>
                  <Title>
                    <div>
                      <Trans>
                        <ArrowLeft style={{ cursor: 'pointer' }} data-testid="cross" onClick={onClose} />
                      </Trans>
                      &nbsp;&nbsp;
                    </div>
                    <TYPE.title7
                      fontWeight="800"
                      lineHeight={isMobile ? '16px' : '40px'}
                      fontSize={isMobile ? '12px' : '24px'}
                    >
                      <Trans>{constructName(data)}</Trans>
                    </TYPE.title7>
                  </Title>
                  {data?.individual?.referredBy || data?.individual?.referralCode ? renderReferralInfo() : ''}
                </TitleContainer>
                <Body>
                  {data?.individualKycId ? (
                    <IndividualForm riskJSON={riskJSON} data={kyc} />
                  ) : (
                    <CorporateForm riskJSON={riskJSON} data={kyc} />
                  )}
                </Body>
                <ActionsContainer buttons={needResubmit ? 4 : 3}>
                  <PinnedContentButton onClick={approve} data-testid="approveButton" disabled={needResubmit}>
                    <Trans>Approve</Trans>
                  </PinnedContentButton>
                  <ButtonPinkBorder onClick={reject} data-testid="rejectButton" disabled={needResubmit}>
                    <Trans>Reject</Trans>
                  </ButtonPinkBorder>
                  <ButtonGradientBorder
                    onClick={changeRequest}
                    data-testid="changeRequestButton"
                    disabled={needResubmit}
                  >
                    <Trans>Request a change</Trans>
                  </ButtonGradientBorder>
                  {needResubmit && (
                    <PinnedContentButton onClick={resubmit}>
                      <Trans>Resubmit</Trans>
                    </PinnedContentButton>
                  )}
                </ActionsContainer>
              </ModalContent>
            </ModalBlurWrapper>
          </RedesignedWideModal>
        </>
      )}
    </>
  )
}

const Body = styled.div`
  display: grid;
  row-gap: 35px;
`

const ActionsContainer = styled.div<{ buttons: number }>`
  display: grid;
  grid-template-columns: ${({ buttons }) => `repeat(${buttons}, 1fr)`};
  column-gap: 35px;
  row-gap: 35px;
  margin-top: 35px;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    grid-template-columns: 1fr;
  }
  > button {
    width: 100%;
  }
  > button:nth-child(2) {
    color: ${({ theme: { error } }) => error};
    background-color: transparent;
    border: 1px solid #ff6161;
  }
  > button:nth-child(3) {
    background-color: transparent;
  }
`

const TitleContainer = styled.div`
  margin-bottom: 27px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ModalContent = styled(ModalContentWrapper)`
  padding: 29px 38px 42px 42px;
  border-radius: 20px;
  min-width: 70vw;
  max-width: 70vw;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    padding: 16px;
    // padding: 29px 5px 42px 5px;
    border-radius: 6px;
    min-width: 90vw;
    max-width: 90vw;
  }
`

const Title = styled.div`
  font-size: 22px;
  display: flex;
  align-items: center;
  color: ${({ theme: { text2 } }) => text2};
  > :first-child {
    font-weight: 600;
  }
`
