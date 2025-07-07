import React, { ReactChildren } from 'react'
import ReactPhoneInput from 'react-phone-input-2'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { TYPE } from 'theme'

interface Props {
  value?: string
  onChange: (value: string) => void
  label?: string
  onBlur?: (e: any) => void
  error?: any | ReactChildren
}

export const PhoneInput = ({ value, onChange, label, onBlur, error }: Props) => {
  return (
    <Container>
      <Label style={{ color: '#555566', fontSize: '13px', fontWeight: 500, paddingBottom: 2 }}>{t`${label || 'Phone Number'}`}</Label>
      <ReactPhoneInput placeholder="Phone Number" onBlur={onBlur} country={'us'} value={value} onChange={onChange} />
      {error && (
        <TYPE.small marginTop="1px" color={'red1'}>
          {error}
        </TYPE.small>
      )}
    </Container>
  )
}

const Label = styled.div`
  color: ${({ theme }) => theme.text2};
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 6px;
  .react-tel-input,
  .form-control {
    height: 62px;
    position: relative;
  }
  .react-tel-input {
    background-color: transparent;
    border-radius: 6px;
    // border: ${({ theme: { bg0 } }) => `1px solid #E6E6FF`};
  }

  .form-control {
    position: relative;
    padding: 10px 20px 10px 52px;
    border-radius: 6px;
    background-color: ${({ theme: { bg0 } }) => bg0};
    color: ${({ theme: { text1 } }) => text1};
    border: 1px solid #e6e6ff;
    width: 100%;
    font-size: 16px;
    line-height: 40px;
  }
  .form-control:focus {
    background-color: ${({ theme }) => (theme.config.background ? theme.bg0 : theme.bg0)};
    .react-tel-input {
      border-color: ${({ theme: { text9 } }) => text9};
    }
    box-shadow: none;
  }

  .country-list {
    border-radius: 6px;
    margin: 4px 0px;
    padding: 24px 8px 24px 16px;
    > li {
      margin-bottom: 4px;
    }
    background-color: ${({ theme }) => theme.bg7};
    top: 100%;
    .highlight,
    .prefered {
      // background-color: ${({ theme }) => theme.bg11} !important;
      color: ${({ theme }) => theme.text1} !important;
      font-weight: bold;
    }
    .country {
      display: flex;
      align-items: center;
      padding: 2px 12px;
      font-size: 16px;
      color: ${({ theme }) => theme.text9};
      border-radius: 6px;

      .flag {
        position: initial;
        margin-right: 12px;
        margin-top: -4px;
      }
    }
  }

  .country:hover {
    background-color: ${({ theme }) => `${theme.bg19} !important`};
  }

  .flag-dropdown.open {
    .arrow {
      border: none;
      transform: rotate(270deg);
    }
  }

  .selected-flag {
    padding-left: 20px;
    position: inherit;
    .arrow {
      display: none;
    }
  }
`
