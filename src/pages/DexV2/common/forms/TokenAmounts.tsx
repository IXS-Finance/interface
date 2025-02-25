// TokenAmounts.tsx
import React from 'react';
import styled from 'styled-components';
import { orderBy, groupBy } from 'lodash';
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { bnum } from 'lib/utils';
import { TokenInfoMap } from 'types/TokenList';
import Asset from '../Asset';

type AmountMap = {
  [address: string]: string;
};

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  amountMap: AmountMap;
  fiatAmountMap: AmountMap;
  tokenMap: TokenInfoMap;
  fiatTotal: string;
  title?: string;
  hideAmountShare?: boolean;
  showZeroAmounts?: boolean;
};


const TokenAmounts: React.FC<Props> = ({
  amountMap,
  fiatAmountMap,
  tokenMap,
  fiatTotal,
  title = '',
  hideAmountShare = false,
  showZeroAmounts = false,
}) => {
  const { fNum } = useNumbers();

  // Sort amounts in descending order by fiat value
  const sortedAmounts = orderBy(
    Object.entries(fiatAmountMap),
    ([, fiatAmount]) => Number(fiatAmount),
    'desc'
  ).map(([address, fiatAmount]) => ({
    amount: amountMap[address],
    fiatAmount,
    address,
  }));

  // Group entries into those with a zero token amount vs non-zero.
  const groupedAmounts = groupBy(
    sortedAmounts,
    (item) => (bnum(item.amount || '0').isZero() ? 'zeroAmounts' : 'nonZeroAmounts')
  );

  // Show either all sorted amounts or only the non-zero amounts.
  const amountsToShow = showZeroAmounts
    ? sortedAmounts
    : groupedAmounts.nonZeroAmounts || [];

  // Compute the relative share of the fiat amount for a given address.
  const amountShare = (address: string): string => {
    return bnum(fiatAmountMap[address]).div(fiatTotal).toString();
  };

  return (
    <TokenAmountsContainer>
      {title && <Title>{title}</Title>}
      {amountsToShow.map((token) => (
        <TokenRow key={token.address}>
          <TokenContent>
            <TokenInfo>
              <AmountDiv>
                <span className="font-numeric">
                  {fNum(token.amount, FNumFormats.token)}
                </span>
                <SymbolSpan>{tokenMap[token.address]?.symbol}</SymbolSpan>
              </AmountDiv>
              {Number(token.fiatAmount) > 0 && (
                <FiatInfo className="font-numeric">
                  {fNum(token.fiatAmount, FNumFormats.fiat)}
                  {!hideAmountShare && (
                    <Share>
                      ({fNum(amountShare(token.address), FNumFormats.percent)})
                    </Share>
                  )}
                </FiatInfo>
              )}
            </TokenInfo>
            <Asset address={token.address} size={36} />
          </TokenContent>
        </TokenRow>
      ))}
    </TokenAmountsContainer>
  );
};

export default TokenAmounts;

const TokenAmountsContainer = styled.div`
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
  /* Apply a bottom border to each child except the last */
  & > *:not(:last-child) {
    border-bottom: 1px solid #e5e7eb;
  }
`;

const Title = styled.div`
  background-color: #f9fafb; /* bg-gray-50 */
  padding: 0.5rem 0.75rem; /* py-2, px-3 */
  font-weight: 500;
  font-size: 0.875rem; /* text-sm */
  color: #4b5563; /* text-gray-600 */
`;

const TokenRow = styled.div`
  position: relative;
`;

const TokenContent = styled.div`
  padding: 0.75rem; /* p-3 */
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  margin-right: 0.75rem; /* mr-3 */
`;

const AmountDiv = styled.div`
  font-weight: 500; /* font-medium */
  display: flex;
  align-items: center;
`;

const SymbolSpan = styled.span`
  margin-left: 0.5rem; /* ml-2 */
  font-weight: 400; /* font-normal */
  color: #6b7280; /* text-secondary */
`;

const FiatInfo = styled.div`
  font-size: 0.875rem; /* text-sm */
  color: #6b7280; /* text-secondary */
  font-family: monospace; /* font-numeric */
`;

const Share = styled.span`
  margin-left: 0.5rem; /* ml-2 */
`;
