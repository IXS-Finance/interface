import React, { useMemo, useRef } from 'react'
import { Flex } from 'rebass'
import { useAccount, useSwitchChain } from 'wagmi'

import { CHAIN_INFO, NETWORK_LABELS } from 'constants/chains'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { ReactComponent as Checked } from 'assets/images/new-dark-ui/form/ActiveCheck.svg'
import { CHAINS } from 'components/Web3Provider/constants'
import wrongNetworkImg from 'assets/images/warningRedRec.png'

export const NetworkCard = () => {
  const { chainId, address: account } = useAccount()
  const { isPending, switchChain } = useSwitchChain()

  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.NETWORK_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  const info = chainId ? CHAIN_INFO[chainId] : undefined
  useOnClickOutside(node, open ? toggle : undefined)
  const supportedChains = CHAINS ? CHAINS.map((chain) => chain.id) : []
  const isCorrectNetwork = supportedChains.includes(chainId as number)

  const activeChainName = useMemo(() => chainId && NETWORK_LABELS[chainId], [chainId])

  const handleRowClick = (targetChain: number) => {
    toggle()
    if (chainId !== targetChain) {
      switchChain({ chainId: targetChain })
    }
  }

  return (
    <div className="relative">
      {account && (
        <div ref={node as any} className="mr-1">
          <div
            onClick={() => toggle()}
            className={`cursor-pointer flex h-10 px-3 py-3 pl-2.5 justify-end items-center gap-2 rounded-[32px] backdrop-blur-lg ${
              open ? 'bg-white' : 'bg-[#222328]'
            }`}
          >
            {isPending ? (
              <div className={`text-base font-medium font-inter ${open ? 'text-black' : 'text-white'}`}>
                Switching...
              </div>
            ) : (
              <Flex alignItems="center">
                {isCorrectNetwork ? (
                  <>
                    {info ? (
                      <img
                        src={info.logoUrl}
                        alt={activeChainName || ''}
                        className="h-5 w-5 mr-2 rounded-full"
                      />
                    ) : null}
                    <div className={`text-base font-inter font-medium whitespace-nowrap xl:hidden lg:text-[15px] ${
                      open ? 'text-black' : 'text-white'
                    }`}>
                      {activeChainName}
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={wrongNetworkImg}
                      alt="Wrong Network"
                      className="h-5 w-5 mr-2 rounded-full"
                    />
                    <div className={`text-base font-inter font-medium whitespace-nowrap xl:hidden lg:text-[15px] ${
                      open ? 'text-black' : 'text-white'
                    }`}>
                      Wrong Network
                    </div>
                  </>
                )}
              </Flex>
            )}

            <div className={`flex items-center ${open ? '[&>*]:opacity-100' : '[&>*]:opacity-50'}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="5"
                height="4"
                viewBox="0 0 5 4"
                fill="none"
                className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              >
                <path
                  d="M2.5 3.5L0 0.5H5L2.5 3.5Z"
                  fill={open ? "#16171c" : "#ffffff"}
                />
              </svg>
            </div>
          </div>

          {open && (
            <div className="absolute top-[50px] right-0 w-40 bg-[#16171c] border border-[#222328] rounded-2xl p-2 z-[99] flex flex-col gap-0 min-w-[200px]">
              {CHAINS.map((chain: any) => {
                const targetChain = chain.id
                const isSelected = chainId === targetChain
                return (
                  <div
                    key={targetChain}
                    onClick={() => handleRowClick(targetChain)}
                    className={`flex items-center justify-between p-2 px-4 rounded-[32px] cursor-pointer font-medium text-[15px] font-inter w-full hover:opacity-80 mb-0 text-white ${
                      isSelected ? 'bg-[#222328] backdrop-blur-[16px]' : 'backdrop-blur-lg'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <img
                        src={CHAIN_INFO[targetChain].logoUrl}
                        alt={chain.name}
                        className="h-5 w-5 mr-2 rounded-full"
                      />
                      <div className="flex-1 font-inter text-[15px]">
                        {chain.name}
                      </div>
                    </div>
                    {isSelected && <Checked />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
