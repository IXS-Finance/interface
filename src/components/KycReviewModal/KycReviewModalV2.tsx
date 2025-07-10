import React, { useEffect, useState } from 'react'

import styled from 'styled-components'
import { ModalBlurWrapper, TYPE } from 'theme'
import RedesignedWideModal from 'components/Modal/RedesignedWideModal'
import { KycItem } from 'state/admin/actions'
import { ReactComponent as ArrowLeft } from '../../assets/images/newCross.svg'
import IndividualFormV2 from './IndividualFormV2'
import { ReasonModal } from 'components/ReasonModal'
import { KYCStatuses } from 'pages/KYC/enum'
import { useApproveKyc, useRejectKyc, useResetKyc } from 'state/admin/hooks'
import { PinnedContentButton } from 'components/Button'
import { getCynopsisRisks } from 'state/kyc/hooks'
import { ReactComponent as KycApproveIcon } from 'assets/images/kyc_approve_icon.svg'
import { ReactComponent as KycRejectIcon } from 'assets/images/kyc_reject_icon.svg'
import { isMobile } from 'react-device-detect'
import { shortenAddress } from 'utils'
import Copy from 'components/AccountDetails/Copy'
import { t } from '@lingui/macro'

interface Props {
  isOpen: boolean
  onClose: () => void
  data: KycItem
  currentFilters?: Record<string, string | number>
}

interface ReferralInfoWrapperProps {
  isMobile: boolean
}

interface CopyContainerProps {
  isMobile: boolean
}

export const KycReviewModalV2 = ({ isOpen, onClose, data, currentFilters }: Props) => {
  const [openReasonModal, handleOpenReasonModal] = useState('')
  const [riskReportId, handleRiskReportId] = useState(0)

  const approveKyc = useApproveKyc()
  const rejectKyc = useRejectKyc()
  const resetKyc = useResetKyc()

  useEffect(() => {
    const fetchCynopsisRisks = async () => {
      const result = await getCynopsisRisks(data?.user.ethAddress)
      handleRiskReportId(result?.riskReport?.id || 0)
    }
    fetchCynopsisRisks()
  }, [data?.user.ethAddress])

  const closeModal = () => handleOpenReasonModal('')

  const reject = () => {
    handleOpenReasonModal('reject')
  }

  const approve = async () => {
    onClose()
    await approveKyc(data.id, riskReportId, currentFilters)
  }

  const onReasonAction = (reason?: string) => {
    if (openReasonModal === 'reject') {
      rejectKyc({ id: data.id, message: reason, riskReportId }, currentFilters)
    } else {
      resetKyc({ id: data.id, message: reason }, currentFilters)
    }
    closeModal()
    onClose()
  }

  const renderReferralInfo = () => {
    const referredByName = data?.individual?.referredByName || '-'
    const referralCode = data?.individual?.referralCode || '-'

    return (
      <ReferralInfoWrapper isMobile={isMobile}>
        <ReferredByText>Referred by</ReferredByText> <ReferredByNameText>{referredByName}</ReferredByNameText>
        <ReferralCodeText>{referralCode}</ReferralCodeText>
        <CopyContainer isMobile={isMobile}>
          <Copy isAdmin={true} toCopy={`${data.individual?.referralAddress}`}>
            {t`${shortenAddress(data.individual?.referralAddress)}`}
          </Copy>
        </CopyContainer>
      </ReferralInfoWrapper>
    )
  }

  return (
    <>
      <RedesignedWideModal isOpen={isOpen} onDismiss={onClose} scrollable>
        <ReasonModal
          isOpen={Boolean(openReasonModal)}
          onAction={onReasonAction}
          onClose={closeModal}
          actionBtnText="Submit"
          inputLabel="Accompanying text"
          title={openReasonModal === 'reject' ? 'Reject annotation' : 'Change request'}
          isRejectingApprovedKYC={openReasonModal === 'reject' && data.status === KYCStatuses.APPROVED}
        />
        <ModalBlurWrapper touchable data-testid="kyc-review">
          <TitleContainer>
            <div>
              <TYPE.label fontSize={'24px'}>Individual KYC</TYPE.label>
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
              {data?.individual?.referredBy || data?.individual?.referralCode ? renderReferralInfo() : ''}
              <ArrowLeft style={{ cursor: 'pointer' }} data-testid="cross" onClick={onClose} />
            </div>
          </TitleContainer>
          <Body>
            <IndividualFormV2 data={data} />
            <ActionContainer>
              <RejectButton onClick={reject}>
                Reject
                {data.status === 'pending' && <KycRejectIcon style={{ marginLeft: '10px' }} />}
              </RejectButton>
              <ApproveButton onClick={approve}>
                Approve
                {data.status === 'pending' && <KycApproveIcon style={{ marginLeft: '10px' }} />}
              </ApproveButton>
            </ActionContainer>
          </Body>
        </ModalBlurWrapper>
      </RedesignedWideModal>
    </>
  )
}

const Body = styled.div`
  display: grid;
  row-gap: 35px;
`

const TitleContainer = styled.div`
  margin-bottom: 27px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ActionContainer = styled.div`
  display: flex;
  gap: 16px;
  width: -webkit-fill-available;
`

const RejectButton = styled(PinnedContentButton)`
  background: none;
  color: ${({ disabled }) => (disabled ? '#FFFFFF' : '#ff8282')};
  border: 1px solid #e6e6ff;
`

const ApproveButton = styled(PinnedContentButton)`
  background: #1fba66;
`

const ReferralInfoWrapper = styled.span<ReferralInfoWrapperProps>`
  border: 1px solid #e6e6ff;
  background: #f7f7f8;
  padding: ${({ isMobile }) => (isMobile ? '8px' : '12px 16px')};
  border-radius: 6px;
  font-size: 14px;
  margin-left: 20px;
  font-weight: 600;
`

const ReferredByText = styled.span`
  color: #b8b8cc;
`

const ReferredByNameText = styled.span`
  color: #292933;
`

const ReferralCodeText = styled.span`
  color: #6666ff;
  margin-left: 4px;
`

const CopyContainer = styled.div<CopyContainerProps>`
  padding: ${({ isMobile }) => (isMobile ? '5px' : '10px')};
  border: 1px solid #e6e6ff;
  background: #ffffff;
  margin-top: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`
