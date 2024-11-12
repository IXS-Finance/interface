import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as ChevDown } from 'assets/images/dex-v2/chev-down.svg'
import SelectTokenModal from './SelectTokenModal'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

interface TokenSelectInputProps {
  modelValue?: string
  updateAddress: (address: string) => void
}

const TokenSelectInput: React.FC<TokenSelectInputProps> = ({ modelValue, updateAddress }) => {
  const { getToken } = useTokens()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const hasToken = useMemo(() => !!modelValue, [modelValue])

  const token = useMemo(() => {
    if (!hasToken || !modelValue) {
      return null
    }

    return getToken(modelValue)
  }, [modelValue])

  console.log('token', token)

  const onClose = () => {
    setIsModalOpen(false)
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  console.log('modelValue', modelValue)

  return (
    <div>
      <TokenSelectInputWrapper onClick={toggleModal}>
        {token ? (
          <TokenSelected>
            <img src={token.logoURI} alt={token.symbol} width={20} height={20} />
            <span>{token.symbol}</span>
          </TokenSelected>
        ) : (
          <span>Select token</span>
        )}

        <ChevDown />
      </TokenSelectInputWrapper>

      {isModalOpen ? <SelectTokenModal updateAddress={updateAddress} onClose={onClose} /> : null}
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
