import React, { useCallback, FC, useState, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { isMobile } from 'react-device-detect'
import { Flex, Text } from 'rebass'
import { Link, useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import { useCookies } from 'react-cookie'
import _get from 'lodash/get'
import { useWeb3React } from 'hooks/useWeb3React'

import { TYPE } from 'theme'
import { StyledBodyWrapper } from 'pages/SecurityTokens'
import Column from 'components/Column'
import { useKYCState } from 'state/kyc/hooks'
import { ReactComponent as IndividualKYC } from 'assets/images/newIndividual.svg'
import { ReactComponent as CorporateKYC } from 'assets/images/newCorporate.svg'
import { KYCStatuses } from './enum'
import { KYCStatus } from './KYCStatus'
import { Content, getStatusDescription, StatusCard, DateInfoContainer } from './styleds'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import { PinnedContentButton } from 'components/Button'
import { LoaderThin } from 'components/Loader/LoaderThin'
import styled from 'styled-components'
import Copy from 'components/AccountDetails/Copy'
import { useUserState } from 'state/user/hooks'
import { EmailVerification } from './EmailVerifyModal'
import ConnectWalletCard from 'components/NotAvailablePage/ConnectWalletCard'
import { detectWrongNetwork } from 'utils'
import { useAccount } from 'wagmi'

interface DescriptionProps {
  description: string | null
}

interface DateInfoProps {
  submittedDate?: string | null
  rejectedDate?: string | null
  approvedDate?: string | null
  changeRequestDate?: string | null
  info?: any
}

interface ModalProps {
  isModalOpen: boolean
  kycType?: string
  referralCode: string
}

const DateInfo: FC<DateInfoProps> = ({
  info,
  submittedDate,
  rejectedDate,
  approvedDate,
  changeRequestDate,
}: DateInfoProps) => (
  <DateInfoContainer>
    {info && (
      <TYPE.description3 width="252px" marginTop="10px" marginBottom="16px" fontSize="11px">
        {info}
      </TYPE.description3>
    )}
    {submittedDate && (
      <TYPE.description3 fontSize="11px" color="#B2B2BF">{`Submitted on ${dayjs(submittedDate)
        .utc()
        .format('MMM DD YYYY, HH:mm')} (UTC)`}</TYPE.description3>
    )}
    {rejectedDate && (
      <TYPE.description3 fontSize="11px" color="#B2B2BF">{`Rejected on ${dayjs(rejectedDate)
        .utc()
        .format('MMM DD YYYY, HH:mm')} (UTC)`}</TYPE.description3>
    )}
    {changeRequestDate && (
      <TYPE.description3 fontSize="11px" color="#B2B2BF">{`Change requested on ${dayjs(rejectedDate)
        .utc()
        .format('MMM DD YYYY, HH:mm')} (UTC)`}</TYPE.description3>
    )}
    {approvedDate && (
      <TYPE.description3 fontSize="11px" color="#B2B2BF">{`Approved on ${dayjs(approvedDate)
        .utc()
        .format('MMM DD YYYY, HH:mm')} (UTC)`}</TYPE.description3>
    )}
  </DateInfoContainer>
)

const Description: FC<DescriptionProps> = ({ description }: DescriptionProps) => (
  <TYPE.description3 textAlign="center" marginTop="15px" marginBottom="8px">
    {description}
  </TYPE.description3>
)

const KYC = () => {
  const { account } = useWeb3React()
  const { chainId } = useAccount()
  const [cookies] = useCookies(['annoucementsSeen'])
  const { config } = useWhitelabelState()
  const { kyc, loadingRequest } = useKYCState()
  const [modalProps, setModalProps] = useState<ModalProps>({ isModalOpen: false, referralCode: '' })
  const status = useMemo(() => kyc?.status || KYCStatuses.NOT_SUBMITTED, [kyc])
  const description = useMemo(() => kyc?.message || getStatusDescription(status), [kyc, status])

  const { me } = useUserState()
  const history = useHistory()
  const isWrongNetwork = detectWrongNetwork(chainId as number)

  const supportEmail = _get(config, 'supportEmail', 'c@ixs.finance')

  const infoText = (
    <p>
      In order to make changes to your KYC please get in touch with us via{' '}
      <a href={`mailto:${supportEmail}`} style={{ textDecoration: 'none', color: '#6666FF' }}>
        {supportEmail}
      </a>
    </p>
  )

  const referralCode = useMemo(() => {
    return me?.referralCode
  }, [JSON.stringify(me)])

  const openModal = (kycType: string) => {
    console.log('Opening modal for', kycType)
    // Pass additional props based on the selected KYC type
    setModalProps({
      isModalOpen: true,
      kycType,
      referralCode: new URL(window.location.href).href?.split('=')[1]
        ? `/kyc/${kycType}?referralCode=${new URL(window.location.href).href?.split('=')[1]}`
        : `/kyc/${kycType}`,
      // Add more props as needed
    })
  }

  const closeModal = () => {
    console.log('Closing modal')
    setModalProps({ isModalOpen: false, referralCode: '', kycType: undefined })
  }

  const getKYCLink = () => {
    const referralCodeParam = new URL(window.location.href).href?.split('=')[1]
    const baseLink = '/kyc/individual'
    if (kyc?.individual?.version === 'v2' || !kyc?.individual?.version) {
      return referralCodeParam ? `${baseLink}/v2?referralCode=${referralCodeParam}` : `${baseLink}/v2`
    } else {
      return referralCodeParam ? `${baseLink}?referralCode=${referralCodeParam}` : `${baseLink}`
    }
  }

  const getKYCDescription = useCallback(() => {
    switch (status) {
      case KYCStatuses.NOT_SUBMITTED:
        return (
          <>
            <Flex
              width="100%"
              flexDirection={isMobile ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems={isMobile ? 'center' : 'flex-end'}
              sx={{ gap: '1rem', marginTop: '40px' }}
            >
              <Flex
                onClick={() => !isWrongNetwork && history.push(getKYCLink())}
                sx={{
                  border: '1px solid #E6E6FF',
                  marginBottom: isMobile ? '32px' : '0px',
                  padding: isMobile ? '40px 45px' : '55px 90px',
                  cursor: 'pointer',
                }}
                flexDirection="column"
                alignItems="center"
              >
                <IndividualKYC />
                <>
                  <Text
                    sx={{
                      marginTop: '32px',
                      width: 'max-content',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#292933',
                    }}
                  >
                    <Trans>Pass KYC as Individual</Trans>
                  </Text>

                  <Text sx={{ marginTop: '12px', fontSize: '13px', fontWeight: '600', color: '#6666FF' }}>
                    {isWrongNetwork ? <LoaderThin size={24} style={{ marginTop: 12 }} /> : <Trans>Start Now</Trans>}
                  </Text>
                </>
              </Flex>

              <Flex
                onClick={() => !isWrongNetwork && openModal('corporate')}
                sx={{
                  border: '1px solid #E6E6FF',
                  padding: isMobile ? '40px 40px' : '50px 90px',
                  marginBottom: isMobile ? '32px' : '0px',
                  width: 'max-content',
                  cursor: 'pointer',
                }}
                flexDirection="column"
                alignItems="center"
              >
                <CorporateKYC />
                <>
                  <Text sx={{ marginTop: '32px', fontSize: '18px', fontWeight: '700', color: '#292933' }}>
                    <Trans>Pass KYC as Corporate</Trans>
                  </Text>
                </>
                {/* <Link style={{ textDecoration: 'none ' }} to="/kyc/corporate"> */}

                <Text sx={{ marginTop: '12px', fontSize: '13px', fontWeight: '600', color: '#6666FF' }}>
                  {isWrongNetwork ? <LoaderThin size={24} /> : <Trans>Start Now</Trans>}
                </Text>

                {/* </Link> */}
              </Flex>
            </Flex>
          </>
        )

      case KYCStatuses.DRAFT:
        return (
          <>
            <Description description={description} />
            <Flex
              width="100%"
              flexDirection={isMobile ? 'column' : 'row'}
              justifyContent="center"
              alignItems={isMobile ? 'center' : 'flex-start'}
            >
              {kyc?.individual && (
                <Flex sx={{ marginBottom: isMobile ? '32px' : '0px' }} flexDirection="column" alignItems="center">
                  <IndividualKYC />
                  <Link style={{ textDecoration: 'none' }} to={getKYCLink()}>
                    <PinnedContentButton sx={{ padding: '16px 24px', marginTop: '32px' }}>
                      <Trans>Continue Pass KYC as Individual</Trans>
                    </PinnedContentButton>
                  </Link>
                </Flex>
              )}

              {kyc?.corporate && (
                <Flex flexDirection="column" alignItems="center">
                  <CorporateKYC />
                  <Link style={{ textDecoration: 'none ' }} to="/kyc/corporate">
                    <PinnedContentButton sx={{ padding: '16px 24px', marginTop: '32px' }}>
                      <Trans>Continue Pass KYC as Corporate</Trans>
                    </PinnedContentButton>
                  </Link>
                </Flex>
              )}
            </Flex>
          </>
        )

      case KYCStatuses.REJECTED:
        return (
          <>
            {/* <Description description={description} /> */}
            <DateInfo info={infoText} submittedDate={kyc?.createdAt} rejectedDate={kyc?.updatedAt} />
          </>
        )
      case KYCStatuses.PENDING:
        return (
          <>
            {/* <Description description={getStatusDescription(status)} /> */}
            <DateInfo info={infoText} submittedDate={kyc?.updatedAt || kyc?.createdAt} />
          </>
        )
      case KYCStatuses.CHANGES_REQUESTED:
        return (
          <>
            {/* <Description description={description} /> */}
            <DateInfo info={infoText} submittedDate={kyc?.createdAt} changeRequestDate={kyc?.updatedAt} />
          </>
        )
      case KYCStatuses.APPROVED:
        return (
          <Flex flexDirection="column" alignItems="center" marginTop="0px">
            {/* <ApprovedKYC /> */}
            <DateInfo info={infoText} submittedDate={kyc?.createdAt} approvedDate={kyc?.updatedAt} />
          </Flex>
        )
      case KYCStatuses.DRAFT:
        return (
          <>
            <Description description={getStatusDescription(status)} />
            <DateInfo submittedDate={kyc?.updatedAt || kyc?.createdAt} />
          </>
        )
      case KYCStatuses.IN_PROGRESS:
        return (
          <>
            <DateInfo info={infoText} submittedDate={kyc?.updatedAt || kyc?.createdAt} />
          </>
        )
      case KYCStatuses.FAILED:
        return (
          <>
            <DateInfo info={infoText} submittedDate={kyc?.updatedAt || kyc?.createdAt} />
          </>
        )
    }
  }, [status, description, kyc, chainId])

  if (!account) {
    return (
      <Flex justifyContent="center" width="100%" mt="3rem">
        <ConnectWalletCard />
      </Flex>
    )
  }

  return (
    <StyledBodyWrapper hasAnnouncement={!cookies.annoucementsSeen}>
      <EmailVerification {...modalProps} closeModal={closeModal} />
      <StatusCard>
        <Column style={{ alignItems: 'center' }}>
          <Content
            flexDirection="column"
            marginTop={status === KYCStatuses.NOT_SUBMITTED || status === null ? '8px' : '10px'}
            alignItems="center"
          >
            <TYPE.description6 fontWeight={'800'} marginTop={'30px'} marginBottom="15px">
              <Trans>{config?.name || 'IXS'} KYC</Trans>
            </TYPE.description6>
            <KYCStatus status={kyc?.status || KYCStatuses.NOT_SUBMITTED} />
            {referralCode && (
              <>
                <>
                  {kyc?.status == KYCStatuses.CHANGES_REQUESTED && (
                    <div
                      style={{
                        background: '#F7F7FA',
                        padding: '32px',
                        marginTop: '20px',
                        borderRadius: '8px',
                        width: '360px',
                      }}
                    >
                      {
                        <>
                          <TYPE.black textAlign={'center'}>Changes Required</TYPE.black>
                          <Description
                            description={`We kindly inform you that adjustments are needed in your KYC submission. Please review the provided documentation and make the necessary changes to ensure compliance with our verification standards. Your cooperation in this matter is appreciated.`}
                          />
                        </>
                      }
                      <Link
                        style={{ textDecoration: 'none' }}
                        to={
                          kyc?.corporateKycId
                            ? `/kyc/corporate`
                            : new URL(window.location.href).href?.split('=')[1]
                            ? `/kyc/individual?referralCode=${new URL(window.location.href).href?.split('=')[1]}`
                            : `/kyc/individual`
                        }
                      >
                        <PinnedContentButton
                          sx={{ padding: '16px 24px', marginTop: '32px', boxShadow: '0px 16px 16px 0px #6666FF21' }}
                          data-testid="makeChangesAndResendKycButton"
                        >
                          <Trans>Make changes and resend KYC</Trans>
                        </PinnedContentButton>
                      </Link>
                    </div>
                  )}
                </>
                {kyc?.status == KYCStatuses.REJECTED && (
                  <div
                    style={{
                      background: '#F7F7FA',
                      padding: '32px',
                      marginTop: '20px',
                      borderRadius: '8px',
                      width: '360px',
                    }}
                  >
                    {
                      <>
                        <TYPE.black textAlign={'center'}>Reason for KYC Verification Rejection</TYPE.black>
                        <Description
                          description={
                            description
                              ? description
                              : `We regret to inform you that your KYC verification has been rejected`
                          }
                        />
                      </>
                    }
                  </div>
                )}

                <Column style={{ margin: '20px 0px' }}>
                  <TYPE.title11>Refer a Friend</TYPE.title11>
                </Column>

                <Column style={{ margin: '5px 0px' }}>
                  <StyledDiv>
                    <TitleSpan>{referralCode}</TitleSpan>
                    <FlexContainer>
                      <Copy toCopy={`${window.location.origin}/#/kyc?referralCode=${referralCode}`}></Copy>
                    </FlexContainer>
                  </StyledDiv>
                </Column>
              </>
            )}
          </Content>
          {getKYCDescription()}
        </Column>
      </StatusCard>
    </StyledBodyWrapper>
  )
}

export default KYC

const StyledDiv = styled.div`
  border: 1px solid #e6e6ff;
  padding: 10px 16px;
  width: 280px;
  display: flex;
  justify-content: space-between;
  border-radius: 8px;
`

const TitleSpan = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #292933;
`

const FlexContainer = styled.div`
  display: flex;
  justify-content: center;
`
