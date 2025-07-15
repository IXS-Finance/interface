import React, { useState } from 'react'
import styled from 'styled-components'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useUrls from 'hooks/dex-v2/useUrls'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  address?: string
  iconURI?: string
  size?: number
  disabled?: boolean
}

const Asset: React.FC<Props> = (props) => {
  const { address, iconURI, size } = props
  const { getToken } = useTokens()
  const { resolve } = useUrls()

  const [error, setError] = useState(false)

  const token = address ? getToken(address) : undefined

  const iconSRC = iconURI ? resolve(iconURI) : token?.logoURI ? resolve(token.logoURI) : ''

  const rootElementAttrs = {
    'aria-label': token?.symbol,
    disabled: props.disabled,
  }

  return (
    <div>
      <BalAssetButton {...rootElementAttrs}>
        {iconSRC && !error ? (
          <Img src={iconSRC} alt="icon" width={size} height={size} />
        ) : (
          <>
            {!!address ? (
              <Jazzicon seed={jsNumberForAddress(address)} diameter={size} />
            ) : (
              <NoData
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
              />
            )}
          </>
        )}
      </BalAssetButton>
    </div>
  )
}

export default Asset

Asset.defaultProps = {
  address: '',
  iconURI: '',
  size: 24,
  disabled: false,
}

const BalAssetButton = styled.div`
  padding: 0;
  width: fit-content;
  height: fit-content;
  line-height: 1;
  border-radius: 100%;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  &:not(:disabled):hover,
  &:not(:disabled):focus {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`

const Img = styled.img`
  border-radius: 100%;
  background-color: white;
`

const NoData = styled.div`
  overflow: visible;
  background-color: #d1d5db;
  border-radius: 9999px;
`
