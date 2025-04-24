import React, { useEffect, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Flex } from 'rebass'
import numeral from 'numeral'

import { ReactComponent as WalletIcon } from 'assets/images/dex-v2/wallet.svg'
import { ReactComponent as WarningIcon } from 'assets/images/dex-v2/warning.svg'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { isLessThanOrEqualTo, isPositive } from 'lib/utils/validations'
import Asset from 'pages/DexV2/common/Asset'
import { overflowProtected } from '../../components/helpers'
import { formatAmount } from 'utils/formatCurrencyAmount'
import { Rules } from 'types'
import useInputValidation from 'pages/DexV2/common/forms/useInputValidation'

type InputValue = string | number

interface TokenInputProps extends React.HTMLAttributes<HTMLInputElement> {
  disabled?: boolean
  autoFocus?: boolean
  name: string
  amount: InputValue
  address?: string
  weight?: number | string
  rules?: Rules
  ignoreWalletBalance?: boolean
  updateAmount: (value: string) => void
}

const displayNumeralNoDecimal = (amount: any) => numeral(amount).format('0,0')

const TokenInput: React.FC<TokenInputProps> = (props) => {
  const theme = useTheme()
  const { getToken, balanceFor } = useTokens()
  const { weight = 0, address = '', rules = [], ignoreWalletBalance = false, disabled, name, autoFocus } = props

  const [amount, setAmount] = useState<any>('')
  const [displayValue, setDisplayValue] = useState<string>('')

  const token = address ? getToken(address) : null
  const hasToken = !!address
  const decimalLimit = useMemo<number>(() => token?.decimals || 18, [token])
  const balance = !address ? '0' : balanceFor(address)

  let inputRules
  if (!hasToken) {
    inputRules = [isPositive()]
  } else {
    inputRules = [...rules, isPositive()]
    if (!ignoreWalletBalance) {
      inputRules.push(isLessThanOrEqualTo(balance, 'Exceeds wallet balance'))
    }
  }

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
      const safeAmount = overflowProtected(value || '0', decimalLimit)

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

  const handleUpdateIsValid = (isValid: boolean) => {
    console.log('Is valid?', isValid)
  }

  const { errors, isInvalid, validate } = useInputValidation({
    rules: inputRules,
    validateOn: 'input',
    modelValue: amount,
    onUpdateIsValid: handleUpdateIsValid,
  })

  useEffect(() => {
    handleAmountChange(props.amount.toString())
  }, [props.amount])

  useEffect(() => {
    validate(amount)
  }, [address])

  console.log('TokenInput', props)
  return (
    <LiquidityContainer isError={isInvalid && !!errors[0]} className="token-input">
      <FlexContainer>
        <TokenWrap>
          <Asset address={token?.address} iconURI={token?.logoURI} size={20} />
          <TokenSymbol>{token?.symbol}</TokenSymbol>
          <PercentText>{weight}%</PercentText>
        </TokenWrap>

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
      </FlexContainer>
      <Flex justifyContent="space-between" alignItems="center">
        <FlexBalance>
          <BalanceText>{formatAmount(+balance, 2)}</BalanceText>
          <WalletIcon />
        </FlexBalance>

        {errors.length > 0 ? (
          <FlexBalance>
            <ErrorText>{errors[0]}</ErrorText>
            <WarningIcon color={theme.red5} />
          </FlexBalance>
        ) : null}
      </Flex>
    </LiquidityContainer>
  )
}

export default TokenInput

const LiquidityContainer = styled.div<{ isError: boolean }>`
  margin-top: 16px;
  border-radius: 8px;
  border: ${({ isError }) => (isError ? '1px solid rgba(255, 128, 128, 0.50)' : 'none')};
  background: #f7f7fa;
  padding: 16px;
`

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const TokenWrap = styled.div`
  display: flex;
  padding: 8px 12px 8px 8px;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
`

const FlexBalance = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TokenSymbol = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const PercentText = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const StyledInput = styled.input`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 28px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.84px;
  text-align: right;
  outline: none;
  border: none;
  background: transparent;
  min-width: 50px;
`

const BalanceText = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const ErrorText = styled.div`
  color: rgba(255, 128, 128, 0.9);
  text-align: center;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`
