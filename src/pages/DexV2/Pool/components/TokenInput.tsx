import React, { useEffect, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Flex } from 'rebass'

import { ReactComponent as WalletIcon } from 'assets/images/dex-v2/wallet.svg'
import { ReactComponent as WarningIcon } from 'assets/images/dex-v2/warning.svg'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { formatAmount } from '../../common/modals/SelectTokenModal'
import { RuleFunction, Rules } from '../../types'
import { isLessThanOrEqualTo, isPositive } from 'lib/utils/validations'
import { overflowProtected } from './helpers'

type InputValue = string | number

interface TokenInputProps {
  name: string
  amount: InputValue
  address?: string
  weight?: number | string
  rules?: Rules
  ignoreWalletBalance?: boolean
  updateAmount: (value: string) => void
}

const TokenInput: React.FC<TokenInputProps> = (props) => {
  const theme = useTheme()
  const { getToken, balanceFor } = useTokens()
  const { weight = 0, address = '', rules = [], ignoreWalletBalance = false, amount, updateAmount } = props

  const [errors, setErrors] = useState<string[]>([])
  const [amountValue, setAmountValue] = useState<string>('')

  const token = useMemo(() => {
    if (!address) {
      return null
    }

    return getToken(address)
  }, [address])
  const hasToken = useMemo(() => !!address, [address])
  const decimalLimit = useMemo<number>(() => token?.decimals || 18, [token])

  const balance = useMemo(() => {
    if (!address) {
      return '0'
    }

    return balanceFor(address)
  }, [address])

  const inputRules = useMemo(() => {
    if (!hasToken) {
      return [isPositive()]
    }

    const rulesList = [...rules, isPositive()]
    if (!ignoreWalletBalance) {
      rulesList.push(isLessThanOrEqualTo(balance, 'Exceeds wallet balance'))
    }
    return rulesList
  }, [hasToken, rules, ignoreWalletBalance, balance])

  function validate(val: string | number): void {
    const errorsTemp = [] as any

    inputRules.forEach((rule: RuleFunction) => {
      const result = rule(val)
      if (typeof result === 'string') errorsTemp.push(result)
    })

    setErrors(errorsTemp)
  }

  function blockInvalidChar(event: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault()
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    blockInvalidChar(event.nativeEvent)
  }

  function handleAmountChange(value: string) {
    const safeAmount = overflowProtected(value, decimalLimit)
    validate(safeAmount)
    setAmountValue(safeAmount)
    updateAmount(safeAmount)
  }

  useEffect(() => {
    setAmountValue(formatAmount(+amount, 2));
  }, [amount])

  return (
    <LiquidityContainer className="token-input">
      <FlexContainer>
        <TokenWrap>
          <img src={token?.logoURI} alt={token?.symbol} width={20} height={20} />
          <TokenSymbol>{token?.symbol}</TokenSymbol>
          <PercentText>{weight}%</PercentText>
        </TokenWrap>

        <StyledInput
          placeholder="0.00"
          min="0"
          step="0.01"
          onKeyDown={onKeyDown}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          value={amountValue}
          onChange={(e) => handleAmountChange(e.target.value)}
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

const LiquidityContainer = styled.div`
  margin-top: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 128, 128, 0.5);
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
