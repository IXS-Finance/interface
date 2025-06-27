import { Percent } from '@ixswap1/sdk-core'
import { t, Trans } from '@lingui/macro'
import { Option, OptionCustom, OptionRow } from 'components/OptionButton'
import { DEFAULT_DEADLINE_FROM_NOW } from 'constants/misc'
import { useDeadline } from 'hooks/useDeadline'
import { useSlippage } from 'hooks/useSlippage'
import React, { useContext } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from 'theme'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import Row, { RowBetween, RowFixed, RowStart } from '../Row'
import { displayDeadline, displayUserSlippageTolerance } from './helpers'
import { isMobile } from 'react-device-detect'

const Input = styled.input`
  background: ${({ theme }) => theme.config.background?.main || theme.bg1};
  font-weight: 600;
  font-size: 22px;
  line-height: 40px;
  width: 100%;
  height: 100%;
  outline: none;
  border: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
  text-align: right;
`
const Marginer = styled.div`
  margin-bottom: 1rem;
`
const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

const MinuteLabel = styled.span`
  font-weight: 300;
  font-size: 16px;
  line-height: 33px;
  opacity: 0.5;
  color: ${({ theme }) => theme.text12};
`
const StyledOptionRow = styled(OptionRow)`
  justify-content: flex-start;
  margin-top: 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: fit-content;
    display: flex;
    gap: 10px;
    margin-top: 0px;
  `}
`
const StyledOption = styled(Option)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: fit-content;
    padding: 10px;
    margin: 0;

  `}
`
const StyledOptionCustom = styled(OptionCustom)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    // min-width: 85px;
    // max-width: 100px;
    padding: 10px;
    > div > input {
     text-align: left;

   }
  `}
`
interface TransactionSettingsProps {
  placeholderSlippage: Percent // varies according to the context in which the settings dialog is placed
}

export default function TransactionSettings({ placeholderSlippage }: TransactionSettingsProps) {
  const theme = useContext(ThemeContext)

  const { deadline, deadlineInput, deadlineError, parseCustomDeadline, resetDeadline } = useDeadline()
  const { userSlippageTolerance, slippageInput, slippageError, tooLow, tooHigh, resetSlippage, parseSlippageInput } =
    useSlippage()

  return (
    <AutoColumn gap="md">
      <Marginer>
        <AutoColumn gap="16px">
          <RowFixed>
            <TYPE.black fontWeight={500} fontSize={13} color={'#292933'}>
              <Trans>Slippage tolerance</Trans>
            </TYPE.black>
            <QuestionHelper
              text={
                <Trans>
                  Your transaction will revert if the price changes unfavorably by more than this percentage. Value
                  range 0-50%
                </Trans>
              }
            />
          </RowFixed>
          <StyledOptionRow>
            <StyledOption
              color={theme.text12}
              style={{ background: '#6666FF', color: '#FFFFFF', borderRadius: '8px', width: '50%', fontSize: '16px' }}
              key={'auto'}
              onClick={() => {
                parseSlippageInput('')
              }}
              active={userSlippageTolerance === 'auto' && !slippageInput}
            >
              Auto
            </StyledOption>

            <StyledOptionCustom
              style={{
                background: '#F7F7F8',
                color: '#B8B8CC',
                borderRadius: '8px',
                width: '50%',
                fontSize: '16px',
                border: '1px solid #E6E6FF',
                padding: '20px 5px',
              }}
              active={userSlippageTolerance !== 'auto'}
              warning={!!slippageError}
              tabIndex={-1}
            >
              <RowStart>
                <Input
                  style={{ fontSize: '14px', textAlign: 'left' }}
                  placeholder={`${placeholderSlippage.toFixed(2)}%`}
                  value={displayUserSlippageTolerance({ slippageInput, userSlippageTolerance })}
                  onChange={(e: any) => {
                    parseSlippageInput(e.target.value)
                  }}
                  onBlur={() => resetSlippage()}
                  color={slippageError ? 'red' : '#B8B8CC'}
                />

                {/* <Text color={'#B8B8CC'} fontWeight={500} fontSize={14} lineHeight={'33px'}>
                  %
                </Text> */}
              </RowStart>
            </StyledOptionCustom>
          </StyledOptionRow>
          {slippageError || tooLow || tooHigh ? (
            <RowStart
              style={{
                fontSize: '14px',
                paddingTop: '7px',
                gap: '5px',
                color: slippageError ? 'red' : '#F3841E',
              }}
            >
              {tooLow || tooHigh ? (
                <SlippageEmojiContainer>
                  <span role="img" aria-label="warning">
                    ⚠️
                  </span>
                </SlippageEmojiContainer>
              ) : null}
              {slippageError ? (
                <Trans>Enter a valid slippage percentage</Trans>
              ) : tooLow ? (
                <Trans>Your transaction may fail</Trans>
              ) : (
                <Trans>Your transaction may be frontrun</Trans>
              )}
            </RowStart>
          ) : null}
        </AutoColumn>
      </Marginer>
      <Marginer>
        <AutoColumn gap="sm">
          <RowFixed>
            <TYPE.black fontWeight={500} fontSize={13} color={'#292933'}>
              <Trans>Transaction deadline</Trans>
            </TYPE.black>
            <QuestionHelper
              text={`Your transaction will revert if it is pending for more than this period of time. Value range 1 - 180 min.`}
            />
          </RowFixed>

          <StyledOptionCustom
            style={{
              background: '#F7F7F8',
              color: '#B8B8CC',
              borderRadius: '8px',
              width: '100%',
              fontSize: '16px',
              border: '1px solid #E6E6FF',
              marginTop: '10px',
            }}
            warning={!!deadlineError}
            tabIndex={-1}
          >
            <RowStart>
              <Input
                style={{ textAlign: 'left', fontSize: '15px' }}
                placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
                value={displayDeadline({ deadlineInput, deadline })}
                onChange={(e: any) => parseCustomDeadline(e.target.value)}
                onBlur={() => resetDeadline()}
                color={deadlineError ? 'red' : ''}
              />
              <Text style={{ paddingLeft: '8px', marginRight: isMobile ? '10px' : '' }} color={'#B8B8CC'} fontSize={15}>
                Minutes
              </Text>
            </RowStart>
          </StyledOptionCustom>

          {deadlineError ? (
            <RowStart
              style={{
                fontSize: '14px',
                paddingTop: '7px',
                gap: '5px',
                color: 'red',
              }}
            >
              <Trans>Deadline range is 1-180 minutes</Trans>
            </RowStart>
          ) : null}
        </AutoColumn>
      </Marginer>
    </AutoColumn>
  )
}
