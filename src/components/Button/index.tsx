import React from 'react'
import useTheme from 'hooks/useTheme'
import { isIOS, isIPad13, isSafari, isMobileSafari } from 'react-device-detect'
import { darken } from 'polished'
import { Check, ChevronDown, Plus } from 'react-feather'
import { Button as RebassButton, ButtonProps as ButtonPropsOriginal } from 'rebass/styled-components'
import styled, { css } from 'styled-components/macro'
import { RowBetween, RowCenter } from '../Row'
import { gradientBorder } from 'theme'

type ButtonProps = Omit<ButtonPropsOriginal, 'css'>

export const isNotSupportGradient = isIOS || isIPad13 || isSafari || isMobileSafari

const Base = styled(RebassButton)<
  {
    padding?: string
    width?: string
    borderRadius?: string
    altDisabledStyle?: boolean
  } & ButtonProps
>`
  padding: ${({ padding }) => (padding ? padding : '16px')};
  width: ${({ width }) => (width ? width : '100%')};
  font-weight: 500;
  text-align: center;
  border-radius: 20px;
  border-radius: ${({ borderRadius }) => borderRadius && borderRadius};
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  &:disabled {
    cursor: auto;
    pointer-events: none;
  }

  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);

  &:hover {
    transform: scale(0.99);
  }

  > * {
    user-select: none;
  }

  > a {
    text-decoration: none;
  }
`

export const ButtonPrimary = styled(Base)`
  background-color: ${({ theme }) => theme.primary1};
  color: white;
  &:focus {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:active {
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  &:disabled {
    background-color: #e2e2f1;
    color: white;
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    // opacity: 0.4;
    background: #e2e2f1;
    // opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.5' : '0.4')};
  }
`

export const ButtonLight = styled(Base)`
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.primaryText1};
  font-size: 16px;
  font-weight: 500;
  &:focus {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary5)};
  }
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary5)};
  }
  &:active {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.05, theme.primary5)};
  }
  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: ${({ theme }) => theme.primary5};
      box-shadow: none;
      border: 1px solid transparent;
      outline: none;
    }
  }
`

export const ButtonGray = styled(Base)`
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text2};
  font-size: 16px;
  font-weight: 500;
  &:focus {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.05, theme.bg2)};
  }
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.05, theme.bg2)};
  }
  &:active {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.1, theme.bg2)};
  }
`

export const ButtonSecondary = styled(Base)`
  border: 1px solid ${({ theme }) => theme.primary4};
  color: ${({ theme }) => theme.primary1};
  background-color: transparent;
  font-size: 16px;
  border-radius: 12px;
  padding: ${({ padding }) => (padding ? padding : '10px')};

  &:focus {
    border: 1px solid ${({ theme }) => theme.primary3};
  }
  &:hover {
    border: 1px solid ${({ theme }) => theme.primary3};
  }
  &:active {
    border: 1px solid ${({ theme }) => theme.primary3};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  a:hover {
    text-decoration: none;
  }
`

export const ButtonPink = styled(Base)`
  background-color: ${({ theme }) => theme.primary1};
  color: white;

  &:focus {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:active {
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.primary1};
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonIXSGradient = styled(ButtonPrimary)<{ confirmed?: boolean; disabled?: boolean }>`
  color: white;
  min-height: 54px;
  opacity: ${({ confirmed }) => (confirmed ? 0.5 : 1)};
  width: fit-content;
  position: relative;
  cursor: pointer;
  border: none;
  background-color: ${({ confirmed }) => (confirmed ? 'transparent' : '#6666ff')};

  :hover {
    border-radius: 8px;
    background-color: #6666ff;
    background: #6666ff;
    @media (min-width: 1000px) {
      opacity: 0.8;
    }
  }
  :active {
    opacity: 0.9;
    border-radius: 8px;
    background-color: #6666ff;
    background: #6666ff;
  }
  border-radius: 8px;
  font-weight: 600;
  font-size: 18px;
  line-height: 20px;
  // background-color: ${({ theme }) => theme.config.primary?.main || theme.bg3};
  // background: ${({ theme }) => theme.config.primary?.main || theme.bgG3};
  background-color: #6666ff;
  background: transparent;
  border: 1px solid #6666ff;
  padding: 28px 18px;
  margin-right: 20px;

  &:disabled {
    background-color: ${({ confirmed }) => (confirmed ? 'transparent' : '#e2e2f1')};
    color: ${({ confirmed }) => (confirmed ? '#0ec080 ' : 'white')};
    border: ${({ confirmed }) => (confirmed ? '1px solid #0ec080' : '1px solid transparent')};
    opacity: ${({ confirmed }) => (confirmed ? '1' : '0.5')};
  }
`
export const ButtonGradientBorder = styled(ButtonIXSGradient)`
  background-color: transparent;
  background: transparent;
  border-radius: 8px;
  color: #b8b8cc;
  border: 1px solid #e6e6ff;
  padding: 28px 18px;
  margin-right: 0px;

  :focus,
  :hover {
    background-color: transparent;
    background: transparent;
    border: 1px solid #6666ff;
  }
  &:disabled {
    background-color: transparent;
    background: transparent;
    color: ${({ theme }) => theme.text1};
  }
`
export const ButtonPinkBorder = styled(ButtonIXSGradient)`
  background-color: transparent;
  background: transparent;
  color: #6666ff;
  border: 1px solid #e6e6ff;
  font-size: 13px;
  font-weight: 600;
  :focus,
  :hover {
    background-color: transparent;
    background: transparent;
  }
  &:disabled {
    background-color: transparent;
    background: transparent;
  }
`
export const ButtonIXSWide = styled(ButtonIXSGradient)`
  width: 100%;
  background-color: #6666ff;
`
export const ButtonGradient = styled(Base)`
  color: ${(props) => props.theme.launchpad.colors.text.light};
  background-color: ${(props) => props.theme.launchpad.colors.primary};
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  padding: 7px 0;
  cursor: pointer;
`

export const NewButtonGradient = styled(Base)`
  background: ${({ theme }) => theme.config.primary?.main || theme.bg25};
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  padding: 14px 0;
  border: 1px solid #e6e6ff;
  cursor: pointer;
`

export const PinnedContentButton = styled(Base)`
  color: #16171c;
  background-color: #ffffff;
  font-family: 'Inter Display', sans-serif;
  font-weight: 500;
  border-radius: 50px;
  text-align: center;
  border: unset;
  cursor: pointer;
  width: 100%;
  padding: 12px 32px;
  font-size: 16px;
  &:disabled {
    background-color: #222328;
    background: #222328;
    color: #ffffff;
    opacity: 0.5;
  }
`

export const NewApproveButton = styled(Base)`
  color: ${(props) => props.theme.launchpad.colors.text.green};
  background-color: ${(props) => props.theme.launchpad.colors.background};
  font-family: ${(props) => props.theme.launchpad.font};
  border-radius: 6px;
  text-align: center;
  padding: 12px, 16px, 12px, 16px;
  border: unset;
  cursor: pointer;
  width: 100%;
  border: solid 1px #09cd8780;
`

export const ButtonOutlined = styled(Base)`
  border: none;
  background-color: #222328;
  color: #ffffff;
  border-radius: 50px;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Inter Display', sans-serif;
  padding: 12px 32px;

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  // &:hover {
  //   box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  // }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:disabled {
    // opacity: 50%;
    cursor: auto;
  }
`

export const ButtonEmpty = styled(Base)`
  background-color: transparent;
  color: ${({ theme }) => theme.primary1};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonText = styled(Base)`
  padding: 0;
  width: fit-content;
  background: none;
  text-decoration: none;
  &:focus {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    text-decoration: underline;
  }
  &:hover {
    // text-decoration: underline;
    opacity: 0.9;
  }
  &:active {
    text-decoration: underline;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonWhite = styled(Base)`
  border: 1px solid #edeef2;
  background-color: ${({ theme }) => theme.bg1};
  color: black;

  &:focus {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }
  &:hover {
  }
  &:active {
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

const ButtonConfirmedStyle = styled(Base)`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text1};

  &:disabled {
    background-color: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.text2};
    cursor: auto;
  }
`

const ButtonErrorStyle = styled(Base)`
  background-color: ${({ theme }) => darken(0.0, theme.bg25)};
  border: 1px solid #ff616133;
  color: #ff6161;
  border-radius: 6px;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.error};
    border: 1px solid ${({ theme }) => theme.error};
  }
`

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}

export function ButtonDropdown({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  )
}

export function ButtonDropdownGrey({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonGray {...rest} disabled={disabled} style={{ borderRadius: '20px' }}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonGray>
  )
}

export function ButtonDropdownLight({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  )
}

export function ButtonRadio({ active, ...rest }: { active?: boolean } & ButtonProps) {
  if (!active) {
    return <ButtonWhite {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}

const ActiveOutlined = styled(ButtonOutlined)`
  border: 1px solid;
  border-color: ${({ theme }) => theme.primary1};
`

const Circle = styled.div`
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.primary1};
  display: flex;
  align-items: center;
  justify-content: center;
`

const CheckboxWrapper = styled.div`
  width: 30px;
  padding: 0 10px;
  position: absolute;
  top: 10px;
  right: 10px;
`

const ResponsiveCheck = styled(Check)`
  size: 13px;
`

export function ButtonRadioChecked({ active = false, children, ...rest }: { active?: boolean } & ButtonProps) {
  const theme = useTheme()

  if (!active) {
    return (
      <ButtonOutlined borderRadius="12px" padding="12px 8px" {...rest}>
        {<RowBetween>{children}</RowBetween>}
      </ButtonOutlined>
    )
  } else {
    return (
      <ActiveOutlined {...rest} padding="12px 8px" borderRadius="12px">
        {
          <RowBetween>
            {children}
            <CheckboxWrapper>
              <Circle>
                <ResponsiveCheck size={13} stroke={theme.white} />
              </Circle>
            </CheckboxWrapper>
          </RowBetween>
        }
      </ActiveOutlined>
    )
  }
}

export const ButtonOutLinedThick = styled(ButtonOutlined)`
  border: 2px solid ${({ theme }) => theme.text2};
`

export const ButtonPlus = ({ disabled = false, ...rest }: { disabled?: boolean } & ButtonProps) => {
  return (
    <ButtonOutLinedThick {...rest} disabled={disabled}>
      <RowCenter>
        <Plus size={24} />
      </RowCenter>
    </ButtonOutLinedThick>
  )
}
