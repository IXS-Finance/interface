import React from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useActiveWeb3React } from 'hooks/web3'

import { NetworkCard } from './NetworkCard'
import AccountDropdown from './AccountDropdown'

interface HeaderNewProps {
  className?: string
}

const HeaderNew: React.FC<HeaderNewProps> = ({ className }) => {
  const { account } = useActiveWeb3React()
  const { openConnectModal } = useConnectModal()

  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal()
    }
  }

  if (!account) {
    // Disconnected State
    return (
      <div className={`flex flex-row gap-2 items-start justify-end p-0 w-full ${className || ''}`}>
        <div className="flex flex-row gap-2 items-center justify-end p-0">
          <button
            onClick={handleConnectWallet}
            className="backdrop-blur-lg bg-white flex flex-row gap-2 items-center justify-end px-4 py-2 rounded-[32px] cursor-pointer transition-all duration-200 hover:bg-gray-100"
          >
            <span className="font-inter font-medium text-[#222328] text-base leading-6 whitespace-nowrap">
              Connect Wallet
            </span>
          </button>
        </div>
      </div>
    )
  }

  // Connected State
  return (
    <div className={`flex flex-row gap-2 items-center justify-end p-0 w-full ${className || ''}`}>
      <div className="flex flex-row gap-2 items-center justify-end p-0">
        {/* Network Status */}
        <NetworkCard />

        {/* Account Dropdown */}
        <AccountDropdown />
      </div>
    </div>
  )
}

export default HeaderNew
