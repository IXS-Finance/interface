import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import _get from 'lodash/get'

import TokenSelectInput from '../../common/TokenSelectInput'
import { ReactComponent as WalletIcon } from 'assets/images/dex-v2/wallet.svg'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { bnum, isSameAddress } from 'lib/utils'
import { TokenInfo } from 'types/TokenList'
import { useAccount } from 'wagmi'
import { isLessThanOrEqualTo, isPositive } from 'lib/utils/validations'
import { Rules } from 'pages/DexV2/types'
import { overflowProtected } from 'pages/DexV2/Pool/components/helpers'
import { useTokensState } from 'state/dexV2/tokens/hooks'

type InputValue = string | number

type Props = {
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
  // tokenSelectProps?: Partial<TokenSelectProps>
  slider?: boolean
  // sliderProps?: Partial<BalRangeInputProps>
  updateAmount: (amount: string) => void
  updateAddress: (address: string) => void
  setMax?: () => void
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
  // options: () => [],
  rules: [],
  priceImpact: 0,
  label: '',
  customBalance: '',
  balanceLabel: '',
  hint: '',
  excludedTokens: [],
  placeholder: '',
  // tokenSelectProps: () => ({}),
  slider: false,
  // sliderProps: () => ({}),
  updateAmount: () => {},
  updateAddress: () => {},
  setMax: () => {},
}

const TokenInput: React.FC<Props> = (props = defaultProps) => {
  const {
    name,
    noMax,
    disableMax,
    customBalance,
    excludedTokens,
    autoFocus,
    hideFiatValue,
    disableNativeAssetBuffer,
    updateAddress,
  } = props
  const [address, setAddress] = useState<any>('')
  const [amount, setAmount] = useState<any>('')

  const { address: account } = useAccount()
  const isWalletReady = useMemo(() => account !== null, [account])
  const { fNum, toFiat } = useNumbers()
  const { getToken, balanceFor, nativeAsset, getMaxBalanceFor } = useTokens()
  const { balances } = useTokensState()

  /**
   * COMPUTED
   */
  const tokenBalance = useMemo(() => {
    if (customBalance) return customBalance
    return balanceFor(_get(props, 'address', ''))
  }, [props.address, customBalance, JSON.stringify(balances)])

  console.log('tokenBalance', tokenBalance)
  console.log('props.address', props.address)

  const hasToken = !!props.address
  const amountBN = bnum(props.amount)
  const tokenBalanceBN = bnum(tokenBalance)
  const hasAmount = amountBN.gt(0)
  const hasBalance = tokenBalanceBN.gt(0)
  const shouldUseTxBuffer = props.address === nativeAsset.address && !disableNativeAssetBuffer
  const amountExceedsTokenBalance = amountBN.gt(tokenBalance)
  const shouldShowTxBufferMessage = useMemo(() => {
    if (amountExceedsTokenBalance || !shouldUseTxBuffer || !hasBalance || !hasAmount) {
      return false
    }

    return amountBN.gte(tokenBalanceBN.minus(nativeAsset.minTransactionBuffer))
  }, [amountExceedsTokenBalance, shouldUseTxBuffer, hasBalance, hasAmount])

  const isMaxed = useMemo(() => {
    if (shouldUseTxBuffer) {
      return props.amount === tokenBalanceBN.minus(nativeAsset.minTransactionBuffer).toString()
    } else {
      return props.amount === tokenBalance
    }
  }, [props.amount, tokenBalance, shouldUseTxBuffer])

  const token = useMemo((): TokenInfo | undefined => {
    if (!hasToken) return undefined
    return getToken(_get(props, 'address', ''))
  }, [props.address, hasToken])

  const tokenValue = props.tokenValue ?? toFiat(amount, _get(props, 'address', ''))

  const inputRules = useMemo(() => {
    if (!hasToken || !isWalletReady || props.noRules) {
      return [isPositive()]
    }

    const rules = props.rules ? [...props.rules, isPositive()] : [isPositive()]
    if (!props.ignoreWalletBalance) {
      rules.push(isLessThanOrEqualTo(tokenBalance, 'exceedsBalance'))
    }
    return rules
  }, [hasToken, isWalletReady, props.noRules, props.rules, props.ignoreWalletBalance, tokenBalance])

  const maxPercentage = useMemo(() => {
    if (!hasBalance || !hasAmount) return '0'

    return amountBN.div(tokenBalance).times(100).toFixed(2)
  }, [hasBalance, hasAmount, amountBN, tokenBalance])

  const bufferPercentage = useMemo(() => {
    if (!shouldShowTxBufferMessage) return '0'

    return bnum(nativeAsset.minTransactionBuffer).div(tokenBalance).times(100).toFixed(2)
  }, [shouldShowTxBufferMessage, tokenBalance])

  const barColor = amountExceedsTokenBalance ? 'red' : 'green'

  const priceImpactSign = _get(props, 'priceImpact', 0) >= 0 ? '-' : '+'

  const priceImpactClass = _get(props, 'priceImpact', 0) >= 0.01 ? 'text-red-500' : ''

  const decimalLimit = token?.decimals || 18

  function handleAmountChange(amount: InputValue) {
    const safeAmount = overflowProtected(amount, decimalLimit)

    setAmount(safeAmount)
    props.updateAmount(safeAmount)
  }

  const setMax = () => {
    if (props.disableMax) return

    const maxAmount = props.customBalance
      ? props.customBalance
      : getMaxBalanceFor(_get(props, 'address', ''), props.disableNativeAssetBuffer)

    // emit('setMax', maxAmount)
    handleAmountChange(maxAmount)
  }

  function blockInvalidChar(event: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault()
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    blockInvalidChar(event.nativeEvent)
  }

  useEffect(() => {
    setAddress(props.address)
    setAmount(props.amount)
  }, [props.address, props.amount])

  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center">
        <StyledInput
          placeholder="0.00"
          min="0"
          step="0.01"
          onKeyDown={onKeyDown}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          value={amount}
          name={name}
          autoFocus={autoFocus}
          onChange={(e) => handleAmountChange(e.target.value)}
        />

        <Flex alignItems="center" style={{ gap: 8 }}>
          {hasBalance && !noMax && !disableMax ? <MaxButton onClick={setMax}>MAX</MaxButton> : null}
          <TokenSelectInput
            modelValue={address as string}
            excludedTokens={excludedTokens}
            updateAddress={(value) => updateAddress(value)}
          />
        </Flex>
      </Flex>

      <Flex justifyContent="space-between" alignItems="center">
        {hasAmount && hasToken && !hideFiatValue ? (
          <StyledNumber>{fNum(tokenValue, FNumFormats.fiat)}</StyledNumber>
        ) : (
          <div />
        )}

        <Flex alignItems="center" style={{ gap: 8 }}>
          <StyledNumber>{fNum(tokenBalance, FNumFormats.token)}</StyledNumber>
          <WalletIcon />
        </Flex>
      </Flex>
    </Container>
  )
}

export default TokenInput

const Container = styled.div`
  border-radius: 8px;
  background: #f7f7fa;
  display: flex;
  padding: 16px;
  flex-direction: column;
  gap: 8px;
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
  max-width: 170px;
`

const StyledNumber = styled.div`
  color: #b8b8d2;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: -0.42px;
`

const MaxButton = styled.button`
  display: flex;
  padding: 8px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 8px;
  background: #fff;
  outline: none;
  border: none;
  font-weight: 600;
  color: #66f;
  font-size: 9px;
`
