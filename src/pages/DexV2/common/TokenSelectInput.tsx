import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as ChevDown } from 'assets/images/dex-v2/chev-down.svg'
import SelectTokenModal from './SelectTokenModal'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

interface TokenSelectInputProps {
  modelValue: string
  excludedTokens?: string[]
  updateAddress: (address: string) => void
}

const TokenSelectInput: React.FC<TokenSelectInputProps> = ({ modelValue, excludedTokens = [], updateAddress }) => {
  const { getToken } = useTokens()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const hasToken = useMemo(() => !!modelValue, [modelValue])

  const token = useMemo(() => {
    if (!hasToken || !modelValue) {
      return null
    }

    return getToken(modelValue)
  }, [modelValue])

  const onClose = () => {
    setIsModalOpen(false)
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  return (
    <div>
      <TokenSelectInputWrapper onClick={toggleModal}>
        {token ? (
          <TokenSelected>
            <img src={token.logoURI} alt={token.symbol} width={20} height={20} />
            <span>{token.symbol}</span>
          </TokenSelected>
        ) : (
          <SelectText>Select token</SelectText>
        )}

        <ChevDown />
      </TokenSelectInputWrapper>

      {isModalOpen ? (
        <SelectTokenModal
          excludedTokens={[...excludedTokens, modelValue]}
          updateAddress={updateAddress}
          onClose={onClose}
        />
      ) : null}
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
`

const TokenSelected = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const SelectText = styled.span`
  color: rgba(102, 102, 255, 0.9);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`
