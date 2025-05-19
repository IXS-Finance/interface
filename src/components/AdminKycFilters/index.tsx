import React, { FC, Fragment } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { Select } from 'components/Select'
import { Search } from 'components/Search'
import { ButtonEmpty, ButtonGradientBorder, ButtonIXSGradient } from 'components/Button'
import { MEDIA_WIDTHS, TYPE } from 'theme'

import { SelectFiltersContainer } from './styleds'
// import { getStatusInfo } from 'pages/KYC/styleds'
// import { KYCStatuses } from 'pages/KYC/enum'
import { ButtonStatusText, identityOptions, KYCIdentity } from './mock'
import { DateFilter } from 'components/DateFilter'
import { ReactComponent as IdentityIcon } from 'assets/images/identityIcon.svg'
import { ReactComponent as NewDateIcon } from 'assets/images/NewDateIcon.svg'
import { Line } from 'components/Line'
import { isMobile } from 'react-device-detect'

const ResetFilterButton = styled(ButtonEmpty)`
  color: ${({ theme }) => theme.text2};
  margin-left: 16px;
  white-space: nowrap;
  width: auto;
  font-weight: 400;
  border: 1px solid #e6e6ff;
  border-radius: 8px;
  font-size: 13px;
`

const StatusButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
  }
`

const StatusButton = styled.div`
  display: flex;
  justify-content: space-between;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
  }
`

const Title = styled(TYPE.title11)`
  color: #8f8fb2;
  margin-left: 8px;
`

export type TStats = {
  status: string
  count: number
}

export type Props = {
  identity: KYCIdentity
  selectedStatuses: string[]
  stats: ReadonlyArray<TStats>
  endDate: any
  setSelectedStatuses: (newStatuses: string[]) => void
  onIdentityChange: (identity: KYCIdentity) => void
  setSearchValue: (search: string) => void
  setEndDate: (value: any) => void
}

export const AdminKycFilters: FC<Props> = ({
  identity,
  stats,
  selectedStatuses,
  endDate,
  setEndDate,
  setSelectedStatuses,
  setSearchValue,
  onIdentityChange,
}) => {
  const handleStatusChange = (status: string) => {
    const newStatuses = [...selectedStatuses]
    const indexOfSource = selectedStatuses.indexOf(status)
    const indexOfTotal = selectedStatuses.indexOf('total')

    if (status === 'total') {
      setSelectedStatuses(['total'])
      return
    } else if (indexOfTotal > -1) {
      newStatuses.splice(indexOfTotal, 1)
    }

    if (indexOfSource > -1) {
      newStatuses.splice(indexOfSource, 1)
    } else {
      newStatuses.push(status)
    }

    setSelectedStatuses(newStatuses)
  }

  const handleDateChange = (newDate: string) => {
    setEndDate(newDate)
  }

  const handleResetFilters = () => {
    setEndDate(null)
    setSelectedStatuses(['total'])
    onIdentityChange(null)
  }

  return (
    <Flex flexDirection="column">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="24px">
        <Search
          style={{ marginRight: 16, marginBottom: 0 }}
          placeholder="Search for Wallet"
          setSearchValue={setSearchValue}
        />
        <ResetFilterButton onClick={handleResetFilters}>Clear Filters</ResetFilterButton>
      </Flex>
      <StatusButtonWrapper>
        <StatusButton>
          {stats.map(({ status, count }) => {
            const title = <Title marginLeft="8px">{`${ButtonStatusText[status]} - ${count}`}</Title>

            return (
              <Fragment key={`status-button-${status}`}>
                {!selectedStatuses.includes(status) ? (
                  <ButtonGradientBorder
                    borderRadius="8px"
                    minHeight="32px !important"
                    height="32px"
                    padding="6px 24px"
                    fontSize="16px !important"
                    lineHeight="16px !important"
                    onClick={() => handleStatusChange(status)}
                  >
                    {title}
                  </ButtonGradientBorder>
                ) : (
                  <ButtonIXSGradient
                    minHeight="32px !important"
                    height="32px"
                    padding="6px 24px"
                    fontSize="16px !important"
                    lineHeight="16px !important"
                    onClick={() => handleStatusChange(status)}
                  >
                    {title}
                  </ButtonIXSGradient>
                )}
              </Fragment>
            )
          })}
        </StatusButton>
        <div style={{ margin: isMobile ? '15px 0px' : '0px' }}>
          <SelectFiltersContainer>
            <div className="input-with-icon">
              <IdentityIcon style={{ position: 'relative', top: '46px', left: '90px', zIndex: '1' }} />
              <Select
                borderRadius="30px 0px 0px 30px"
                value={identity || null}
                placeholder="Identity"
                options={identityOptions}
                onSelect={onIdentityChange}
                isSearchable={false}
              />
            </div>
            <div className="input-with-icon">
              <NewDateIcon style={{ position: 'relative', top: '46px', left: '90px', zIndex: '1' }} />
              <DateFilter
                selectBorderRadius="0px 30px 30px 0px"
                value={endDate?.format('YYYY-MM-DD') || null}
                onChange={(newDate) => {
                  handleDateChange(newDate)
                }}
              />
            </div>
          </SelectFiltersContainer>
        </div>
      </StatusButtonWrapper>
      <Line style={{ marginBottom: '20px' }} />
    </Flex>
  )
}
