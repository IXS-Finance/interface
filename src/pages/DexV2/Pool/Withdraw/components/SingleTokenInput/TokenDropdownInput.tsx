import React from 'react'
import styled from 'styled-components'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import Asset from 'pages/DexV2/common/Asset'
import Dropdown from './Dropdown'

export interface TokenDropdownInputProps {
  options: string[]
  modelValue: string
  excludedTokens?: string[]
  updateAddress: (address: string) => void
}

const TokenDropdownInput: React.FC<TokenDropdownInputProps> = ({ options, modelValue, updateAddress }) => {
  const { getToken } = useTokens()

  const hasToken = modelValue !== ''
  const token = hasToken ? getToken(modelValue) : null

  const handleSelected = (tokenAddress: string) => {
    debugger;
    updateAddress(tokenAddress)
  }

  return (
    <Dropdown
      options={options}
      minWidth="200px"
      onSelected={handleSelected}
      activator={
        <TokenDropdownInputWrapper>
          {token ? (
            <TokenSelected>
              <Asset address={token.address} iconURI={token.logoURI} size={20} />
              <span>{token.symbol}</span>
            </TokenSelected>
          ) : (
            <SelectText>Select token</SelectText>
          )}

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
        </TokenDropdownInputWrapper>
      }
      renderOption={(tokenAddress: string) => {
        const token = getToken(tokenAddress)
        console.log('Token:', token)
        return (
          <TokenItem>
            <Asset address={token.address} iconURI={token.logoURI} size={32} />
            <SymbolContainer>
              {token.symbol}
              <TokenName>{token.name}</TokenName>
            </SymbolContainer>
          </TokenItem>
        )
      }}
    />
  )
}

export default TokenDropdownInput

const TokenDropdownInputWrapper = styled.div`
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

const TokenItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0.5rem; /* py-3 px-2 */
  font-size: 1rem; /* text-base */
  line-height: 1.25rem; /* leading-5 */
  cursor: pointer;
  padding-left: 1rem;
  padding-right: 1rem;

  &:hover {
    background-color: #eff6ff; /* blue-50 */
  }

  .w-14 {
    width: 3.5rem;
  }

  .h-4 {
    height: 1rem;
  }
`

const SymbolContainer = styled.div`
  flex: 1;
  margin-left: 8px; /* ml-2 */
`

const TokenName = styled.div`
  width: 10rem; /* w-40 */
  font-size: 0.875rem; /* text-sm */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: gray; /* text-gray */

  @media (min-width: 768px) {
    width: 15rem; /* md:w-60 */
  }
`
