/* eslint-disable indent */
import { Trans } from '@lingui/macro'
import React, { useEffect, useState } from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import numeral from 'numeral'

import USDCIcon from 'assets/images/usdcNew.svg'
import LoadingBlock from '../LoadingBlock'
import useInputValidation from './useInputValidation'
import { isLessThanOrEqualTo, isPositive } from './validations'

export type RuleFunction = (val: string | number) => string | boolean
type Rules = Array<RuleFunction>

/**
 * Returns an array of validation rule functions.
 *
 * @param hasToken - Indicates if a token is available.
 * @param isWalletReady - Indicates if the wallet is ready.
 * @param props - An object that can include `noRules`, `ignoreWalletBalance`, and an optional `rules` array.
 * @param tokenBalance - The current token balance.
 * @param t - A translation function.
 *
 * @returns An array of RuleFunction.
 */
function getInputRules(
  hasToken: boolean,
  isWalletReady: boolean,
  props: { noRules?: boolean; ignoreWalletBalance?: boolean; rules?: Rules },
  tokenBalance: string
): Rules {
  if (!hasToken || !isWalletReady || props.noRules) {
    return [isPositive()]
  }

  const rules = props.rules ? [...props.rules, isPositive()] : [isPositive()]
  if (!props.ignoreWalletBalance) {
    rules.push(isLessThanOrEqualTo(tokenBalance, 'Exceeds wallet balance'))
  }
  return rules
}

/**
 * Slices the decimals that exceed the given decimal limit
 */
export function overflowProtected(value: string | number, decimalLimit: number): string {
  const stringValue = value.toString()
  const [numberStr, decimalStr] = stringValue.split('.')

  if (decimalStr && decimalStr.length > decimalLimit) {
    const maxLength = numberStr.length + decimalLimit + 1
    return stringValue.slice(0, maxLength)
  } else return stringValue
}

type Props = {
  shouldShowIcon?: boolean
  disabled?: boolean
  name: string
  tokenName?: string
  amount: any
  noRules?: boolean
  label?: string
  customBalance?: string
  disableMax?: boolean
  balanceLoading?: boolean
  rules?: Rules
  autoFocus?: boolean
  updateAmount: (amount: string) => void
  updateIsValid?: (isValid: boolean) => void
  setMax?: () => void
}

const decimalLimit = 6
const displayNumeralNoDecimal = (amount: any) => numeral(amount).format('0,0')

const AmountInput: React.FC<Props> = (props) => {
  const { disabled, name, label, autoFocus, customBalance, tokenName = 'USDC', updateAmount } = props
  const [displayValue, setDisplayValue] = useState<string>('')

  const inputRules = getInputRules(true, true, props, customBalance || '0')

  function handleAmountChange(val: string) {
    // Remove commas from the input.
    const value = val.split(',').join('')

    // If the input is empty, clear everything and exit early.
    if (value === '') {
      setDisplayValue('')
      updateAmount('')
      return
    }

    const regex = /^-?\d*[.,]?\d*$/
    if (regex.test(value)) {
      let limitToFormat = decimalLimit

      // Get string after . of value
      const decimalPart = value.indexOf('.') > -1 ? value.substring(value.indexOf('.') + 1) : ''

      // Compare with decimalLimit to get exact amount decimal to format
      if (decimalPart.length < decimalLimit) {
        limitToFormat = decimalPart.length
      }

      const safeAmount = overflowProtected(value || '0', limitToFormat)

      updateAmount(safeAmount)

      // Prevent multiple leading zeros.
      if (val.length >= 2 && val.charAt(0) === '0' && val.charAt(1) === '0') {
        return setDisplayValue('0')
      }

      // Handle cases where a decimal point exists.
      if (value.indexOf('.') > -1) {
        const integerPart = value.substring(0, value.indexOf('.'))
        const decimalPart = value.substring(value.indexOf('.') + 1, value.indexOf('.') + decimalLimit + 1)
        const formattedInteger = displayNumeralNoDecimal(integerPart)

        // Preserve the trailing decimal if user types "0." or "1.".
        if (value.endsWith('.')) {
          return setDisplayValue(`${formattedInteger}.`)
        }
        // If there is a decimal part, combine it.
        if (decimalPart) {
          return setDisplayValue(`${formattedInteger}.${decimalPart}`)
        }
        return setDisplayValue(formattedInteger)
      }

      // For values without a decimal, display the formatted number.
      setDisplayValue(numeral(value).format('0,0'))
    }
  }

  const setMax = () => {
    if (!customBalance) return
    handleAmountChange(customBalance || '0')
  }

  const handleUpdateIsValid = (isValid: boolean) => {
    props.updateIsValid?.(isValid)
  }

  const { errors, isInvalid, validate } = useInputValidation({
    rules: inputRules,
    validateOn: 'input',
    modelValue: props.amount,
    onUpdateIsValid: handleUpdateIsValid,
  })

  useEffect(() => {
    handleAmountChange(props.amount.toString())
    validate(props.amount)
  }, [props.amount])

  return (
    <>
      <FormSectionTitle>
        <Trans>{label}</Trans>
      </FormSectionTitle>
      <InputContainer isError={isInvalid && !!errors[0]}>
        <WrapInputRow>
          <InputRow style={{ minHeight: '60px' }}>
            <StyledInput
              disabled={disabled}
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              type="text"
              spellCheck="false"
              placeholder="0.00"
              value={displayValue}
              name={name}
              autoFocus={autoFocus}
              onChange={(e) => {
                handleAmountChange(e.target.value)
              }}
            />
            <div>
              <Flex css={{ gap: '8px', alignItems: 'center' }}>
                <MaxButton onClick={setMax}>MAX</MaxButton>
                <CurrencySelector>
                  {props.shouldShowIcon && (
                    <CurrencyIcon>
                      <img src={USDCIcon} alt="USDC" />
                    </CurrencyIcon>
                  )}
                  <CurrencyText>{tokenName}</CurrencyText>
                </CurrencySelector>
              </Flex>

              <BalanceText>
                {props.balanceLoading ? (
                  <LoadingBlock className="mx-2 w-12 h-4" />
                ) : (
                  <BalanceAmount>
                    {customBalance
                      ? Number(customBalance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })
                      : '0'}
                  </BalanceAmount>
                )}{' '}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12.6667 13.3334H3.33333C2.59695 13.3334 2 12.7364 2 12V6.00002C2 5.26364 2.59695 4.66669 3.33333 4.66669H12.6667C13.4031 4.66669 14 5.26364 14 6.00002V12C14 12.7364 13.4031 13.3334 12.6667 13.3334Z"
                    stroke="#B8B8CC"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M11.0001 9.33335C10.816 9.33335 10.6667 9.18409 10.6667 9.00002C10.6667 8.81595 10.816 8.66669 11.0001 8.66669C11.1841 8.66669 11.3334 8.81595 11.3334 9.00002C11.3334 9.18409 11.1841 9.33335 11.0001 9.33335Z"
                    fill="#B8B8CC"
                    stroke="#B8B8CC"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 4.66668V3.73549C12 2.85945 11.1696 2.22146 10.3231 2.44718L2.98978 4.40274C2.40611 4.55838 2 5.08698 2 5.69105V6.00001"
                    stroke="#B8B8CC"
                    strokeWidth="1.5"
                  />
                </svg>
              </BalanceText>
            </div>
          </InputRow>
          {isInvalid && !!errors[0] ? (
            <Box
              sx={{
                fontSize: '12px',
                color: '#FF8080',
                mt: 2,
              }}
            >
              {errors[0]}
            </Box>
          ) : null}
        </WrapInputRow>
      </InputContainer>
    </>
  )
}

export default AmountInput

export const FormSectionTitle = styled.h2`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
  margin-top: 0;

  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 24px;
  }
`

export const InputContainer = styled.div<{ isError: boolean }>`
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 8px;
  border: ${({ isError }) => (isError ? '1px solid rgba(255, 128, 128, 0.50)' : 'none')};

  .mx-2 {
    margin-left: 8px;
    margin-right: 8px;
  }

  .w-12 {
    width: 48px;
  }

  .h-4 {
    height: 16px;
  }
`

const WrapInputRow = styled.div`
  padding: 16px;
  @media (min-width: 768px) {
    padding: 32px;
  }
`
export const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const StyledInput = styled.input`
  color: #292933;
  font-family: Inter;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.72px;
  font-family: Inter;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  border: none;
  background: transparent;
  padding: 0;
  width: 150px;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #cccccc;
  }

  @media (min-width: 768px) {
    width: 500px;
    font-size: 64px;
    letter-spacing: -1.92px;
  }
`

export const CurrencySelector = styled.div`
  display: flex;
  padding: 8px 12px 8px 12px;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  cursor: pointer;
`

export const CurrencyIcon = styled.div`
  width: 24px;
  height: 24px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`

export const CurrencyText = styled.div`
  font-weight: 500;
  color: #1f1f1f;
  font-size: 14px;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`
// Balance Specific
export const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
`

export const BalanceText = styled.div`
  text-align: right;
  font-size: 14px;
  color: #7e829b;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
`

export const BalanceAmount = styled.span`
  font-weight: 500;
  color: #1f1f1f;
  font-size: 14px;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`

export const MaxButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 8px;
  background: #fff;
  color: #66f;
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.18px;
  border: none;
  cursor: pointer;
  padding: 8px 12px 8px 12px;

  &:hover {
    background: #e0e0e0;
  }

  @media (min-width: 768px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`

// Action Row (used for Exchange Rate + Button)
export const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    margin-top: 24px;
  }
`
