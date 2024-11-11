import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as ChevDown } from 'assets/images/dex-v2/chev-down.svg'
import SelectTokenModal from './SelectTokenModal'

interface TokenSelectInputProps {
  modelValue?: string
  updateAddress: (address: string) => void
}

const TokenSelectInput: React.FC<TokenSelectInputProps> = ({ modelValue, updateAddress }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const hasToken = useMemo(() => !!modelValue, [modelValue])

  const token = useMemo(() => {
    if (!hasToken) return null
    return null
    // return getToken(modelValue)
  }, [])

  console.log('token', token)

  const onClose = () => {
    setIsModalOpen(false)
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  return (
    <div>
      <TokenSelectInputWrapper onClick={toggleModal}>
        <span>Select token</span>
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
