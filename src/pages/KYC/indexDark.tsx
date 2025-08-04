import React, { useCallback, useState, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { Link, useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import _get from 'lodash/get'
import { useWeb3React } from 'hooks/useWeb3React'
import { useAccount } from 'wagmi'

import { TailwindThemeProvider } from '../../hooks/useTailwindTheme'
import { useKYCState } from 'state/kyc/hooks'
import { ReactComponent as IndividualKYC } from 'assets/images/newIndividual.svg'
import { ReactComponent as CorporateKYC } from 'assets/images/newCorporate.svg'
import { KYCStatuses } from './enum'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import { useUserState } from 'state/user/hooks'
import { EmailVerification } from './EmailVerifyModal'
import ConnectWalletCard from 'components/NotAvailablePage/ConnectWalletCard'

// Icon components using actual SVG imports
const IndividualIcon: React.FC = () => (
  <div className="w-16 h-16 flex items-center justify-center">
    <IndividualKYC />
  </div>
)

const CorporateIcon: React.FC = () => (
  <div className="w-16 h-16 flex items-center justify-center">
    <CorporateKYC />
  </div>
)

const CopyIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400">
    <path
      d="M14 2H6C5.44772 2 5 2.44772 5 3V13C5 13.5523 5.44772 14 6 14H14C14.5523 14 15 13.5523 15 13V3C15 2.44772 14.5523 2 14 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9 6H17C17.5523 6 18 6.44772 18 7V17C18 17.5523 17.5523 18 17 18H9C8.44772 18 8 17.5523 8 17V15"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const InfoIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-400">
    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
    <path d="M6 4V6M6 8H6.01" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)

interface ModalProps {
  isModalOpen: boolean
  kycType?: string
  referralCode: string
}

interface DateInfoProps {
  submittedDate?: string | null
  rejectedDate?: string | null
  approvedDate?: string | null
  changeRequestDate?: string | null
  info?: any
}

// Helper function to get status description
const getStatusDescription = (status: string): string => {
  switch (status) {
    case KYCStatuses.NOT_SUBMITTED:
      return 'To access all features of the platform, please complete the KYC verification process.'
    case KYCStatuses.DRAFT:
      return 'Your KYC application is saved as draft. Please complete and submit it.'
    case KYCStatuses.PENDING:
      return 'Your KYC verification is being reviewed. This process may take 1-3 business days.'
    case KYCStatuses.APPROVED:
      return 'Your KYC verification has been approved. You now have full access to the platform.'
    case KYCStatuses.REJECTED:
      return 'Your KYC verification has been rejected. Please review the feedback and resubmit.'
    case KYCStatuses.CHANGES_REQUESTED:
      return 'Changes are required for your KYC verification. Please review and update your submission.'
    case KYCStatuses.IN_PROGRESS:
      return 'Your KYC verification is currently in progress.'
    case KYCStatuses.FAILED:
      return 'Your KYC verification has failed. Please try again.'
    default:
      return 'Please complete your KYC verification to access all platform features.'
  }
}

// DateInfo component
const DateInfo: React.FC<DateInfoProps> = ({ info, submittedDate, rejectedDate, approvedDate, changeRequestDate }) => (
  <div className="text-center space-y-2 mt-4">
    {info && (
      <div className="text-11 text-light-300 max-w-[252px] mx-auto mb-4">{typeof info === 'string' ? info : info}</div>
    )}
    {submittedDate && (
      <div className="text-11 text-light-400">
        {`Submitted on ${dayjs(submittedDate).utc().format('MMM DD YYYY, HH:mm')} (UTC)`}
      </div>
    )}
    {rejectedDate && (
      <div className="text-11 text-light-400">
        {`Rejected on ${dayjs(rejectedDate).utc().format('MMM DD YYYY, HH:mm')} (UTC)`}
      </div>
    )}
    {changeRequestDate && (
      <div className="text-11 text-light-400">
        {`Change requested on ${dayjs(changeRequestDate).utc().format('MMM DD YYYY, HH:mm')} (UTC)`}
      </div>
    )}
    {approvedDate && (
      <div className="text-11 text-light-400">
        {`Approved on ${dayjs(approvedDate).utc().format('MMM DD YYYY, HH:mm')} (UTC)`}
      </div>
    )}
  </div>
)

interface KYCOptionProps {
  icon: React.ReactNode
  title: string
  onStartNow: () => void
}

const KYCOption: React.FC<KYCOptionProps> = ({ icon, title, onStartNow }) => {
  return (
    <div className="flex-1 bg-[#202126] border border-[#353840] rounded-2xl px-6 py-12 flex flex-col items-center gap-4">
      {icon}

      <div className="text-center">
        <h3 className="text-white text-18 font-medium">{title}</h3>
      </div>

      <button
        onClick={onStartNow}
        className="bg-white text-dark-200 px-4 py-2 rounded-32 font-medium hover:bg-light-200 transition-colors"
      >
        Start Now
      </button>
    </div>
  )
}

const KYC: React.FC = () => {
  const { account } = useWeb3React()
  const { chainId } = useAccount()
  const { config } = useWhitelabelState()
  const { kyc } = useKYCState()
  const [modalProps, setModalProps] = useState<ModalProps>({ isModalOpen: false, referralCode: '' })
  const status = useMemo(() => kyc?.status || KYCStatuses.NOT_SUBMITTED, [kyc])
  const description = useMemo(() => kyc?.message || getStatusDescription(status), [kyc, status])

  const { me } = useUserState()
  const history = useHistory()

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
    setModalProps({
      isModalOpen: true,
      kycType,
      referralCode: new URL(window.location.href).href?.split('=')[1]
        ? `/kyc/${kycType}?referralCode=${new URL(window.location.href).href?.split('=')[1]}`
        : `/kyc/${kycType}`,
    })
  }

  const closeModal = () => {
    console.log('Closing modal')
    setModalProps({ isModalOpen: false, referralCode: '', kycType: undefined })
  }

  const getKYCLink = () => {
    const referralCodeParam = new URL(window.location.href).href?.split('=')[1]
    const baseLink = '/kyc/individual'
    return referralCodeParam ? `${baseLink}/v2?referralCode=${referralCodeParam}` : `${baseLink}/v2`
  }

  const handleIndividualKYC = () => {
    history.push(getKYCLink())
  }

  const handleCorporateKYC = () => {
    openModal('corporate')
  }

  const handleCopyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(`${window.location.origin}/#/kyc?referralCode=${referralCode}`)
    }
  }

  // Render different content based on KYC status
  const renderKYCContent = useCallback(() => {
    switch (status) {
      case KYCStatuses.NOT_SUBMITTED:
        return (
          <div className="space-y-12">
            {/* Title Section */}
            <div className="text-center text-white space-y-5">
              <p className="text-18 font-medium opacity-50">
                <Trans>{config?.name || 'IXS'} KYC</Trans>
              </p>
              <h1 className="text-5xl font-bold leading-tight tracking-tight">
                <Trans>To start using IXS,</Trans>
                <br />
                <Trans>please complete a quick KYC verification.</Trans>
              </h1>
            </div>

            {/* KYC Options */}
            <div className="flex gap-3">
              <KYCOption icon={<IndividualIcon />} title="Pass KYC as Individual" onStartNow={handleIndividualKYC} />
              <KYCOption icon={<CorporateIcon />} title="Pass KYC as Corporate" onStartNow={handleCorporateKYC} />
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-dark-300"></div>

            {/* Refer a Friend Section */}
            {referralCode && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-14 font-medium">
                    <Trans>Refer a Friend</Trans>
                  </span>
                  <InfoIcon />
                </div>

                <div
                  className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex items-center justify-between cursor-pointer hover:bg-[#252631] transition-colors"
                  onClick={handleCopyReferralCode}
                >
                  <span className="text-white text-14 font-medium">{referralCode}</span>
                  <CopyIcon />
                </div>
              </div>
            )}
          </div>
        )

      case KYCStatuses.DRAFT:
        return (
          <div className="space-y-8">
            <div className="text-center text-white space-y-5">
              <p className="text-18 font-medium opacity-50">
                <Trans>{config?.name || 'IXS'} KYC</Trans>
              </p>
              <h1 className="text-3xl font-bold">
                <Trans>Continue Your KYC Application</Trans>
              </h1>
              <p className="text-light-300">{description}</p>
            </div>

            <div className="flex justify-center">
              {kyc?.individual && (
                <div className="flex flex-col items-center space-y-4">
                  <IndividualIcon />
                  <Link to={getKYCLink()} className="no-underline">
                    <button className="bg-white text-dark-200 px-6 py-3 rounded-32 font-medium hover:bg-light-200 transition-colors">
                      <Trans>Continue Pass KYC as Individual</Trans>
                    </button>
                  </Link>
                </div>
              )}

              {kyc?.corporate && (
                <div className="flex flex-col items-center space-y-4">
                  <CorporateIcon />
                  <Link to="/kyc/corporate" className="no-underline">
                    <button className="bg-white text-dark-200 px-6 py-3 rounded-32 font-medium hover:bg-light-200 transition-colors">
                      <Trans>Continue Pass KYC as Corporate</Trans>
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {referralCode && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-white text-14 font-medium">
                    <Trans>Refer a Friend</Trans>
                  </span>
                  <InfoIcon />
                </div>
                <div
                  className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex items-center justify-between cursor-pointer hover:bg-[#252631] transition-colors max-w-[280px] mx-auto"
                  onClick={handleCopyReferralCode}
                >
                  <span className="text-white text-14 font-medium">{referralCode}</span>
                  <CopyIcon />
                </div>
              </div>
            )}
          </div>
        )

      case KYCStatuses.PENDING:
        return (
          <div className="space-y-8">
            <div className="text-center text-white space-y-5">
              <p className="text-18 font-medium opacity-50">
                <Trans>{config?.name || 'IXS'} KYC</Trans>
              </p>
              <h1 className="text-3xl font-bold">
                <Trans>KYC Under Review</Trans>
              </h1>
              <p className="text-light-300">{getStatusDescription(status)}</p>
            </div>
            <DateInfo info={infoText} submittedDate={kyc?.updatedAt || kyc?.createdAt} />
            {referralCode && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-white text-14 font-medium">
                    <Trans>Refer a Friend</Trans>
                  </span>
                  <InfoIcon />
                </div>
                <div
                  className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex items-center justify-between cursor-pointer hover:bg-[#252631] transition-colors max-w-[280px] mx-auto"
                  onClick={handleCopyReferralCode}
                >
                  <span className="text-white text-14 font-medium">{referralCode}</span>
                  <CopyIcon />
                </div>
              </div>
            )}
          </div>
        )

      case KYCStatuses.APPROVED:
        return (
          <div className="space-y-8">
            <div className="text-center text-white space-y-5">
              <p className="text-18 font-medium opacity-50">
                <Trans>{config?.name || 'IXS'} KYC</Trans>
              </p>
              <h1 className="text-3xl font-bold text-green-500">
                <Trans>KYC Approved</Trans>
              </h1>
              <p className="text-light-300">{getStatusDescription(status)}</p>
            </div>
            <DateInfo info={infoText} submittedDate={kyc?.createdAt} approvedDate={kyc?.updatedAt} />
            {referralCode && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-white text-14 font-medium">
                    <Trans>Refer a Friend</Trans>
                  </span>
                  <InfoIcon />
                </div>
                <div
                  className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex items-center justify-between cursor-pointer hover:bg-[#252631] transition-colors max-w-[280px] mx-auto"
                  onClick={handleCopyReferralCode}
                >
                  <span className="text-white text-14 font-medium">{referralCode}</span>
                  <CopyIcon />
                </div>
              </div>
            )}
          </div>
        )

      case KYCStatuses.REJECTED:
        return (
          <div className="space-y-8">
            <div className="text-center text-white space-y-5">
              <p className="text-18 font-medium opacity-50">
                <Trans>{config?.name || 'IXS'} KYC</Trans>
              </p>
              <h1 className="text-3xl font-bold text-red-500">
                <Trans>KYC Rejected</Trans>
              </h1>
            </div>

            <div className="bg-[#F7F7FA] p-8 rounded-lg max-w-[360px] mx-auto">
              <h3 className="text-dark-200 font-semibold text-center mb-4">
                <Trans>Reason for KYC Verification Rejection</Trans>
              </h3>
              <p className="text-dark-200 text-center text-sm">
                {description || 'We regret to inform you that your KYC verification has been rejected'}
              </p>
            </div>

            <DateInfo info={infoText} submittedDate={kyc?.createdAt} rejectedDate={kyc?.updatedAt} />

            {referralCode && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-white text-14 font-medium">
                    <Trans>Refer a Friend</Trans>
                  </span>
                  <InfoIcon />
                </div>
                <div
                  className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex items-center justify-between cursor-pointer hover:bg-[#252631] transition-colors max-w-[280px] mx-auto"
                  onClick={handleCopyReferralCode}
                >
                  <span className="text-white text-14 font-medium">{referralCode}</span>
                  <CopyIcon />
                </div>
              </div>
            )}
          </div>
        )

      case KYCStatuses.CHANGES_REQUESTED:
        return (
          <div className="space-y-8">
            <div className="text-center text-white space-y-5">
              <p className="text-18 font-medium opacity-50">
                <Trans>{config?.name || 'IXS'} KYC</Trans>
              </p>
              <h1 className="text-3xl font-bold text-yellow-500">
                <Trans>Changes Required</Trans>
              </h1>
            </div>

            <div className="bg-[#F7F7FA] p-8 rounded-lg max-w-[360px] mx-auto">
              <h3 className="text-dark-200 font-semibold text-center mb-4">
                <Trans>Changes Required</Trans>
              </h3>
              <p className="text-dark-200 text-center text-sm mb-6">
                We kindly inform you that adjustments are needed in your KYC submission. Please review the provided
                documentation and make the necessary changes to ensure compliance with our verification standards. Your
                cooperation in this matter is appreciated.
              </p>
              <Link
                to={
                  kyc?.corporateKycId
                    ? `/kyc/corporate`
                    : new URL(window.location.href).href?.split('=')[1]
                    ? `/kyc/individual?referralCode=${new URL(window.location.href).href?.split('=')[1]}`
                    : `/kyc/individual`
                }
                className="no-underline"
              >
                <button className="w-full bg-primary text-white px-6 py-3 rounded-32 font-medium hover:bg-primary-dark transition-colors shadow-lg">
                  <Trans>Make changes and resend KYC</Trans>
                </button>
              </Link>
            </div>

            <DateInfo info={infoText} submittedDate={kyc?.createdAt} changeRequestDate={kyc?.updatedAt} />

            {referralCode && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-white text-14 font-medium">
                    <Trans>Refer a Friend</Trans>
                  </span>
                  <InfoIcon />
                </div>
                <div
                  className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex items-center justify-between cursor-pointer hover:bg-[#252631] transition-colors max-w-[280px] mx-auto"
                  onClick={handleCopyReferralCode}
                >
                  <span className="text-white text-14 font-medium">{referralCode}</span>
                  <CopyIcon />
                </div>
              </div>
            )}
          </div>
        )

      case KYCStatuses.IN_PROGRESS:
      case KYCStatuses.FAILED:
        return (
          <div className="space-y-8">
            <div className="text-center text-white space-y-5">
              <p className="text-18 font-medium opacity-50">
                <Trans>{config?.name || 'IXS'} KYC</Trans>
              </p>
              <h1 className="text-3xl font-bold">
                <Trans>{status === KYCStatuses.IN_PROGRESS ? 'KYC In Progress' : 'KYC Failed'}</Trans>
              </h1>
              <p className="text-light-300">{getStatusDescription(status)}</p>
            </div>
            <DateInfo info={infoText} submittedDate={kyc?.updatedAt || kyc?.createdAt} />
            {referralCode && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-white text-14 font-medium">
                    <Trans>Refer a Friend</Trans>
                  </span>
                  <InfoIcon />
                </div>
                <div
                  className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex items-center justify-between cursor-pointer hover:bg-[#252631] transition-colors max-w-[280px] mx-auto"
                  onClick={handleCopyReferralCode}
                >
                  <span className="text-white text-14 font-medium">{referralCode}</span>
                  <CopyIcon />
                </div>
              </div>
            )}
          </div>
        )

      default:
        return renderKYCContent()
    }
  }, [status, description, kyc, chainId, referralCode])

  // Show connect wallet if not connected
  if (!account) {
    return (
      <TailwindThemeProvider>
        <div className="w-full h-screen bg-dark-200 flex items-center justify-center">
          <ConnectWalletCard />
        </div>
      </TailwindThemeProvider>
    )
  }

  return (
    <TailwindThemeProvider>
      <EmailVerification {...modalProps} closeModal={closeModal} />
      <div className="w-full min-h-screen bg-dark-200 pt-16">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-[580px]">{renderKYCContent()}</div>
        </div>
      </div>
    </TailwindThemeProvider>
  )
}

export default KYC
