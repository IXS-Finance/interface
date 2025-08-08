import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/web3'
import useENSName from 'hooks/useENSName'
import { useAccount } from 'hooks/useAccount'
import { useNativeCurrency } from 'hooks/useNativeCurrency'
import useCopyClipboard from 'hooks/useCopyClipboard'
import { useWalletModalToggle } from 'state/application/hooks'
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { useETHBalances } from 'state/wallet/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { shortenAddress } from 'utils'
import { formatAmount } from 'utils/formatCurrencyAmount'
import { CONNECTOR_ICON_OVERRIDE_MAP } from 'components/Web3Provider/constants'
import Loader from 'components/Loader'
import settingIcon from 'assets/images/new-dark-ui/layout/setting.svg'
import shutdownIcon from 'assets/images/new-dark-ui/layout/shutdown.svg'
import openLinkIcon from 'assets/images/new-dark-ui/layout/open-link.svg'
import editIcon from 'assets/images/new-dark-ui/layout/edit.svg'
import copyIcon from 'assets/images/new-dark-ui/layout/copy.svg'
// KYC Status Icons
import draftIcon from 'assets/images/new-dark-ui/kyc/draft.svg'
import approvedIcon from 'assets/images/new-dark-ui/kyc/approved.svg'
import rejectedIcon from 'assets/images/new-dark-ui/kyc/rejected.svg'
import changesRequestedIcon from 'assets/images/new-dark-ui/kyc/changesRequested.svg'
import pendingIcon from 'assets/images/new-dark-ui/kyc/pending.svg'
// Import user state hooks
import { useUserState, useGetMe } from 'state/user/hooks'
import { useKYCState } from 'state/kyc/hooks'
import { KYCStatuses } from 'pages/KYC/enum'
import { useLogout } from 'state/auth/hooks'
import { useHistory } from 'react-router-dom'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import CopyHelper from 'components/AccountDetails/Copy'
import { getStatusInfo } from 'pages/KYC/styleds'
import { routes } from 'utils/routes'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

interface AccountDropdownProps {
  className?: string
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({ className }) => {
  const { account, chainId } = useActiveWeb3React()
  const { connector } = useAccount()
  const { ENSName } = useENSName(account ?? undefined)
  const toggleWalletModal = useWalletModalToggle()
  const allTransactions = useAllTransactions()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const nativeCurrency = useNativeCurrency()
  const history = useHistory()
  const { disconnectWallet } = useLogout()

  // User state
  const { me } = useUserState()
  const { kyc } = useKYCState()
  const { config } = useWhitelabelState()
  const getMe = useGetMe()

  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setCopied] = useCopyClipboard()
  const [referralCopied, setReferralCopied] = useCopyClipboard()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchMe = async () => {
      if (account && !me?.id) {
        const result = await getMe()
        setReferralCode(result?.referralCode)
      } else if (me?.referralCode) {
        setReferralCode(me.referralCode)
      }
    }
    fetchMe()
  }, [account, me, getMe])

  // Transaction logic from Web3Status
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs
      .filter(isTransactionRecent)
      .sort((a: TransactionDetails, b: TransactionDetails) => b.addedTime - a.addedTime)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const hasPendingTransactions = !!pending.length

  // Wallet connector icon logic from Web3Status
  const connectorIcon = connector ? CONNECTOR_ICON_OVERRIDE_MAP[connector?.id] ?? connector?.icon : undefined

  // Real user data from state - following AccountDetails patterns
  const userInfo = useMemo(() => {
    // Generate name and avatar following Avatar.tsx pattern
    const firstName = kyc?.individual?.firstName
    const corporateName = kyc?.corporate?.corporateName
    const fullName = kyc?.individual?.fullName
    const email = kyc?.individual?.email || kyc?.corporate?.email || me?.email

    const displayName = fullName || corporateName || (email ? email.split('@')[0] : 'User')
    const avatar = firstName
      ? firstName.charAt(0).toUpperCase()
      : corporateName
      ? corporateName.charAt(0).toUpperCase()
      : displayName.charAt(0).toUpperCase()

    // Get KYC status using the same logic as KycStatus.tsx
    const status = kyc?.status || KYCStatuses.NOT_SUBMITTED
    const { text: kycStatusText } = getStatusInfo(status)

    return {
      name: displayName,
      email: email || 'user@example.com',
      avatar: avatar,
      kycStatus: kycStatusText,
      referralCode: referralCode || me?.referralCode || '000000',
      hasKycData: !!(kyc?.individual || kyc?.corporate),
    }
  }, [me, kyc, referralCode])

  // Get KYC status styling based on status - matches indexDark.tsx styling
  const getKYCStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return {
          backgroundColor: '#36b24a',
          icon: approvedIcon,
          iconType: 'image' as const,
        }
      case 'rejected':
        return {
          backgroundColor: '#ff8080',
          icon: rejectedIcon,
          iconType: 'image' as const,
        }
      case 'pending':
      case 'pending approval':
      case 'in progress':
        return {
          backgroundColor: '#ffaa00',
          icon: pendingIcon,
          iconType: 'image' as const,
        }
      case 'draft':
      case 'not submitted':
        return {
          backgroundColor: '#b3b3b3',
          icon: draftIcon,
          iconType: 'image' as const,
        }
      case 'changes requested':
        return {
          backgroundColor: '#48a1f3',
          icon: changesRequestedIcon,
          iconType: 'image' as const,
        }
      default:
        return {
          backgroundColor: '#b3b3b3',
          icon: draftIcon,
          iconType: 'image' as const,
        }
    }
  }

  const kycStyle = getKYCStatusStyle(userInfo.kycStatus)

  const formatAddress = (address: string) => {
    if (!address) return ''
    return shortenAddress(address, 4)
  }

  const handleCopyAddress = () => {
    if (account) {
      setCopied(account)
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleWalletClick = () => {
    toggleWalletModal()
  }

  const handleEditProfile = () => {
    // Navigate to profile edit page or open edit modal - following Avatar.tsx pattern
    setIsOpen(false)
    // Could open a resend email modal or navigate to profile edit
  }

  const handleLogout = () => {
    // Follow WalletInfo.tsx disconnect pattern
    disconnectWallet()
    setIsOpen(false)
  }

  const handleKycNavigation = () => {
    // Follow KycStatus.tsx navigation pattern
    setIsOpen(false)
    history.push(routes.kyc)
  }

  // Support email from whitelabel config, following AccountDetails pattern
  const supportEmail = config?.supportEmail || 'c@ixs.finance'

  // Explorer link for wallet address, following WalletInfo.tsx pattern
  const explorerLink = account && chainId ? getExplorerLink(chainId, account, ExplorerDataType.ADDRESS) : ''

  // Copy handlers following AccountDetails patterns
  const handleCopyReferral = () => {
    // Follow ReferFriend.tsx pattern - copy full referral URL
    const referralUrl = `${window.location.origin}/#/kyc?referralCode=${userInfo.referralCode}`
    setReferralCopied(referralUrl)
  }

  // Get display text - ENS name or shortened address
  const displayText = ENSName || formatAddress(account)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!account) {
    return null
  }

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        className={`backdrop-blur-lg flex flex-row gap-2 items-center justify-end pl-4 pr-3 py-2 rounded-[32px] cursor-pointer transition-colors ${
          isOpen ? 'bg-white hover:bg-gray-100' : 'bg-[#222328] hover:bg-[#2a2b32]'
        }`}
      >
        {/* Wallet Connector Icon */}
        {!hasPendingTransactions && connectorIcon && (
          <div className="w-5 h-5 flex items-center justify-center">
            <img src={connectorIcon} alt="Wallet" className="w-full h-full rounded-full object-contain" />
          </div>
        )}

        {/* Text or Pending Transactions */}
        {hasPendingTransactions ? (
          <div className="flex items-center gap-2">
            <span
              className={`font-inter font-medium text-base leading-6 whitespace-nowrap ${
                isOpen ? 'text-[#16171c]' : 'text-white'
              }`}
            >
              <Trans>{pending?.length} Pending</Trans>
            </span>
            <Loader stroke={isOpen ? '#16171c' : 'white'} size="16px" />
          </div>
        ) : (
          <span
            className={`font-inter font-medium text-base leading-6 whitespace-nowrap ${
              isOpen ? 'text-[#16171c]' : 'text-white'
            }`}
          >
            {displayText}
          </span>
        )}

        <div className="opacity-50 overflow-hidden relative w-5 h-5 transition-opacity duration-200 hover:opacity-75">
          <div className="absolute left-1/2 w-[18px] h-[18px] top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img
              src={settingIcon}
              alt="Settings"
              className={`w-full h-full object-contain ${isOpen ? 'filter invert' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[400px] bg-[#16171c] border border-[#222328] rounded-2xl p-8 z-50">
          {/* User Info Header - Following Avatar.tsx pattern */}
          <div className="flex flex-row items-center justify-between mb-6">
            <div className="flex flex-row gap-4 items-center">
              {/* Avatar - Show if we have KYC data, following Avatar.tsx pattern */}
              <div className="relative">
                {userInfo.hasKycData ? (
                  <div className="bg-[#0073ff] rounded-full w-12 h-12 flex items-center justify-center">
                    <span className="font-inter font-semibold text-white text-2xl leading-9">{userInfo.avatar}</span>
                  </div>
                ) : (
                  <div className="bg-[#666680] rounded-full w-12 h-12 flex items-center justify-center">
                    <span className="font-inter font-semibold text-white text-2xl leading-9">{userInfo.avatar}</span>
                  </div>
                )}
              </div>

              {/* User Details - Show if we have user data */}
              {(userInfo.hasKycData || userInfo.email !== 'user@example.com') && (
                <div className="flex flex-col">
                  <span className="font-inter font-medium text-white text-lg leading-7">{userInfo.name}</span>
                  <span className="font-inter font-medium text-white/50 text-lg leading-7">{userInfo.email}</span>
                </div>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex flex-row gap-2 items-center">
              <button onClick={handleEditProfile} className="w-5 h-5 opacity-100 hover:opacity-75 transition-opacity">
                <img src={editIcon} alt="Edit" className="w-full h-full object-contain" />
              </button>
              <button onClick={handleLogout} className="w-5 h-5 opacity-100 hover:opacity-75 transition-opacity">
                <img src={shutdownIcon} alt="Disconnect" className="w-full h-full object-contain" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full mb-6"></div>

          {/* Connected Section */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-row gap-1.5 items-center">
              <span className="font-inter font-medium text-white text-base leading-6">Connected</span>
            </div>

            {/* Wallet Address */}
            <div className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex flex-row items-center justify-between">
              <span className="font-inter font-medium text-white text-base leading-6">
                {isCopied ? 'Copied!' : ENSName || formatAddress(account)}
              </span>
              <div className="flex flex-row gap-2 items-center">
                <button onClick={handleCopyAddress} className="w-5 h-5 hover:opacity-75 transition-opacity">
                  <img src={copyIcon} alt="Copy" className="w-full h-full object-contain" />
                </button>
                {explorerLink && (
                  <a
                    href={explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-5 h-5 hover:opacity-75 transition-opacity"
                  >
                    <img src={openLinkIcon} alt="View on Explorer" className="w-full h-full object-contain" />
                  </a>
                )}
              </div>
            </div>

            {/* Balance Display */}
            {account && userEthBalance && (
              <div className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex flex-row items-center justify-between">
                <span className="font-inter font-medium text-white text-base leading-6">
                  {formatAmount(+(userEthBalance?.toSignificant(4) || 0))} {nativeCurrency?.symbol}
                </span>
                <div className="flex flex-row gap-2 items-center">
                  {connectorIcon && (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <img src={connectorIcon} alt="Wallet" className="w-full h-full rounded-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="bg-[#222328] h-px w-full mb-6"></div>

          {/* Refer a Friend Section - Only show if referralCode exists, following AccountDetails pattern */}
          {userInfo.referralCode && userInfo.referralCode !== '000000' && (
            <>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex flex-row gap-1.5 items-center">
                  <span className="font-inter font-medium text-white text-base leading-6">Refer a Friend</span>
                </div>
                <div className="bg-[#202126] border border-[#353840] rounded-2xl px-4 py-[15px] h-[50px] flex flex-row items-center justify-between">
                  <span className="font-inter font-medium text-white text-base leading-6">
                    {referralCopied ? 'Copied!' : userInfo.referralCode}
                  </span>
                  <button onClick={handleCopyReferral} className="w-5 h-5 hover:opacity-75 transition-opacity">
                    <img src={copyIcon} alt="Copy" className="w-full h-full object-contain" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="bg-[#222328] h-px w-full mb-6"></div>
            </>
          )}

          {/* KYC Status Section */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-row gap-1.5 items-center">
              <span className="font-inter font-medium text-white text-base leading-6">KYC Status</span>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <div
                id="kyc-status"
                className="flex-1 rounded-[50px] px-8 py-3 h-[50px] flex flex-row gap-2 items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: kycStyle.backgroundColor }}
                onClick={handleKycNavigation}
              >
                <span className="font-inter font-medium text-white text-base leading-6">{userInfo.kycStatus}</span>
                <div className="w-5 flex items-center justify-center">
                  <img src={kycStyle.icon} alt={userInfo.kycStatus} className="w-full h-auto" />
                </div>
              </div>
              <button onClick={handleKycNavigation} className="w-5 h-5 hover:opacity-75 transition-opacity">
                <img src={openLinkIcon} alt="Navigate to KYC" className="w-full h-full object-contain" />
              </button>
            </div>
          </div>

          {/* Footer Text - Following AccountDetails pattern */}
          <div className="text-sm leading-5 text-white/50">
            <span>In order to make changes to your KYC please get in touch with us via </span>
            <a href={`mailto:${supportEmail}`} className="text-white no-underline hover:underline">
              {supportEmail}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountDropdown
