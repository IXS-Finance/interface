import React, { useCallback, useEffect, useState } from 'react'

import { AccountControl, AccountSection, InfoCard, UpperSection, YourAccount } from './styleds'
import { Line } from 'components/Line'
import { useGetMe } from 'state/user/hooks'
import { useKYCState } from 'state/kyc/hooks'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import ReferFriend from './ReferFriend'
import KycStatus from './KycStatus'
import Avatar from './Avatar'
import WalletInfo from './WalletInfo'
import { useLogout } from 'state/auth/hooks'

interface AccountDetailsProps {
  toggleWalletModal: () => void
  ENSName?: string
}

export default function AccountDetails({ ENSName, toggleWalletModal }: AccountDetailsProps) {
  const { disconnectWallet } = useLogout()
  const { config } = useWhitelabelState()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const getMe = useGetMe()

  const { kyc } = useKYCState()

  const supportEmail = config?.supportEmail || 'c@ixs.finance'

  const fetchMe = useCallback(async () => {
    const result = await getMe()
    setReferralCode(result?.referralCode)
  }, [getMe, history])

  useEffect(() => {
    fetchMe()
  }, [])

  const handleDisconnect = async () => {
    disconnectWallet();
    toggleWalletModal();
  }

  return (
    <>
      <UpperSection>
        <Avatar kyc={kyc} toggleWalletModal={toggleWalletModal} />

        <AccountSection>
          <YourAccount>
            <InfoCard>
              <Line style={{ marginTop: '24px' }} />
              <WalletInfo ENSName={ENSName} disconnectWallet={handleDisconnect} />

              <Line style={{ marginTop: '10px' }} />

              <KycStatus kyc={kyc} toggleWalletModal={toggleWalletModal} />

              <Line style={{ marginTop: '10px' }} />

              {referralCode && <ReferFriend referralCode={referralCode} />}

              <Line style={{ marginTop: '10px' }} />
              <AccountControl style={{ marginTop: 8, marginBottom: 16 }}>
                <span style={{ color: '#666680', fontSize: '13px', fontWeight: '500' }}>
                  In order to make changes to your KYC please <br /> get in touch with us via
                  <span>
                    <a href={`mailto:${supportEmail}`} style={{ color: '#6666FF', marginLeft: '5px' }}>
                      {supportEmail}
                    </a>
                  </span>
                </span>
              </AccountControl>
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </UpperSection>
    </>
  )
}
