import React from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'
import _get from 'lodash/get'

import { ReactComponent as EyeIcon } from '../../assets/images/blue_eye_icon.svg'
import { Line } from 'components/Line'
import { KycItem } from 'state/admin/actions'
import StatusIndicator from './Blocks/KycV2StatusIndicator'
import { EmailType } from 'pages/KYC/enum'
import InternalNotes from './InternalNotes'
import { Box } from 'rebass'

interface Props {
  data: KycItem
}

const IndividualFormV2 = ({ data }: Props) => {
  const renderStatusBox = (title: string, status: string) =>
    status ? (
      <StatusBox>
        <TYPE.subHeader1 color={colors.subHeader}>{title}</TYPE.subHeader1>
        <StatusCheckBox>
          <StatusIndicator status={status} />
        </StatusCheckBox>
      </StatusBox>
    ) : null

  const statusBoxes = [
    { title: 'AML Screening', status: data?.individual?.amlVerificationStatus },
    { title: 'Document', status: data?.individual?.documentVerificationStatus },
    { title: 'Identity', status: data?.individual?.identityVerificationStatus },
    { title: 'Proof of Address', status: data?.individual?.poaVerificationStatus },
  ]

  const renderedStatusBoxes = statusBoxes.filter((box) => box.status).length
  const gridTemplateColumns = `repeat(${renderedStatusBoxes}, 1fr)`
  const message = _get(data, 'message', '')

  const renderInfoBox = (label: string, value: string) => {
    if (!value) return null
    return (
      <InfoBox>
        <TYPE.subHeader1 color={colors.infoLabel}>{label}</TYPE.subHeader1>
        <StatusCheckBox>
          <TYPE.subHeader1>{value}</TYPE.subHeader1>
        </StatusCheckBox>
      </InfoBox>
    )
  }

  const getSecondaryContactLabel = () => {
    switch (data?.individual?.secondaryContact) {
      case EmailType.SOCIAL_ACCOUNT:
        return 'Telegram'
      case EmailType.SECONDARY:
        return 'Business Email'
      case EmailType.PROOF_OF_ADDRESS:
        return 'Proof of Address'
      default:
        return `${data?.individual?.secondaryContactDetails}`
    }
  }

  const getSecondaryContactValue = () => {
    switch (data?.individual?.secondaryContact) {
      case EmailType.SOCIAL_ACCOUNT:
        return `https://t.me/${data?.individual?.secondaryContactDetails}`
      case EmailType.SECONDARY:
        return `${data?.individual?.secondaryContactDetails}`
      default:
        return `-`
    }
  }

  const handleViewStatusClick = () => {
    window.open(`https://portal.complycube.com/clients/${data?.customerId}`, '_blank')
  }

  return (
    <FormContainer>
      <Line />
      <StatusHeader>
        <TYPE.body4>ComplyCube Status</TYPE.body4>
        <ViewStatus onClick={handleViewStatusClick}>
          <EyeIcon />
          <TYPE.subHeader1 color={colors.viewStatus}>View Status</TYPE.subHeader1>
        </ViewStatus>
      </StatusHeader>

      <StatusBoxContainer style={{ gridTemplateColumns }}>
        {statusBoxes.map((box, index) => renderStatusBox(box.title, box.status))}
      </StatusBoxContainer>

      <Line style={{ marginTop: '30px' }} />

      <StatusHeader>
        <TYPE.body4>Personal Information</TYPE.body4>
      </StatusHeader>
      <StatusBoxContainerInfo>
        {renderInfoBox('First Name', data?.individual?.firstName || '-')}
        {renderInfoBox('Middle Name', data?.individual?.middleName || '-')}
        {renderInfoBox('Last Name', data?.individual?.lastName || '-')}
        {renderInfoBox('Email Address', data?.individual?.email || '-')}
      </StatusBoxContainerInfo>

      <Line style={{ marginTop: '10px' }} />

      <StatusHeader>
        <TYPE.body4>Secondary Contact Details</TYPE.body4>
      </StatusHeader>
      <StatusBoxContainer>{renderInfoBox(getSecondaryContactLabel(), getSecondaryContactValue())}</StatusBoxContainer>
      <Line style={{ marginTop: '10px' }} />

      {message ? (
        <>
          <StatusHeader>
            <TYPE.body4 color={'bg14'}>Rejection message</TYPE.body4>
          </StatusHeader>
          <Box css={{ maxWidth: 716 }}>
            <TYPE.body3 marginBottom="16px" opacity="0.5">
              {message}
            </TYPE.body3>
          </Box>

          <Line style={{ marginTop: '10px' }} />
        </>
      ) : null}

      <InternalNotes message={data?.authorizerNote} />
    </FormContainer>
  )
}

const colors = {
  subHeader: '#555566',
  viewStatus: '#6666FF',
  infoLabel: '#8F8FB2',
}

const FormContainer = styled.div`
  padding: 20px;
`

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`

const ViewStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`

const StatusBoxContainer = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 16px;
`
const StatusBoxContainerInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
`
const StatusBox = styled.div`
  border: 1px solid #e6e6ff;
  border-radius: 8px;
  padding: 16px;
  width: 167px;
  height: auto;
`

const InfoBox = styled.div`
  padding: 16px 0px;
  width: 167px;
  height: auto;
  word-wrap: break-word;
  word-break: break-word;
`

const StatusCheckBox = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 3px;
`

export default IndividualFormV2
