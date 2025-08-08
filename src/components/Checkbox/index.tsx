import React, { CSSProperties, FC } from 'react'
import { Flex } from 'rebass'
import styled, { css } from 'styled-components'

import { ButtonText } from 'components/Button'
import { TYPE } from 'theme'
import { ReactComponent as Checked } from 'assets/images/new-dark-ui/form/checkedNew.svg'
import { ReactComponent as NotChecked } from 'assets/images/new-dark-ui/form/uncheckedNew.svg'
import { ReactComponent as RadioChecked } from 'assets/images/new-dark-ui/form/checkedRadioNew.svg'
import { ReactComponent as RadioNotChecked } from 'assets/images/new-dark-ui/form/uncheckedRadioNew.svg'

import { ReactComponent as ActiveCheck } from 'assets/images/new-dark-ui/form/ActiveCheck.svg'
import { ReactComponent as InActiveCheck } from 'assets/images/new-dark-ui/form/InactiveCheck.svg'

interface Props {
  label: string | JSX.Element
  checked: boolean
  onClick?: () => void
  isRadio?: boolean
  scaleSize?: number
  disabled?: boolean
  onBlur?: (e: any) => void
  name?: string
  buttonStyles?: CSSProperties
  id?: any
}

export const Checkbox: FC<Props> = ({
  id,
  label,
  checked,
  onClick,
  isRadio,
  onBlur,
  name,
  scaleSize = 1,
  buttonStyles,
  disabled = false,
}: Props) => {
  const style = { transform: `scale(${scaleSize})` }
  const checkedImage = isRadio ? <StyledRadioChecked style={style} /> : <StyledChecked style={style} />
  const notCheckedImage = isRadio ? <StyledRadioNotChecked style={style} id={id} /> : <StyledNotChecked style={style} />

  return (
    <ButtonText
      name={name}
      onBlur={onBlur}
      id={id}
      type="button"
      style={{ ...buttonStyles, textDecoration: 'none', textAlign: 'inherit' }}
      onClick={onClick}
      disabled={disabled}
      className="checkbox"
    >
      <Flex style={{ gap: 8, alignItems: 'center' }}>
        {checked ? checkedImage : notCheckedImage}
        {scaleSize !== 1 ? (
          <TYPE.main1 >{label}</TYPE.main1>
        ) : (
          <TYPE.body3>{label}</TYPE.body3>
        )}
      </Flex>
    </ButtonText>
  )
}

export const CheckMark: FC<Props> = ({
  id,
  label,
  checked,
  onClick,
  isRadio,
  onBlur,
  name,
  scaleSize = 1,
  buttonStyles,
  disabled = false,
}: Props) => {
  const style = { transform: `scale(${scaleSize})` }

  return (
    <ButtonText
      name={name}
      onBlur={onBlur}
      id={id}
      type="button"
      style={{ ...buttonStyles, textDecoration: 'none', textAlign: 'inherit' }}
      onClick={onClick}
      disabled={disabled}
      className="checkbox"
    >
      <Flex style={{ gap: 8 }}>
        {checked ? <ActiveCheck /> : <InActiveCheck />}
        {scaleSize !== 1 ? (
          <TYPE.title6 fontWeight={checked ? 700 : 400}>{label}</TYPE.title6>
        ) : (
          <TYPE.body3>{label}</TYPE.body3>
        )}
      </Flex>
    </ButtonText>
  )
}

const StyledChecked = styled(Checked)`
  ${({ theme }) =>
    theme.config.elements?.main &&
    css`
      rect {
        fill: ${theme.config.elements?.main};
      }
      path {
        fill: white;
      }
    `}

  min-width: 20px;
  min-height: 20px;
`

const StyledNotChecked = styled(NotChecked)`
  ${({ theme }) =>
    theme.config.elements?.main &&
    css`
      rect {
        fill: ${theme.config.elements?.main};
      }
      path {
        fill: white;
      }
    `}

  min-width: 20px;
  min-height: 20px;
`

const StyledRadioChecked = styled(RadioChecked)`
  ${({ theme }) =>
    theme.config.elements?.main &&
    css`
      circle:first-child {
        fill: ${theme.config.elements?.main};
      }
      circle:last-child {
        fill: white;
      }
    `}

  min-width: 20px;
  min-height: 20px;
`

const StyledRadioNotChecked = styled(RadioNotChecked)`
  ${({ theme }) =>
    theme.config.elements?.main &&
    css`
      circle:first-child {
        fill: ${theme.config.elements?.main};
      }
    `}

  min-width: 20px;
  min-height: 20px;
`
