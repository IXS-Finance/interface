import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Box, Flex } from 'rebass'
import _get from 'lodash/get'
import numeral from 'numeral'

import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { isSameAddress } from 'lib/utils'
import { TokenInfo } from 'types/TokenList'
import { useAccount } from 'wagmi'
import { isLessThanOrEqualTo, isPositive } from 'lib/utils/validations'
import { Rules } from 'pages/DexV2/types'
import { overflowProtected } from 'pages/DexV2/Pool/components/helpers'
import useInputValidation from 'pages/DexV2/common/forms/useInputValidation'
import TokenSelectInput from 'pages/DexV2/common/TokenSelectInput'

type InputValue = string | number

type Props = {
  disabled?: boolean
  name: string
  amount: InputValue
  address?: string
  weight?: number | string
  noRules?: boolean
  noMax?: boolean
  priceImpact?: number
  label?: string
  fixedToken?: boolean
  customBalance?: string
  balanceLabel?: string
  disableMax?: boolean
  disableBalance?: boolean
  balanceLoading?: boolean
  hint?: string
  hintAmount?: string
  excludedTokens?: string[]
  options?: string[]
  rules?: Rules
  autoFocus?: boolean
  disableNativeAssetBuffer?: boolean
  hideFooter?: boolean
  hideFiatValue?: boolean
  ignoreWalletBalance?: boolean
  tokenValue?: string
  placeholder?: string
  slider?: boolean
  updateAmount: (amount: string) => void
  setMax?: () => void
  setExactInOnChange?: () => void
  onValidityChange?: (isValid: boolean) => void
}

const defaultProps: Props = {
  name: '',
  amount: '',
  address: '',
  weight: 0,
  noRules: false,
  noMax: false,
  fixedToken: false,
  disableMax: false,
  disableBalance: false,
  balanceLoading: false,
  hintAmount: '',
  disableNativeAssetBuffer: false,
  hideFooter: false,
  hideFiatValue: false,
  ignoreWalletBalance: false,
  rules: [],
  priceImpact: 0,
  label: '',
  customBalance: '',
  balanceLabel: '',
  hint: '',
  excludedTokens: [],
  placeholder: '',
  slider: false,
  updateAmount: () => {},
  setMax: () => {},
}

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

const displayNumeralNoDecimal = (amount: any) => numeral(amount).format('0,0')

const TokenPriceInput: React.FC<Props> = (props = defaultProps) => {
  const { disabled, name, customBalance, excludedTokens, autoFocus } = props
  const [address, setAddress] = useState<any>('')
  const [amount, setAmount] = useState<any>('')
  const [displayValue, setDisplayValue] = useState<string>('')

  const { address: account } = useAccount()
  const isWalletReady = account !== null
  const { getToken, balanceFor } = useTokens()

  const tokenBalance = customBalance ? customBalance : balanceFor(_get(props, 'address', ''))
  const hasToken = !!props.address
  const token: TokenInfo | undefined = !hasToken ? undefined : getToken(_get(props, 'address', ''))
  const inputRules = getInputRules(hasToken, isWalletReady, props, tokenBalance)
  const decimalLimit = 6;

  function handleAmountChange(val: string) {
    // Remove commas from the input.
    const value = val.split(',').join('')

    // If the input is empty, clear everything and exit early.
    if (value === '') {
      setDisplayValue('')
      setAmount('')
      props.updateAmount('')
      return
    }

    const regex = /^-?\d*[.,]?\d*$/
    if (regex.test(value)) {
      let limitToFormat = decimalLimit

      // Get string after . of value
      const decimalPart = value.indexOf('.') > -1 ? value.substring(value.indexOf('.') + 1) : '';

      // Compare with decimalLimit to get exact amount decimal to format
      if (decimalPart.length < decimalLimit) {
        limitToFormat = decimalPart.length
      }

      const safeAmount = overflowProtected(value || '0', limitToFormat)


      setAmount(safeAmount)
      props.updateAmount(safeAmount)

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

  useEffect(() => {
    handleAmountChange(props.amount.toString())
  }, [props.amount])

  useEffect(() => {
    if (isSameAddress(address, props.address || '')) return
    setAddress(props.address)
  }, [props.address])

  const handleUpdateIsValid = (isValid: boolean) => {
    console.log('Is valid?', isValid)
  }

  const { errors, isInvalid, validate } = useInputValidation({
    rules: inputRules,
    validateOn: 'input',
    modelValue: amount,
    onUpdateIsValid: (isValid: boolean) => {
      props.onValidityChange?.(isValid)
    },
  })

  useEffect(() => {
    validate(amount)
    // notify parent on initial mount
    props.onValidityChange?.(!errors.length)
  }, [address])

  return (
    <Container isError={isInvalid && !!errors[0]}>
      <Flex justifyContent="space-between" alignItems="center">
        <div>
          <span style={{ fontSize: '28px', fontWeight: 600 }}>$</span>
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
              props.setExactInOnChange?.()
            }}
          />
        </div>

        <Flex alignItems="center" style={{ gap: 8 }}>
          <TokenSelectInput
            fixed={props.fixedToken}
            modelValue={address as string}
            excludedTokens={excludedTokens}
            updateAddress={() => {}}
          />
        </Flex>
      </Flex>

      <div>
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
      </div>
    </Container>
  )
}

export default TokenPriceInput

const Container = styled.div<{ isError: boolean }>`
  border-radius: 8px;
  background: #f7f7fa;
  display: flex;
  padding: 16px;
  flex-direction: column;
  gap: 8px;
  border: ${({ isError }) => (isError ? '1px solid rgba(255, 128, 128, 0.50)' : 'none')};
`

const StyledInput = styled.input`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 28px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.84px;
  text-align: left;
  outline: none;
  border: none;
  background: transparent;
  min-width: 50px;
  max-width: 234px;
`

const MaxButton = styled.div`
  color: #2563eb;
  transition: color 0.2s ease-in-out;
  font-size: 14px;
  text-transform: capitalize;
  cursor: pointer;

  &:hover {
    color: #8b5cf6;
  }

  &:focus {
    color: #8b5cf6;
  }
`
