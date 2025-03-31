// TokenAmounts.tsx
import React from 'react'
import styled from 'styled-components'
import { orderBy, groupBy } from 'lodash'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { bnum } from 'lib/utils'
import { TokenInfoMap } from 'types/TokenList'
import Asset from '../Asset'
import { Flex } from 'rebass'

type AmountMap = {
  [address: string]: string
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  amountMap: AmountMap
  fiatAmountMap: AmountMap
  tokenMap: TokenInfoMap
  fiatTotal: string
  title?: string
  hideAmountShare?: boolean
  showZeroAmounts?: boolean
}

const TokenAmounts: React.FC<Props> = ({
  amountMap,
  fiatAmountMap,
  tokenMap,
  fiatTotal,
  title = '',
  hideAmountShare = false,
  showZeroAmounts = false,
}) => {
  const { fNum } = useNumbers()

  // Sort amounts in descending order by fiat value
  const sortedAmounts = orderBy(Object.entries(fiatAmountMap), ([, fiatAmount]) => Number(fiatAmount), 'desc').map(
    ([address, fiatAmount]) => ({
      amount: amountMap[address],
      fiatAmount,
      address,
    })
  )

  // Group entries into those with a zero token amount vs non-zero.
  const groupedAmounts = groupBy(sortedAmounts, (item) =>
    bnum(item.amount || '0').isZero() ? 'zeroAmounts' : 'nonZeroAmounts'
  )

  // Show either all sorted amounts or only the non-zero amounts.
  const amountsToShow = showZeroAmounts ? sortedAmounts : groupedAmounts.nonZeroAmounts || []

  // Compute the relative share of the fiat amount for a given address.
  const amountShare = (address: string): string => {
    return bnum(fiatAmountMap[address]).div(fiatTotal).toString()
  }

  return (
    <TokenAmountsContainer>
      {title && <Title>{title}</Title>}

      <Flex mb="24px" flexDirection="column">
        {amountsToShow.map((token) => (
          <TokenRow key={token.address}>
            <TokenContent>
              <Asset address={token.address} size={36} />
              <TokenInfo>
                <AmountDiv>
                  <span>{fNum(token.amount, FNumFormats.token)}</span>
                  <SymbolSpan style={{ marginLeft: 4 }}>{tokenMap[token.address]?.symbol}</SymbolSpan>
                </AmountDiv>
                {Number(token.fiatAmount) > 0 && (
                  <FiatInfo>
                    {fNum(token.fiatAmount, FNumFormats.fiat)}
                    {!hideAmountShare && <Share>({fNum(amountShare(token.address), FNumFormats.percent)})</Share>}
                  </FiatInfo>
                )}
              </TokenInfo>
            </TokenContent>
          </TokenRow>
        ))}
      </Flex>
    </TokenAmountsContainer>
  )
}

export default TokenAmounts

const TokenAmountsContainer = styled.div``

const Title = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  border-bottom: 1px solid #e6e6ff;
  padding-bottom: 24px;
`

const TokenRow = styled.div`
  position: relative;
  border-bottom: 1px solid #e6e6ff;
  padding: 24px 0;
`

const TokenContent = styled.div`
  display: flex;
  align-items: center;
`

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  margin-left: 12px;
`

const AmountDiv = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const FiatInfo = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const Share = styled.span`
  margin-left: 0.5rem; /* ml-2 */
`

const SymbolSpan = styled.span`
  color: #6b7280; /* text-secondary */
`;