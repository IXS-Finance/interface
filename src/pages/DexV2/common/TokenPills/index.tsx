import React from 'react';
import styled from 'styled-components';
import StableTokenPill from './StableTokenPill';
import WeightedTokenPill from './WeightedTokenPill';
import HiddenTokensPills from './HiddenTokensPills';
import { PoolToken } from 'services/pool/types';
import { includesAddress } from 'lib/utils';
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens';
import useNumbers from 'hooks/dex-v2/useNumbers';

interface TokenPillsProps {
  tokens: PoolToken[];
  isStablePool?: boolean;
  selectedTokens?: string[];
  pickedTokens?: string[];
  isOnMigrationCard?: boolean;
  isHovered?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

// Main component – default values are provided via destructuring.
const TokenPills: React.FC<TokenPillsProps> = ({
  tokens,
  isStablePool = false,
  selectedTokens = [],
  pickedTokens = [],
  isOnMigrationCard = false,
  isHovered = false,
}) => {
  // Assume these hooks provide the same functionality as in Vue.
  const { fNum } = useNumbers();
  const { getToken, hasBalance } = useTokens();

  // Maximum number of pills to display
  const MAX_PILLS = 8;
  const visibleTokens = tokens.slice(0, MAX_PILLS);
  const hiddenTokens = tokens.slice(MAX_PILLS);

  const hasBalanceInHiddenTokens = hiddenTokens.some(token =>
    hasBalance(token.address)
  );

  const isSelectedInHiddenTokens = hiddenTokens.some(token =>
    includesAddress(selectedTokens, token.address)
  );

  const isSelectedInPickedTokens = hiddenTokens.some(token =>
    includesAddress(pickedTokens, token.address)
  );

  // Returns the proper symbol from token info
  function symbolFor(token: PoolToken): string {
    const tokenInfo = getToken(token.address);
    return tokenInfo?.symbol || token.symbol || '---';
  }

  // Formats the token's weight as a percent string.
  function weightFor(token: PoolToken): string {
    return fNum(token.weight || '0', {
      style: 'percent',
      maximumFractionDigits: 0,
    });
  }

  return (
    <Container>
      {isStablePool ? (
        // Render StableTokenPill for each visible token
        visibleTokens.map(token => (
          <StableTokenPill
            key={token.address}
            hasBalance={hasBalance(token.address)}
            symbol={symbolFor(token)}
            token={token}
            isSelected={includesAddress(selectedTokens, token.address)}
            isPicked={includesAddress(pickedTokens, token.address)}
          />
        ))
      ) : (
        <>
          {/* Render WeightedTokenPill for each visible token */}
          {visibleTokens.map(token => (
            <WeightedTokenPill
              key={token.address}
              hasBalance={hasBalance(token.address)}
              symbol={symbolFor(token)}
              weight={weightFor(token)}
              token={token}
              isSelected={includesAddress(selectedTokens, token.address)}
              isPicked={includesAddress(pickedTokens, token.address)}
              isOnMigrationCard={isOnMigrationCard}
              isHovered={isHovered}
            />
          ))}
          {/* Render hidden tokens pill if there are extra tokens */}
          {hiddenTokens.length > 0 && (
            <HiddenTokensPills
              tokens={hiddenTokens}
              hasBalance={hasBalanceInHiddenTokens}
              isSelected={isSelectedInHiddenTokens}
              isPicked={isSelectedInPickedTokens}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default TokenPills;
