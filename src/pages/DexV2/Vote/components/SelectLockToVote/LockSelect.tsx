import React from 'react'
import Select, { components, MenuListProps, SingleValueProps, StylesConfig } from 'react-select'
import styled from 'styled-components'
import dayjs from 'dayjs'

import lockImg from 'assets/images/dex-v2/lockIcon.png'
import { Box, Flex } from 'rebass'

function transformOptions(options: any) {
  if (!options) return []

  if (options.length === 0) return []

  return options.map((option: any) => {
    let lockDuration = dayjs.unix(Number(option.expiresAt)).diff(dayjs(), 'year')
    let lockMessage = `${option.amount} IXS Locked for ${lockDuration} years`
    if (lockDuration === 0) {
      lockDuration = dayjs.unix(Number(option.expiresAt)).diff(dayjs(), 'day')
      lockMessage = `${option.amount} IXS Locked for ${lockDuration} days`
    }

    return {
      value: option.id,
      label: `Lock #${option.id}`,
      lockMessage,
      ...option,
    }
  })
}

export interface LockSelectProps {
  value?: any | null
  onChange?: (selected: any | null) => void
  options: any
}

// Create a styled container where you want your custom styles applied.
const StyledMenuItem = styled.div`
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  &:hover {
    background: #f0f0ff;
  }
  &:active {
    background: #e0e0ff;
  }
  &:focus {
    outline: none;
  }
`

const CustomMenuList: React.FC<MenuListProps<any, false>> = (props) => {
  return (
    <components.MenuList {...props}>
      {props.options.map((option, index) => {
        return (
          <StyledMenuItem key={index} onClick={() => props.selectOption(option)}>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 11 15" fill="none">
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

const LockSelect: React.FC<LockSelectProps> = ({ value, options, onChange }) => {
  return (
    <Select<any>
      options={transformOptions(options)}
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
