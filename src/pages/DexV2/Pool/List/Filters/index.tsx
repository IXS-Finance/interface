import React from 'react'
import { text8 } from "components/LaunchpadMisc/typography";
import styled from "styled-components";
import { PoolTypes } from "../constants";
import { BorderSimple, ToggleOption } from "components/Tabs";
import { Flex } from "rebass";
import { NetworkCard } from "./NetworkCard";
import { typeFilters, usePoolFilter } from "../FilterProvider";

const Filters: React.FC = () => {
  const {filters, setFilters} = usePoolFilter()

  const handleChangeType = (type: PoolTypes) => {
    setFilters({ ...filters, type })
  }

  const handleChangeNetwork = (chainId: number) => {
    setFilters({ ...filters, network: chainId })
  }

  return (
    <FilterWrapper justifyContent='space-between'>
      <Flex alignItems='center' style={{ gap: '1rem' }}>
        {typeFilters.map((tab, index) => {
          const active = filters.type === tab.value
          return (
            <ToggleOption key={`tabs-${index}`} onClick={() => handleChangeType(tab.value)} active={active}>
              <TabLabel>
                {tab.title}
              </TabLabel>
              <BorderSimple active={active} />
            </ToggleOption>
          )
        })}
      </Flex>
      {/* <div>
        <NetworkCard
          selectedValue={filters.network}
          onChange={handleChangeNetwork}
        />
      </div> */}
    </FilterWrapper>
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
