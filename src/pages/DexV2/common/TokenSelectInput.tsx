import React, { useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as ChevDown } from 'assets/images/dex-v2/chev-down.svg'
import SelectTokenModal from './modals/SelectTokenModal'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import Asset from './Asset'

export interface TokenSelectInputProps {
  fixed?: boolean
  modelValue: string
  excludedTokens?: string[]
  updateAddress: (address: string) => void
}

const TokenSelectInput: React.FC<TokenSelectInputProps> = ({
  fixed = false,
  modelValue,
  excludedTokens = [],
  updateAddress,
}) => {
  const { getToken } = useTokens()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Compute token existence inline.
  const hasToken = modelValue !== ''
  const token = hasToken ? getToken(modelValue) : null

  const onClose = () => {
    setIsModalOpen(false)
  }

  const toggleModal = () => {
    if (!fixed) {
      setIsModalOpen(!isModalOpen)
    }
  }

  return (
    <div>
      <TokenSelectInputWrapper onClick={toggleModal}>
        {token ? (
          <TokenSelected>
            <Asset address={token.address} iconURI={token.logoURI} size={20} />
            <span>{token.symbol}</span>
          </TokenSelected>
        ) : (
          <SelectText>Select token</SelectText>
        )}

        {!fixed ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        ) : null}
      </TokenSelectInputWrapper>

      {isModalOpen && (
        <SelectTokenModal
          excludedTokens={[...excludedTokens, modelValue]}
          updateAddress={updateAddress}
          onClose={onClose}
        />
      )}
    </div>
  )
}

export default TokenSelectInput

const TokenSelectInputWrapper = styled.div`
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  display: flex;
  padding: 8px 12px 8px 8px;
  align-items: center;
  gap: 8px;
  color: rgba(102, 102, 255, 0.9);
`

const TokenSelected = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const SelectText = styled.span`
  color: rgba(102, 102, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
`
