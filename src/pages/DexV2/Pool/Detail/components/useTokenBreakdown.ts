import { bnum } from 'lib/utils';
import { Pool, PoolToken } from 'services/pool/types';
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers';
import { isNumber } from 'lib/utils/numbers';
import { useUserPoolPercentage } from 'hooks/dex-v2/useUserPoolPercentage';
import { isDeep } from 'hooks/dex-v2/usePoolHelpers';

export interface TokenData {
  balanceLabel: string | number;
  userBalanceLabel: string | number;
  fiatLabel: string;
  userFiatLabel: string;
  tokenWeightLabel: string;
  getTokenPercentageLabel: () => string;
}

export type TokensData = Record<string, TokenData>;

export function useTokenBreakdown(rootPool: Pool): TokensData {
  const { fNum, toFiat } = useNumbers();
  const { userPoolPercentage } = useUserPoolPercentage(rootPool);
  const isDeepPool = isDeep(rootPool);
  let tokensData: TokensData = {};
  // Total fiat sum of every token’s value. (Used for calculating token percentages)
  let totalFiat = 0;

  // Recursively calculate tokensData for every token in the pool.
  function calculateAllTokensData(pool: Pool): TokensData {
    totalFiat = 0;
    tokensData = {};
    pool.tokens.forEach((token) => {
      const rootTokenShare = 1;
      calculateTokenData(token, rootTokenShare);
    });
    return tokensData;
  }

  function calculateTokenData(token: PoolToken, shareOfParentInPool: number) {
    // Multiply the token balance by the parent's share.
    const balance = bnum(token.balance).times(shareOfParentInPool).toString();

    const hasNestedTokens = token?.token?.pool?.tokens;
    const isParentTokenInDeepPool = Boolean(hasNestedTokens) && isDeepPool;

    const balanceValue = calculateBalanceValue();
    const fiatValue = calculateFiatValue();
    if (isNumber(fiatValue)) totalFiat += Number(fiatValue);

    const userFiat = applyUserPoolPercentageTo(fiatValue);
    const userFiatLabel = fiatValue === '' ? '' : formatFiatValue(userFiat);
    const userBalanceLabel =
      balanceValue === '' ? '' : formatBalanceValue(applyUserPoolPercentageTo(balanceValue));
    const tokenWeightLabel = !token?.weight ? '' : fNum(token.weight, FNumFormats.percent);

    function getTokenPercentageLabel() {
      if (totalFiat === 0) return '0%';
      const tokenPercentage = Number(fiatValue) / Number(totalFiat);
      return tokenPercentage === 0 ? '' : fNum(tokenPercentage, FNumFormats.percent);
    }

    tokensData[token.address] = {
      balanceLabel: formatBalanceValue(calculateBalanceValue()),
      fiatLabel: formatFiatValue(fiatValue),
      userFiatLabel,
      userBalanceLabel,
      tokenWeightLabel,
      getTokenPercentageLabel,
    };

    // If this token is a leaf or the pool is not deep, we stop.
    const isLeaf = !token.token?.pool;
    if (isLeaf || !isDeepPool) return;

    // Calculate share of this token in the pool
    const shareOfTokenInPool = bnum(token.balance || '0')
      .div(token.token?.pool?.totalShares || 1)
      .times(shareOfParentInPool)
      .toNumber();

    // Recursively calculate data for nested tokens.
    token.token?.pool?.tokens?.forEach((nestedToken) =>
      calculateTokenData(nestedToken, shareOfTokenInPool)
    );

    // Helper functions defined within the scope of calculateTokenData
    function calculateBalanceValue() {
      if (isParentTokenInDeepPool) return '';
      return balance;
    }

    function formatBalanceValue(value: string | number) {
      if (!isNumber(value)) return value;
      return fNum(value, FNumFormats.token);
    }

    function calculateFiatValue() {
      if (isParentTokenInDeepPool) return '';
      let value = toFiat(balance, token.address);
      if (value === '0' && token.token?.latestUSDPrice) {
        // Fall back to using the latest USD price if necessary.
        value = bnum(balance).times(token.token.latestUSDPrice).toString();
      }
      return value;
    }

    function formatFiatValue(value: string | number): string {
      const strValue = value.toString();
      if (!isNumber(strValue)) return strValue;
      return fNum(strValue, FNumFormats.fiat);
    }

    function applyUserPoolPercentageTo(value: string): number {
      return (Number(value) * Number(userPoolPercentage)) / 100;
    }
  }

  return calculateAllTokensData(rootPool);
}
