import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { Link, useHistory } from 'react-router-dom'
import { Box, Text } from 'rebass'
import { Currency, CurrencyAmount, Token } from '@ixswap1/sdk-core'
import { Trans } from '@lingui/macro'
import JSBI from 'jsbi'

import { ButtonGradient, PinnedContentButton } from 'components/Button'
import { EmptyStateInfoCard, NewEmptyStateInfoCard } from 'components/Card'
import FullPositionCard from 'components/PositionCard'
import { TipWithMessage } from 'components/TipWithMessage'
import useTheme from 'hooks/useTheme'

import Column, { AutoColumn } from '../../components/Column'
import { FindPoolTabs } from '../../components/NavigationTabs'
import CurrencySearchModal from '../../components/SearchModal/CurrencySearchModal'
import { PairState, useV2Pair } from '../../hooks/useV2Pairs'
import { useActiveWeb3React } from '../../hooks/web3'
import { usePairAdder } from '../../state/user/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { SemiTransparent, StyledInternalLink, TYPE } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import AppBody from '../AppBody'
import { Dots } from '../Pool/styleds'
import { Fields } from './enums'
import { PrerequisiteMessage } from './PrerequisiteMessage'
import { SelectCurrency } from './SelectCurrency'
import { FoundPoolWrapper, PoolStateColumn, SelectCurrencyContainer } from './styleds'
import { TGE_CHAINS_WITH_SWAP } from 'constants/addresses'
import Header from 'components/Header'
import { isMobile } from 'react-device-detect'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}
const bodyProps = {
  padding: '0',
  paddingXS: '0',
}

export default function PoolFinder() {
  const query = useQuery()
  const theme = useTheme()
  const { account } = useActiveWeb3React()
  const history = useHistory()

  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

  const [currency0, setCurrency0] = useState<Currency | null>(null)
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = useV2Pair(currency0 ?? undefined, currency1 ?? undefined)
  const { chainId } = useActiveWeb3React()
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.quotient, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.quotient, JSBI.BigInt(0))
    )

  const position: CurrencyAmount<Token> | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = Boolean(position && JSBI.greaterThan(position.quotient, JSBI.BigInt(0)))

  const chooseToken = useCallback((field: Fields) => {
    setShowSearch(true)
    setActiveField(field)
  }, [])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField]
  )

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false)
  }, [setShowSearch])
  const currenciesExist = currency0 && currency1
  const poolFound = currenciesExist && pairState === PairState.EXISTS && hasPosition && pair
  const noLiquidityInPool = currenciesExist && pairState === PairState.EXISTS && !(hasPosition && pair)
  const noPool = currenciesExist && !(pairState === PairState.EXISTS) && validPairNoLiquidity
  const invalidPair = currenciesExist && !(pairState === PairState.EXISTS) && pairState === PairState.INVALID
  const loadingPair = currenciesExist && !(pairState === PairState.EXISTS) && pairState === PairState.LOADING
  const prerequesiteState = !currenciesExist

  return (
    <>
      <AppBody
        page="liquidity"
        {...bodyProps}
        blurred={chainId !== undefined && !TGE_CHAINS_WITH_SWAP.includes(chainId)}
      >
        <FindPoolTabs origin={query.get('origin') ?? '/pool'} />
        <AutoColumn>
          <SelectCurrencyContainer gap="md">
            <SelectCurrency {...{ currency0, currency1, chooseToken }} />
          </SelectCurrencyContainer>
          {poolFound && pair && (
            <FoundPoolWrapper>
              <div
                style={{
                  border: isMobile ? 'none' : '1px solid #E6E6FF',
                  width: '100%',
                  padding: isMobile ? '0px' : '20px',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <Column>
                  <TYPE.title9>
                    <Trans>Pool Found!</Trans>
                  </TYPE.title9>
                  <StyledInternalLink to={`/pool`}>
                    <SemiTransparent>
                      <Text marginBottom="10px" fontSize={12} lineHeight={'18px'}>
                        <Trans>Manage this Pool</Trans>
                      </Text>
                    </SemiTransparent>
                  </StyledInternalLink>
                </Column>
                <FullPositionCard pair={pair} />
              </div>
            </FoundPoolWrapper>
          )}
          {!poolFound && !prerequesiteState && currency0 && currency1 && (
            <PoolStateColumn>
              {noLiquidityInPool && (
                <EmptyStateInfoCard>
                  <TYPE.title7 fontWeight={500}>
                    <Trans>You don’t have liquidity in this pool yet</Trans>
                  </TYPE.title7>
                  <PinnedContentButton>
                    <Link to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`} style={{ color: theme.white }}>
                      <Trans>Add liquidity</Trans>
                    </Link>
                  </PinnedContentButton>
                </EmptyStateInfoCard>
              )}
              {noPool && currency0 && currency1 ? (
                <NewEmptyStateInfoCard>
                  <TYPE.title9 fontWeight={500}>
                    <Text color={'#B8B8CC'}>
                      <Trans>No pool found</Trans>
                    </Text>
                  </TYPE.title9>
                  <PinnedContentButton
                    height="60px"
                    onClick={() => history.push(`/add/${currencyId(currency0)}/${currencyId(currency1)}`)}
                  >
                    <span style={{ color: '#FFFFFF', fontWeight: '600' }}>Create pool</span>
                  </PinnedContentButton>
                </NewEmptyStateInfoCard>
              ) : null}
              {invalidPair && (
                <EmptyStateInfoCard>
                  <Trans>Invalid pair</Trans>
                </EmptyStateInfoCard>
              )}
              {loadingPair && (
                <EmptyStateInfoCard>
                  <Trans>
                    <Dots>Loading</Dots>
                  </Trans>
                </EmptyStateInfoCard>
              )}
            </PoolStateColumn>
          )}
          {prerequesiteState && <PrerequisiteMessage account={account} />}
        </AutoColumn>

        <CurrencySearchModal
          isOpen={showSearch}
          onCurrencySelect={handleCurrencySelect}
          onDismiss={handleSearchDismiss}
          showCommonBases={false}
          selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
        />
      </AppBody>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <TipWithMessage
          page="find"
          message={<Trans>Use this tool to find pairs that don’t automatically appear in the interface.</Trans>}
        />
      </div>
    </>
  )
}
