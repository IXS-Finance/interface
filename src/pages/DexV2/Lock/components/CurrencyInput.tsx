import { Currency, Percent } from '@ixswap1/sdk-core'
import styled from 'styled-components/macro'
import { darken } from 'polished'
import { RowFixed, RowEnd } from 'components/Row'
import { Input as NumericalInput } from 'components/NumericalInput'
import { useActiveWeb3React } from 'hooks/web3'
import { Trans } from '@lingui/macro'
import useTheme from 'hooks/useTheme'
import { formatCurrencySymbol } from 'utils/formatCurrencySymbol'
import { useCurrencyBalanceV2 } from 'state/wallet/hooks'
import { TYPE } from 'theme'
import { AssetLogo } from 'components/CurrencyInputPanel/AssetLogo'
import { Box, Flex } from 'rebass'
import { Button } from '@mui/material'
import { IXS_ADDRESS } from 'constants/addresses'
import { DEFAULT_CHAIN_ID } from 'config'
import { formatAmount } from 'utils/formatCurrencyAmount'
import useInputValidation from 'pages/DexV2/common/forms/useInputValidation'
import { isLessThanOrEqualTo, isPositive } from 'lib/utils/validations'

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  currency?: (Currency & { tokenInfo?: { decimals?: number } }) | null
  priceImpact?: Percent
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  currency,
  priceImpact,
  ...rest
}: CurrencyInputPanelProps) {
  const { account, chainId } = useActiveWeb3React()
  const currencyBalance = useCurrencyBalanceV2({
    account,
    chainId,
    currency: IXS_ADDRESS[chainId ?? DEFAULT_CHAIN_ID],
  })
  const selectedCurrencyBalance = currencyBalance?.formatted

  const theme = useTheme()
  const decimals = currency?.tokenInfo?.decimals || 18
  const onChangeInput = (val: string) => {
    const floatingPart = val.split('.')[1]
    const inputDecimals = decimals
    if (floatingPart && inputDecimals < floatingPart.length) return
    onUserInput(val)
  }

  // Input validation
  const inputRules = [isPositive(), isLessThanOrEqualTo(selectedCurrencyBalance || '0', 'Exceeds wallet balance')]
  const { errors } = useInputValidation({
    rules: inputRules,
    validateOn: 'input',
    modelValue: value,
  })

  return (
    <InputPanel {...rest}>
      <NewContainer isError={!!errors.length}>
        <InputRow>
          <NumericalInput
            className="token-amount-input"
            data-testid="token-amount-input"
            value={value}
            onUserInput={onChangeInput}
          />
          <Flex alignItems="center" style={{ gap: 8 }}>
            {selectedCurrencyBalance ? (
              <StyledMaxButton onClick={onMax} variant="text">
                <Trans>Max</Trans>
              </StyledMaxButton>
            ) : null}
            <Aligner>
              <RowFixed
                style={{
                  border: '1px solid #E6E6FF',
                  padding: '5px 12px 5px 12px',
                  background: '#FFFFFF',
                  borderRadius: 6,
                }}
              >
                <AssetLogo currency={currency} />
                <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                  {formatCurrencySymbol({ currency })}
                </StyledTokenName>
              </RowFixed>
            </Aligner>
          </Flex>
        </InputRow>
        <FiatRow>
          <Box
            sx={{
              fontSize: '12px',
              color: '#FF8080',
              mt: 2,
            }}
          >
            {errors[0]}
          </Box>
          <RowEnd width="unset">
            {account ? (
              <BalanceWrap style={{ marginTop: '10px' }}>
                <TYPE.body
                  onClick={onMax}
                  color={theme.text11}
                  fontWeight={400}
                  fontSize={14}
                  style={{ display: 'inline', cursor: 'pointer' }}
                >
                  {currency && selectedCurrencyBalance ? (
                    <Trans>
                      Balance:
                      <span style={{ color: '#292933', fontWeight: 600, marginLeft: 4 }}>
                        {formatAmount(+selectedCurrencyBalance)}
                      </span>
                    </Trans>
                  ) : null}
                </TYPE.body>
              </BalanceWrap>
            ) : (
              <span />
            )}
          </RowEnd>
        </FiatRow>
      </NewContainer>
    </InputPanel>
  )
}

const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.config.background?.main || theme.bg21};
  width: initial;
`

const NewContainer = styled.div<{ isError: boolean }>`
  border-radius: 8px;
  border: 1px solid ${({ isError }) => (isError ? 'rgba(255, 128, 128, 0.50)' : '#e6e6ff')};
  background-color: ${({ theme }) => theme.config.background?.main || theme.bg1};
  padding: 14px 1rem;
`

const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: space-between;
  align-items: center;
`

const FiatRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-wrap: wrap;
  `};
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
  justify-content: space-between;
  gap: 16px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    gap: 0px;
  `};
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledTokenName: any = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '14px' : '14px')};
  color: ${({ theme }) => theme.text1};
`
const BalanceWrap = styled(RowFixed)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 17px;
  text-align: center;
`

const StyledMaxButton = styled(Button)`
  background-color: white !important;
`
