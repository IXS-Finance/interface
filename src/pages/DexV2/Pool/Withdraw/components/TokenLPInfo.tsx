import React from 'react'
import styled from 'styled-components'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import Asset from 'pages/DexV2/common/Asset'
import Tooltip from 'pages/DexV2/common/Tooltip'

export interface TokenLPInfoProps {
  modelValue: string
}

const TokenLPInfo: React.FC<TokenLPInfoProps> = ({ modelValue }) => {
  const { getToken } = useTokens()

  // Compute token existence inline.
  const hasToken = modelValue !== ''
  const token = hasToken ? getToken(modelValue) : null

  return (
    <div>
      <TokenLPInfoWrapper>
        {token ? (
          <Tooltip
            text={token.symbol}
            activator={<Asset address={token.address} iconURI={token.logoURI} size={20} />}
          />
        ) : (
          <SelectText>Select token</SelectText>
        )}
      </TokenLPInfoWrapper>
    </div>
  )
}

export default TokenLPInfo

const TokenLPInfoWrapper = styled.div`
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  display: flex;
  padding: 8px;
  align-items: center;
  color: rgba(102, 102, 255, 0.9);
`

const SelectText = styled.span`
  color: rgba(102, 102, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
`
