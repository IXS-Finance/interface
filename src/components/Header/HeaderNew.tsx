import React from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useActiveWeb3React } from 'hooks/web3'

// Asset imports from Figma
const networkIcon = "http://localhost:3845/assets/9ecd8db1b543699f5a240338682cbf148a91cdbb.png"
const networkDotIcon = "http://localhost:3845/assets/4146ef8c12ed7ccc79b0ac8b135b929f2aa311b9.svg"
const copyIcon = "http://localhost:3845/assets/30cb6f73968a224aceb7fae84af61f77867ad05d.svg"

interface HeaderNewProps {
  className?: string
}

const HeaderNew: React.FC<HeaderNewProps> = ({ className }) => {
  const { account } = useActiveWeb3React()
  const { openConnectModal } = useConnectModal()

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal()
    }
  }

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
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
        <div className="backdrop-blur-lg bg-[#222328] flex flex-row gap-2 h-10 items-center justify-end pl-2.5 pr-3 py-3 rounded-[32px]">
          <div className="flex flex-row gap-2 items-center justify-start p-0">
            <div className="relative w-5 h-5">
              <img
                src={networkIcon}
                alt="Network"
                className="w-full h-full object-contain"
                width="20"
                height="20"
              />
            </div>
            <div className="relative w-[5px] h-[3px]">
              <img
                src={networkDotIcon}
                alt="Network Status"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="backdrop-blur-lg bg-[#222328] flex flex-row gap-2 items-center justify-end pl-4 pr-3 py-2 rounded-[32px]">
          <span className="font-inter font-medium text-white text-base leading-6 whitespace-nowrap">
            {formatAddress(account)}
          </span>
          <button
            onClick={handleCopyAddress}
            className="opacity-50 overflow-hidden relative w-5 h-5 cursor-pointer transition-opacity duration-200 hover:opacity-75"
          >
            <div className="absolute left-1/2 w-[18px] h-[18px] top-1/2 -translate-x-1/2 -translate-y-1/2">
              <img
                src={copyIcon}
                alt="Copy Address"
                className="w-full h-full object-contain"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default HeaderNew
