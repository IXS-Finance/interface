import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import { MEDIA_WIDTHS } from 'theme'

import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { ChevronElement } from 'components/ChevronElement'
import { ReactComponent as Checked } from 'assets/images/checked-blue.svg'
import { VioletCard } from 'components/Card'
import { Checkbox, FormControlLabel } from '@mui/material'
import TokenListItem from './TokenListItem'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { usePoolFilter } from '../FilterProvider'

type TokenCardProps = {
  selectedValue: string
  onChange: (tokenAddress: string) => void
}

export const TokenCard = (props: TokenCardProps) => {
  const { selectedValue: tokenAddress, onChange } = props
  const node = useRef<HTMLDivElement>()
  const [open, setOpen] = useState(false)
  useOnClickOutside(node, open ? () => setOpen(false) : undefined)
  const [results, setResults] = useState<any[]>([])
  const [query] = useState('')
  const { tokensSelectedFilters, setTokensSelectedFilters, isMyPosition, setIsMyPosition } = usePoolFilter()
  const { tokens: tokensRaw, searchTokens, priceFor, balanceFor } = useTokens()

  const handleChangeMyPosition = useCallback(() => {
    setIsMyPosition(!isMyPosition)
  }, [isMyPosition, setIsMyPosition])

  const tokensWithValues = useMemo(() => {
    return Object.values(results).map((token: any) => {
      const balance = balanceFor(token.address)
      const price = priceFor(token.address)
      const value = Number(balance) * price
      return {
        ...token,
        price,
        balance,
        value,
      }
    })
  }, [results])

  useEffect(() => {
    async function queryTokens(newQuery: string) {
      const _results = await searchTokens(newQuery, {
        excluded: [],
        disableInjection: false,
        subset: [],
      })
      setResults(Object.values(_results))
    }

    queryTokens(query)
  }, [query, JSON.stringify(tokensRaw)])

  const handleRowClick = useCallback(
    (targetTokenAddress: string) => {
      if (tokenAddress !== targetTokenAddress) {
        onChange(targetTokenAddress)
      }
    },
    [tokenAddress, onChange]
  )

  const handleClearFilters = useCallback(() => {
    setTokensSelectedFilters([])
  }, [setTokensSelectedFilters])

  const handleToggleDropdown = useCallback(() => {
    setOpen(!open)
  }, [open])

  return (
    <StyledBox ref={node as any}>
      <SelectorControls onClick={handleToggleDropdown}>
        <Flex alignItems="center">
          <TokenCardWrapper style={{ color: '#292933', marginRight: '10px' }}>
            {tokensSelectedFilters.length > 0
              ? `${tokensSelectedFilters.length} token${tokensSelectedFilters.length > 1 ? 's' : ''} selected`
              : 'Filter by token'}
          </TokenCardWrapper>
        </Flex>

        <ChevronElement showMore={open} />
      </SelectorControls>

      {open && (
        <FlyoutMenu>
          <FlyoutRowCheckbox>
            <FormControlLabel
              control={
                <Checkbox
                  name={`myToken`}
                  checked={isMyPosition}
                  onChange={handleChangeMyPosition}
                  onBlur={() => {}}
                  sx={{
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.2rem',
                      color: '#6666FF',
                    },
                  }}
                />
              }
              label={<div style={{ fontSize: '14px', fontWeight: 500 }}>My Position</div>}
            />
          </FlyoutRowCheckbox>

          {tokensSelectedFilters.length > 0 && (
            <ClearFiltersRow onClick={handleClearFilters}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#6666FF' }}>Clear token filters</div>
            </ClearFiltersRow>
          )}

          {tokensWithValues?.length > 0 ? (
            tokensWithValues.map((token: any) => {
              return (
                <FlyoutRow key={token.address} onClick={() => handleRowClick(token.address)}>
                  <TokenListItem token={token} />
                  {tokensSelectedFilters?.includes(token.address) && <Checked />}
                </FlyoutRow>
              )
            })
          ) : (
            <div>No tokens found</div>
          )}
        </FlyoutMenu>
      )}
    </StyledBox>
  )
}

const SelectorControls = styled(VioletCard)`
  cursor: pointer;
  padding: 2px 3px;
  background: transparent;
  width: 180px;
  display: flex;
  justify-content: space-between;
  button {
    ${({ theme }) => theme.mediaWidth.upToSmall`
     padding: 0 3px 0 1px;
  `};
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    text-overflow: ellipsis;
    flex-shrink: 1;
    padding: 0;
  `};
`

const TokenCardWrapper = styled.div`
  font-size: 14px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
     max-width: min-content;
  `};

  ${({ theme }) => theme.mediaWidth.upToLarge`
     font-size: 12px;
  `};
`

const FlyoutMenu = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  overflow: auto;
  padding: 6px 24px;
  position: absolute;
  top: 70px;
  width: 210px;
  z-index: 2;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    top: 54px;
    left: 0;
  }
  @media screen and (max-width: ${MEDIA_WIDTHS.upToExtraSmall}px) {
    right: 70px;
    left: 0;
  }
  @media screen and (max-width: 400px) {
    right: 30px;
    left: 0;
  }
`
const FlyoutRow = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 10px 0;
  width: 100%;

  &:not(:last-child) {
    border-bottom: 1px solid #fff;
  }
`

const FlyoutRowCheckbox = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 500;
  width: 100%;
  padding: 6px 0;
  &:not(:last-child) {
    border-bottom: 1px solid #e6e6ff;
  }
`

const StyledBox = styled.div`
  border: 1px solid #e6e6ff;
  padding: 10px;
  border-radius: 6px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
     padding: 10px 20px 10px 20px;
  `};
  :active {
    border: 1px solid #4d8fea;
  }
  position: relative;
`

const ClearFiltersRow = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 500;
  width: 100%;
  padding: 6px 0;
  &:not(:last-child) {
    border-bottom: 1px solid #e6e6ff;
  }
`
