import React, { useCallback, useState, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { Link, useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import _get from 'lodash/get'
import { useWeb3React } from 'hooks/useWeb3React'

import { TailwindThemeProvider } from '../../hooks/useTailwindTheme'
import { useKYCState } from 'state/kyc/hooks'
import { ReactComponent as IndividualKYC } from 'assets/images/newIndividual.svg'
import { ReactComponent as CorporateKYC } from 'assets/images/newCorporate.svg'
import { KYCStatuses } from './enum'
import copyFrameIcon from 'assets/images/new-dark-ui/kyc/copy-frame.svg'
import draftIcon from 'assets/images/new-dark-ui/kyc/draft.svg'
import infoIcon from 'assets/images/new-dark-ui/kyc/info.svg'
import approvedIcon from 'assets/images/new-dark-ui/kyc/approved.svg'
import rejectedIcon from 'assets/images/new-dark-ui/kyc/rejected.svg'
import changesRequestedIcon from 'assets/images/new-dark-ui/kyc/changesRequested.svg'
import pendingIcon from 'assets/images/new-dark-ui/kyc/pending.svg'
import copyIcon from 'assets/images/new-dark-ui/kyc/copy.svg'

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
  const statusDescriptions: Record<string, string> = {
    [KYCStatuses.NOT_SUBMITTED]: 'To access all features of the platform, please complete the KYC verification process.',
    [KYCStatuses.DRAFT]: 'Your KYC application is saved as draft. Please complete and submit it.',
    [KYCStatuses.PENDING]: 'Your KYC verification is being reviewed. This process may take 1-3 business days.',
    [KYCStatuses.APPROVED]: 'Your KYC verification has been approved. You now have full access to the platform.',
    [KYCStatuses.REJECTED]: 'Your KYC verification has been rejected. Please review the feedback and resubmit.',
    [KYCStatuses.CHANGES_REQUESTED]: 'Changes are required for your KYC verification. Please review and update your submission.',
    [KYCStatuses.IN_PROGRESS]: 'Your KYC verification is currently in progress.',
    [KYCStatuses.FAILED]: 'Your KYC verification has failed. Please try again.',
  }

  return statusDescriptions[status] || 'Please complete your KYC verification to access all platform features.'
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

  const getCorporateKYCLink = () => {
    const referralCodeParam = new URL(window.location.href).href?.split('=')[1]
    const baseLink = '/kyc/corporate'
    return referralCodeParam ? `${baseLink}?referralCode=${referralCodeParam}` : baseLink
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

  // KYC Status Components as object literal instead of switch case
  const kycStatusRenderers = useMemo(() => ({
    [KYCStatuses.NOT_SUBMITTED]: () => (
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
    ),

    [KYCStatuses.DRAFT]: () => (
      <div className="flex flex-col gap-20 items-center justify-center w-full">
        <div className="flex flex-col gap-12 items-center justify-start w-full max-w-[580px]">
          {/* Title Section */}
          <div className="flex flex-col gap-5 items-center justify-start w-full">
            <h1 className="font-inter font-bold text-white text-5xl text-center tracking-[-0.48px] leading-[1.2] w-full">
              <Trans>{kyc?.corporate ? 'Corporate KYC' : 'Individual KYC'}</Trans>
            </h1>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Draft Status and Continue Button */}
          <div className="flex flex-row items-center justify-between w-full">
            {/* Draft Status Badge */}
            <div className="bg-[#b3b3b3] flex flex-row gap-2 h-[50px] items-center justify-center px-8 py-3 rounded-[50px]">
              <span className="font-inter font-medium text-white text-base leading-[1.4] whitespace-nowrap">
                Draft
              </span>
              <div className="w-5 h-5">
                <img src={draftIcon} alt="Draft" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Continue Button - Individual KYC */}
            {kyc?.individual && (
              <Link to={getKYCLink()} className="no-underline">
                <button className="bg-white flex flex-row gap-2 h-[50px] items-center justify-center px-8 py-3 rounded-[50px] font-inter font-medium text-[#16171c] text-base leading-[1.4] whitespace-nowrap transition-colors hover:bg-gray-100">
                  <Trans>Continue Pass KYC as Individual</Trans>
                </button>
              </Link>
            )}

            {/* Continue Button - Corporate KYC */}
            {kyc?.corporate && (
              <Link to={getCorporateKYCLink()} className="no-underline">
                <button className="bg-white flex flex-row gap-2 h-[50px] items-center justify-center px-8 py-3 rounded-[50px] font-inter font-medium text-[#16171c] text-base leading-[1.4] whitespace-nowrap transition-colors hover:bg-gray-100">
                  <Trans>Continue Pass KYC as Corporate</Trans>
                </button>
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Refer a Friend Section */}
          {referralCode && (
            <div className="flex flex-col gap-3 items-start justify-start w-full">
              <div className="flex flex-row gap-1.5 items-center justify-start w-full">
                <span className="font-inter font-medium text-white text-14 leading-[1.4] whitespace-nowrap">
                  <Trans>Refer a Friend</Trans>
                </span>
                <InfoIcon />
              </div>
              <div
                className="bg-[#202126] border border-[#353840] flex flex-row h-[50px] items-center justify-between px-4 py-[15px] rounded-2xl w-full cursor-pointer hover:bg-[#252631] transition-colors"
                onClick={handleCopyReferralCode}
              >
                <span className="font-inter font-medium text-white text-14 leading-[1.4] whitespace-nowrap">
                  {referralCode}
                </span>
                <div className="w-5 h-5">
                  <img src={copyFrameIcon} alt="Copy" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Info Text */}
          <div className="font-inter font-medium text-white/50 text-18 text-center leading-[1.4] w-[369px]">
            In order to make changes to your KYC please get in touch with us via{' '}
            <span className="text-white">info@ixs.finance</span>
          </div>
        </div>
      </div>
    ),

    [KYCStatuses.PENDING]: () => (
      <div className="flex flex-col gap-20 items-center justify-center w-full">
        <div className="flex flex-col gap-12 items-center justify-start w-[580px]">
          {/* Title Section */}
          <div className="flex flex-col gap-5 items-center justify-start w-full">
            <h1 className="font-inter font-bold text-white text-[48px] text-center tracking-[-0.48px] leading-[1.2] w-full">
              <Trans>{kyc?.corporateKycId ? 'Corporate KYC' : 'Individual KYC'}</Trans>
            </h1>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Status and Date Row */}
          <div className="flex flex-row items-center justify-between w-full">
            {/* Pending Approval Badge */}
            <div className="bg-[#ffaa00] flex flex-row gap-2 h-[50px] items-center justify-center px-8 py-3 rounded-[50px]">
              <span className="font-inter font-medium text-white text-base leading-[1.4] whitespace-nowrap">
                Pending Approval
              </span>
              <div className="w-5 h-5">
                <img src={pendingIcon} alt="Pending" className="w-full h-full" />
              </div>
            </div>

            {/* Date Information */}
            <div className="font-inter font-medium text-white/50 text-sm text-left whitespace-nowrap leading-[1.4]">
              <p className="block leading-[1.4] whitespace-nowrap">
                Submitted on {kyc?.createdAt ? dayjs(kyc.createdAt).utc().format('MMM DD, HH:mm') : 'Jan 30, 21:48'} (UTC)
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Refer a Friend Section */}
          <div className="flex flex-col gap-3 items-start justify-start w-full">
            <div className="flex flex-row gap-1.5 items-center justify-start w-full">
              <span className="font-inter font-medium text-white text-sm leading-[1.4] whitespace-nowrap">
                Refer a Friend
              </span>
              <div className="w-3 h-3">
                <img src={infoIcon} alt="Info" className="w-full h-full" />
              </div>
            </div>
            <div className="bg-[#202126] border border-[#353840] flex flex-row h-[50px] items-center justify-between px-4 py-[15px] rounded-2xl w-full cursor-pointer hover:bg-[#252631] transition-colors">
              <span className="font-inter font-medium text-white text-sm leading-[1.4] whitespace-nowrap">
                {referralCode || '456132'}
              </span>
              <div
                className="w-5 h-5 cursor-pointer"
                onClick={handleCopyReferralCode}
              >
                <img src={copyIcon} alt="Copy" className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Contact Section */}
          <div className="font-inter font-medium text-white/50 text-[18px] text-center leading-[1.4] w-[369px]">
            In order to make changes to your KYC please get in touch with us via{' '}
            <span className="text-white">info@ixs.finance</span>
          </div>
        </div>
      </div>
    ),

    [KYCStatuses.APPROVED]: () => (
      <div className="flex flex-col gap-20 items-center justify-center w-full">
        <div className="flex flex-col gap-12 items-center justify-start w-[580px]">
          {/* Title Section */}
          <div className="flex flex-col gap-5 items-center justify-start w-full">
            <h1 className="font-inter font-bold text-white text-[48px] text-center tracking-[-0.48px] leading-[1.2] w-full">
              <Trans>{kyc?.corporateKycId ? 'Corporate KYC' : 'Individual KYC'}</Trans>
            </h1>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Status and Date Row */}
          <div className="flex flex-row items-center justify-between w-full">
            {/* Approved Badge */}
            <div className="bg-[#36b24a] flex flex-row gap-2 h-[50px] items-center justify-center px-8 py-3 rounded-[50px] w-[173px]">
              <span className="font-inter font-medium text-white text-base leading-[1.4] whitespace-nowrap">
                Approved
              </span>
              <div className="h-1.5 w-[9px]">
                <img src={approvedIcon} alt="Approved" className="w-full h-full" />
              </div>
            </div>

            {/* Date Information */}
            <div className="font-inter font-medium text-white/50 text-sm text-right whitespace-pre leading-[1.4]">
              <p className="block mb-0">Submitted on {kyc?.createdAt ? dayjs(kyc.createdAt).utc().format('MMM DD, HH:mm') : 'Jan 30, 21:48'} (UTC)</p>
              <p className="block">Approved on {kyc?.updatedAt ? dayjs(kyc.updatedAt).utc().format('MMM DD, HH:mm') : 'Jan 31, 22:31'} (UTC)</p>
            </div>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Refer a Friend Section */}
          <div className="flex flex-col gap-3 items-start justify-start w-full">
            <div className="flex flex-row gap-1.5 items-center justify-start w-full">
              <span className="font-inter font-medium text-white text-sm leading-[1.4] whitespace-nowrap">
                Refer a Friend
              </span>
              <div className="w-3 h-3">
                <img src={infoIcon} alt="Info" className="w-full h-full" />
              </div>
            </div>
            <div className="bg-[#202126] border border-[#353840] flex flex-row h-[50px] items-center justify-between px-4 py-[15px] rounded-2xl w-full cursor-pointer hover:bg-[#252631] transition-colors">
              <span className="font-inter font-medium text-white text-sm leading-[1.4] whitespace-nowrap">
                {referralCode || '456132'}
              </span>
              <div
                className="w-5 h-5 cursor-pointer"
                onClick={handleCopyReferralCode}
              >
                <img src={copyIcon} alt="Copy" className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Contact Section */}
          <div className="font-inter font-medium text-white/50 text-[18px] text-center leading-[1.4] w-[369px]">
            In order to make changes to your KYC please get in touch with us via{' '}
            <span className="text-white">info@ixs.finance</span>
          </div>
        </div>
      </div>
    ),

    [KYCStatuses.REJECTED]: () => (
      <div className="flex flex-col gap-20 items-center justify-center w-full">
        <div className="flex flex-col gap-12 items-center justify-start w-[580px]">
          {/* Title Section */}
          <div className="flex flex-col gap-5 items-center justify-start w-full">
            <h1 className="font-inter font-bold text-white text-[48px] text-center tracking-[-0.48px] leading-[1.2] w-full">
              <Trans>{kyc?.corporateKycId ? 'Corporate KYC' : 'Individual KYC'}</Trans>
            </h1>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Status and Date Row */}
          <div className="flex flex-row items-center justify-between w-full">
            {/* Rejected Badge */}
            <div className="bg-[#ff8080] flex flex-row gap-2 h-[50px] items-center justify-center px-8 py-3 rounded-[50px]">
              <span className="font-inter font-medium text-white text-base leading-[1.4] whitespace-nowrap">
                Rejected
              </span>
              <div className="w-5 h-5">
                <img src={rejectedIcon} alt="Rejected" className="w-full h-full" />
              </div>
            </div>

            {/* Date Information */}
            <div className="font-inter font-medium text-white/50 text-sm text-right whitespace-pre leading-[1.4]">
              <p className="block mb-0">Submitted on {kyc?.createdAt ? dayjs(kyc.createdAt).utc().format('MMM DD, HH:mm') : 'Jan 30, 21:48'} (UTC)</p>
              <p className="block">Rejected on {kyc?.updatedAt ? dayjs(kyc.updatedAt).utc().format('MMM DD, HH:mm') : 'Jan 31, 22:31'} (UTC)</p>
            </div>
          </div>

          {/* Rejection Reason Section */}
          <div className="bg-[#202126] border border-[#353840] flex flex-col gap-1 items-start justify-center p-8 rounded-2xl w-full">
            <div className="flex flex-row gap-6 items-center justify-start">
              <h3 className="font-inter font-medium text-white text-lg leading-[1.4] whitespace-nowrap">
                Reason for KYC Verification Rejection
              </h3>
            </div>
            <p className="font-inter font-medium text-white/50 text-lg leading-[1.4] min-w-full">
              {description || 'We regret to inform you that your KYC verification has been rejected due to incomplete documentation. Please ensure all required documents are provided and meet our specified criteria for successful verification. Thank you for your cooperation.'}
            </p>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Refer a Friend Section */}
          <div className="flex flex-col gap-3 items-start justify-start w-full">
            <div className="flex flex-row gap-1.5 items-center justify-start w-full">
              <span className="font-inter font-medium text-white text-sm leading-[1.4] whitespace-nowrap">
                Refer a Friend
              </span>
              <div className="w-3 h-3">
                <img src={infoIcon} alt="Info" className="w-full h-full" />
              </div>
            </div>
            <div className="bg-[#202126] border border-[#353840] flex flex-row h-[50px] items-center justify-between px-4 py-[15px] rounded-2xl w-full cursor-pointer hover:bg-[#252631] transition-colors">
              <span className="font-inter font-medium text-white text-sm leading-[1.4] whitespace-nowrap">
                {referralCode || '456132'}
              </span>
              <div
                className="w-5 h-5 cursor-pointer"
                onClick={handleCopyReferralCode}
              >
                <img src={copyIcon} alt="Copy" className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Contact Section */}
          <div className="font-inter font-medium text-white/50 text-[18px] text-center leading-[1.4] w-[369px]">
            In order to make changes to your KYC please get in touch with us via{' '}
            <span className="text-white">info@ixs.finance</span>
          </div>
        </div>
      </div>
    ),

    [KYCStatuses.CHANGES_REQUESTED]: () => (
      <div className="flex flex-col gap-20 items-center justify-center w-full">
        <div className="flex flex-col gap-12 items-center justify-start w-[580px]">
          {/* Title Section */}
          <div className="flex flex-col gap-5 items-center justify-start w-full">
            <h1 className="font-inter font-bold text-white text-[48px] text-center tracking-[-0.48px] leading-[1.2] w-full">
              <Trans>{kyc?.corporateKycId ? 'Corporate KYC' : 'Individual KYC'}</Trans>
            </h1>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Status and Date Row */}
          <div className="flex flex-row items-center justify-between w-full">
            {/* Changes Requested Badge */}
            <div className="bg-[#48a1f3] flex flex-row gap-2 h-[50px] items-center justify-center px-8 py-3 rounded-[50px]">
              <span className="font-inter font-medium text-white text-base leading-[1.4] whitespace-nowrap">
                Changes requested
              </span>
              <div className="w-5 h-5">
                <img src={changesRequestedIcon} alt="Changes requested" className="w-full h-full" />
              </div>
            </div>

            {/* Date Information */}
            <div className="font-inter font-medium text-white/50 text-sm text-right leading-[1.4]">
              <p className="block leading-[1.4] whitespace-nowrap">
                Submitted on {kyc?.createdAt ? dayjs(kyc.createdAt).utc().format('MMM DD, HH:mm') : 'Jan 30, 21:48'} (UTC)
              </p>
            </div>
          </div>

          {/* Changes Required Section */}
          <div className="bg-[#202126] border border-[#353840] flex flex-col gap-[19px] items-start justify-center p-8 rounded-2xl w-full">
            <div className="flex flex-col gap-1 items-start justify-start w-full">
              <div className="flex flex-row gap-6 items-center justify-start">
                <h3 className="font-inter font-medium text-white text-lg leading-[1.4] whitespace-nowrap">
                  Changes Required
                </h3>
              </div>
              <p className="font-inter font-medium text-white/50 text-lg leading-[1.4] min-w-full">
                We kindly inform you that adjustments are needed in your KYC submission. Please review the provided documentation and make the necessary changes to ensure compliance with our verification standards. Your cooperation in this matter is appreciated.
              </p>
            </div>
            <Link
              to={
                kyc?.corporateKycId
                  ? getCorporateKYCLink()
                  : new URL(window.location.href).href?.split('=')[1]
                    ? `/kyc/individual?referralCode=${new URL(window.location.href).href?.split('=')[1]}`
                    : `/kyc/individual`
              }
              className="no-underline"
            >
              <div className="bg-white flex flex-row gap-2 h-[50px] items-center justify-center px-8 py-3 rounded-[50px]">
                <span className="font-inter font-medium text-[#16171c] text-base leading-[1.4] whitespace-nowrap">
                  Make changes and resend KYC
                </span>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Refer a Friend Section */}
          <div className="flex flex-col gap-3 items-start justify-start w-full">
            <div className="flex flex-row gap-1.5 items-center justify-start w-full">
              <span className="font-inter font-medium text-white text-sm leading-[1.4] whitespace-nowrap">
                Refer a Friend
              </span>
              <div className="w-3 h-3">
                <img src={infoIcon} alt="Info" className="w-full h-full" />
              </div>
            </div>
            <div className="bg-[#202126] border border-[#353840] flex flex-row h-[50px] items-center justify-between px-4 py-[15px] rounded-2xl w-full cursor-pointer hover:bg-[#252631] transition-colors">
              <span className="font-inter font-medium text-white text-sm leading-[1.4] whitespace-nowrap">
                {referralCode || '456132'}
              </span>
              <div
                className="w-5 h-5 cursor-pointer"
                onClick={handleCopyReferralCode}
              >
                <img src={copyIcon} alt="Copy" className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full"></div>

          {/* Contact Section */}
          <div className="font-inter font-medium text-white/50 text-[18px] text-center leading-[1.4] w-[369px]">
            In order to make changes to your KYC please get in touch with us via{' '}
            <span className="text-white">info@ixs.finance</span>
          </div>
        </div>
      </div>
    ),

    [KYCStatuses.IN_PROGRESS]: () => (
      <div className="space-y-8">
        <div className="text-center text-white space-y-5">
          <p className="text-18 font-medium opacity-50">
            <Trans>{config?.name || 'IXS'} KYC</Trans>
          </p>
          <h1 className="text-3xl font-bold">
            <Trans>KYC In Progress</Trans>
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
    ),

    [KYCStatuses.FAILED]: () => (
      <div className="space-y-8">
        <div className="text-center text-white space-y-5">
          <p className="text-18 font-medium opacity-50">
            <Trans>{config?.name || 'IXS'} KYC</Trans>
          </p>
          <h1 className="text-3xl font-bold">
            <Trans>KYC Failed</Trans>
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
    ),
  }), [status, kyc, description, referralCode, config, infoText, handleIndividualKYC, handleCorporateKYC, handleCopyReferralCode, getKYCLink])

  // Render KYC Content using object lookup instead of switch case
  const renderKYCContent = useCallback(() => {
    const StatusRenderer = kycStatusRenderers[status]
    return StatusRenderer ? StatusRenderer() : kycStatusRenderers[KYCStatuses.NOT_SUBMITTED]()
  }, [status, kycStatusRenderers])

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
