import React from 'react'
import Select, { components, MenuListProps, SingleValueProps, StylesConfig } from 'react-select'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { Box, Flex } from 'rebass'
import { useHistory } from 'react-router-dom'

import lockImg from 'assets/images/dex-v2/lockIcon.png'
import { routes } from 'utils/routes'

function transformOptions(options: any, epochVoteStart: number, epochVoteEnd: number) {
  if (!options) return []
  if (options.length === 0) return []

  // Sort options by id (ascending)
  const sortedOptions = options.sort((a: any, b: any) => Number(b.id) - Number(a.id))

  return sortedOptions.map((option: any) => {
    const expiresAt = dayjs.unix(Number(option.expiresAt))
    const now = dayjs()
    const isExpired = expiresAt.isBefore(now)

    let lockDuration = expiresAt.diff(now, 'year')
    let lockMessage = `${option.amount} IXS Locked for ${lockDuration} years`
    if (lockDuration === 0) {
      lockDuration = expiresAt.diff(now, 'day')
      lockMessage = `${option.amount} IXS Locked for ${lockDuration} days`
    }

    // Determine if the lock is voted within the epoch window.
    // isVoted is true if option.votedAt exists, and
    // votedAt is greater than epochVoteStart and less than epochVoteEnd.
    const isVoted =
      option.votedAt &&
      dayjs.unix(Number(option.votedAt)).isAfter(dayjs.unix(epochVoteStart)) &&
      dayjs.unix(Number(option.votedAt)).isBefore(dayjs.unix(epochVoteEnd))

    return {
      value: option.id,
      label: `Lock #${option.id}`,
      lockMessage,
      isExpired,
      isVoted,
      ...option,
    }
  })
}

export interface LockSelectProps {
  value?: any | null
  onChange?: (selected: any | null) => void
  options: any
  epochVoteStart: number
  epochVoteEnd: number
}

interface BadgeProps {
  status?: 'success' | 'default' | 'warning' | 'active'
}

const Badge = styled.div<BadgeProps>`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: ${(props) => {
    switch (props.status) {
      case 'success':
        return '#1DC78A' // green
      case 'warning':
        return '#ffc107' // yellow
      case 'active':
        return '#007bff' // blue
      default:
        return '#a4a4b1'
    }
  }};
  color: ${(props) => (props.status === 'warning' ? '#000' : '#fff')};
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
`

interface StyledMenuItemProps {
  isDisabled?: boolean
}

const StyledMenuItem = styled.div<StyledMenuItemProps>`
  position: relative; // for badge positioning.
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: ${({ isDisabled }) => (isDisabled ? '#f9f9f9' : '#fff')};
  padding: 16px;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  gap: 16px;
  &:hover {
    background: ${({ isDisabled }) => (isDisabled ? '#f9f9f9' : '#f0f0ff')};
  }
  &:active {
    background: ${({ isDisabled }) => (isDisabled ? '#f9f9f9' : '#e0e0ff')};
  }
  &:focus {
    outline: none;
  }
`

const CustomMenuList: React.FC<MenuListProps<any, false>> = (props) => {
  const history = useHistory()

  return (
    <components.MenuList {...props}>
      {props.options.length === 0 ? (
        <Box fontSize="14px" color="#B8B8D2" fontWeight={500} textAlign="center">
          Voting requires a Lock.
          <Box mt={3}>
            <button
              style={{
                background: '#6666FF',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => history.push(routes.dexV2Lock)}
            >
              Create Lock
            </button>
          </Box>
        </Box>
      ) : (
        <>
          {props.options.map((option, index) => {
            const isDisabled = option.isVoted || option.isExpired

            return (
              <StyledMenuItem
                key={index}
                onClick={() => !isDisabled && props.selectOption(option)}
                isDisabled={isDisabled}
              >
                {option.isVoted && <Badge status="success">Voted</Badge>}

                {option.isExpired && <Badge status="default">Expired</Badge>}
                <img src={lockImg} alt="Lock Icon" width={40} height={40} />
                <Flex flexDirection="column" alignItems="flex-start" justifyContent="center" css={{ gap: '6px' }}>
                  <Flex
                    alignItems="center"
                    css={{
                      gap: '4px',
                      fontSize: '14px',
                      color: '#292933',
                      fontWeight: 500,
                    }}
                  >
                    Lock #{option?.id}{' '}
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
                      <path
                        d="M8.5 7.5H9.55C9.79855 7.5 10 7.70145 10 7.95V13.05C10 13.2985 9.79855 13.5 9.55 13.5H1.45C1.20147 13.5 1 13.2985 1 13.05V7.95C1 7.70145 1.20147 7.5 1.45 7.5H2.5M8.5 7.5V4.5C8.5 3.5 7.9 1.5 5.5 1.5C3.1 1.5 2.5 3.5 2.5 4.5V7.5M8.5 7.5H2.5"
                        stroke="#B8B8D2"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Flex>
                  <Box fontSize="14px" color="#B8B8D2" fontWeight={500}>
                    {option.lockMessage}
                  </Box>
                </Flex>
              </StyledMenuItem>
            )
          })}
        </>
      )}
    </components.MenuList>
  )
}

// Custom SingleValue to render the selected option as desired.
const CustomSingleValue: React.FC<SingleValueProps<any>> = (props) => {
  return (
    <components.SingleValue {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 11 15" fill="none">
          <path
            d="M8.5 7.5H9.55C9.79855 7.5 10 7.70145 10 7.95V13.05C10 13.2985 9.79855 13.5 9.55 13.5H1.45C1.20147 13.5 1 13.2985 1 13.05V7.95C1 7.70145 1.20147 7.5 1.45 7.5H2.5M8.5 7.5V4.5C8.5 3.5 7.9 1.5 5.5 1.5C3.1 1.5 2.5 3.5 2.5 4.5V7.5M8.5 7.5H2.5"
            stroke="#B8B8D2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Box color="#292933" fontSize="14px" fontWeight={500} as="span">
          {props.data.label}
        </Box>
      </div>
    </components.SingleValue>
  )
}

const customStyles: StylesConfig<any, false> = {
  container: (provided) => ({
    ...provided,
    width: '100%',
  }),
  control: (provided) => ({
    ...provided,
    padding: '10px 16px', // vertical: 10px, horizontal: 16px
    borderRadius: '8px',
    border: '1px solid rgba(102, 102, 255, 0.30)',
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: '14px',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRadius: '8px',
  }),
}

const LockSelect: React.FC<LockSelectProps> = ({ value, options, epochVoteStart, epochVoteEnd, onChange }) => {
  return (
    <Select<any>
      options={transformOptions(options, epochVoteStart, epochVoteEnd)}
      value={value}
      onChange={onChange}
      isSearchable={false}
      placeholder="Select a Lock"
      components={{
        MenuList: CustomMenuList,
        IndicatorSeparator: () => null,
        SingleValue: CustomSingleValue,
      }}
      styles={customStyles}
    />
  )
}

export default LockSelect
