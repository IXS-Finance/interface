import React, { useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import Select, { components } from 'react-select'

import checkMarkIcon from 'assets/images/dex-v2/Checkmark.svg'

interface NetworkSelectProps {}

const CustomSingleValue = (props: any) => {
  return (
    <components.SingleValue {...props}>
      <Flex alignItems="center">
        <img src={props.data.icon} alt={props.data.label} width={20} height={20} />
        <OptionLabel>{props.data.label}</OptionLabel>
      </Flex>
    </components.SingleValue>
  )
}

const CustomOption = (props: any) => {
  return (
    <components.Option {...props}>
      <OptionContainer>
        <Flex alignItems="center">
          <img src={props.data.icon} alt={props.data.label} width={20} height={20} />
          <OptionLabel>{props.data.label}</OptionLabel>
        </Flex>

        {props.isSelected && <img src={checkMarkIcon} alt="Selected" width={16} height={16} />}
      </OptionContainer>
    </components.Option>
  )
}

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    borderRadius: '8px',
    border: '1px solid #E6E6FF',
    background: '#FFF',
    color: 'rgba(41, 41, 51, 0.90)',
    cursor: 'pointer',
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '8px',
    border: '1px solid #E6E6FF',
    background: '#FFF',
    color: 'rgba(41, 41, 51, 0.90)',
    padding: 16,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    background: state.isSelected ? '#FFF' : state.isFocused ? '#FFF' : '#FFF',
    color: 'rgba(41, 41, 51, 0.90)',
    cursor: 'pointer',
    padding: '12px 16px',
    fontSize: state.isFocused ? '15px' : '14px', // Increase font size on hover
    transition: 'font-size 0.2s ease-in-out', // Smooth transition for font size change
    '&:active': {
      backgroundColor: '#FFF', // Ensure background remains white when clicked and held
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'rgba(41, 41, 51, 0.90)',
  }),
}

const NetworkSelect: React.FC<NetworkSelectProps> = () => {
  const networkOptions = [
    {
      value: 'polygon',
      label: 'Polygon',
      icon: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png?1698233745',
    },
    {
      value: 'ethereum',
      label: 'Ethereum',
      icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
    },
  ]

  return (
    <CustomSelect
      components={{
        IndicatorSeparator: () => null,
        SingleValue: CustomSingleValue,
        Option: CustomOption,
      }}
      styles={customStyles}
      className="basic-single"
      classNamePrefix="select"
      defaultValue={networkOptions[0]}
      isSearchable={false}
      name="color"
      options={networkOptions}
    />
  )
}

export default NetworkSelect

const CustomSelect = styled(Select)`
  .select__control {
    border-radius: 8px;
    border: 1px solid #e6e6ff;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
  }

  .select__menu {
    border-radius: 8px;
    border: 1px solid #e6e6ff;
    background: #fff;
    color: rgba(41, 41, 51, 0.9);
  }

  .select__option {
    background: #fff;
    color: rgba(41, 41, 51, 0.9);
    cursor: pointer;
    padding: 12px 16px;
    font-size: 14px;
    transition: font-size 0.2s ease-in-out;

    &:hover {
      font-size: 15px;
    }

    &:active {
      background: #fff; // Ensure background remains white when clicked and held
    }
  }

  .select__option--is-focused {
    background: #fff;
  }

  .select__option--is-selected {
    background: #fff;
  }
`

const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const OptionLabel = styled.span`
  margin-left: 8px;
`
