import React, { Fragment } from 'react'
import { text8 } from 'components/LaunchpadMisc/typography'
import styled from 'styled-components'
import { PoolTypes } from '../constants'
import { BorderSimple, ToggleOption } from 'components/Tabs'
import { Flex } from 'rebass'
import { typeFilters, usePoolFilter } from '../FilterProvider'
import { SearchInput } from './SearchInput'
import { TokenCard } from './TokenCard'

const Filters: React.FC = () => {
  const { filters, setFilters, tokensSelectedFilters, setTokensSelectedFilters, searchQuery, setSearchQuery } =
    usePoolFilter()

  const handleChangeType = (type: PoolTypes) => {
    setFilters({ ...filters, type })
  }

  const handleChangeToken = (tokenAddress: string) => {
    const newTokens = new Set(tokensSelectedFilters)
    if (newTokens.has(tokenAddress)) {
      newTokens.delete(tokenAddress)
    } else {
      newTokens.add(tokenAddress)
    }
    setTokensSelectedFilters(Array.from(newTokens))
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <Fragment>
      <FilterWrapper justifyContent="space-between">
        <Flex alignItems="center" style={{ gap: '1rem' }}>
          {typeFilters.map((tab, index) => {
            const active = filters.type === tab.value
            return (
              <ToggleOption key={`tabs-${index}`} onClick={() => handleChangeType(tab.value)} active={active}>
                <TabLabel>{tab.title}</TabLabel>
                <BorderSimple active={active} />
              </ToggleOption>
            )
          })}
        </Flex>
      </FilterWrapper>
      <Flex mt="1rem" style={{ gap: '0.5rem' }}>
        <SearchInput placeholder="Search pools..." value={searchQuery} onChange={handleSearchChange} />
        <TokenCard selectedValue={''} onChange={handleChangeToken} />
      </Flex>
    </Fragment>
  )
}

const FilterWrapper = styled(Flex)`
  border-bottom: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
`

const TabLabel = styled.div`
  padding: 1.5rem 1rem;
  ${text8}
`

export default Filters
