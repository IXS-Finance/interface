import React from 'react'
import { X } from 'react-feather'

import { LoaderThin } from 'components/Loader/LoaderThin'
import { useLogout } from 'state/auth/hooks'
import { useWalletState } from 'state/wallet/hooks'

// Asset imports from Figma
const walletIcon = "http://localhost:3845/assets/1468e58e10f9d332649751faf1d4b706da483e5e.svg"

interface SignMessageModalProps {
  loading?: boolean
  authenticate: () => void
}

const SignMessageModal: React.FC<SignMessageModalProps> = ({ authenticate }) => {
  const { isSignLoading } = useWalletState()
  const { disconnectWallet } = useLogout()

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1b1c21] flex flex-col gap-8 items-center justify-start px-8 py-12 relative rounded-2xl w-full max-w-[580px] mx-auto shadow-2xl">
          {/* Close Button */}
          <button
            onClick={() => disconnectWallet()}
            className="absolute right-4 top-4 w-6 h-6 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200"
          >
            <X size={16} />
          </button>

          {/* Wallet Icon */}
          <div className="w-20 h-20">
            <img src={walletIcon} alt="Wallet" className="w-full h-full object-contain" />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2 items-center justify-start w-full">
            <h1 className="font-inter font-bold text-white text-2xl text-center whitespace-nowrap">
              Verify your account
            </h1>
            <p className="font-inter font-medium text-white/60 text-xl text-center leading-[1.5] tracking-[-0.2px] max-w-[354px]">
              Please sign the message in your wallet to verify your account ownership
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-2 items-center justify-center w-full">
            <button
              onClick={() => disconnectWallet()}
              className="bg-[#222328] flex items-center justify-center px-8 py-3 rounded-[50px] h-[50px] min-w-[160px] transition-all duration-200 hover:bg-[#2a2b30]"
            >
              <span className="font-inter font-medium text-white text-base leading-[1.4]">
                Cancel
              </span>
            </button>
            <button
              onClick={() => authenticate()}
              disabled={isSignLoading}
              className="bg-white flex items-center justify-center px-8 py-3 rounded-[50px] h-[50px] min-w-[160px] transition-all duration-200 hover:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="font-inter font-medium text-[#16171c] text-base leading-[1.4] flex items-center gap-2">
                {isSignLoading && <LoaderThin size={12} />}
                Sign Message
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignMessageModal
