import React from 'react'
import styled from 'styled-components'
import EthIcon from 'assets/images/dex-v2/eth.svg'
import PolIcon from 'assets/images/dex-v2/pol.svg'
import { ReactComponent as WalletIcon } from 'assets/images/dex-v2/wallet.svg'
import { ReactComponent as WarningIcon } from 'assets/images/dex-v2/warning.svg'
import { Flex } from 'rebass'
import Switch from '../components/Switch'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import TokenInput from '../components/TokenInput'
import { isGreaterThan } from 'lib/utils/validations'

interface SetPoolFeesProps {}

const InitialLiquidity: React.FC<SetPoolFeesProps> = () => {
  const { seedTokens, tokensList } = usePoolCreationState()

  const handleAmountChange = (tokenAddress: string, amount: string) => {
    console.log(tokenAddress, amount)
  }

  return (
    <div>
      {seedTokens.map((token, i) => {
        return (
          <TokenInput
            key={`tokenweight-${token.id}`}
            name={`initial-token-${token.tokenAddress}`}
            weight={token.weight}
            address={token.tokenAddress}
            amount={0}
            rules={[isGreaterThan(0)]}
            updateAmount={() => {}}
          />
        )
      })}

      <Flex alignItems="center" style={{ gap: 8 }} marginTop={16}>
        <Switch />
        <SwitchText>Auto optimize liquidity</SwitchText>
      </Flex>

      <SummaryContainer>
        <SummaryItem>
          <div>Total</div>
          <div>$0.00</div>
        </SummaryItem>

        <SummaryItem>
          <div>
            Available: $0.00 <Maxed>Maxed</Maxed>
          </div>
          <Optimized>Optimized</Optimized>
        </SummaryItem>
      </SummaryContainer>

      <NavigationButtons>
        <BackButton>Back</BackButton>
        <NextButton>Next</NextButton>
      </NavigationButtons>
    </div>
  )
}

export default InitialLiquidity

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

const TokenWrap = styled.div`
  display: flex;
  padding: 8px 12px 8px 8px;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
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
  max-width: 240px;
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
const NavigationButtons = styled.div`
  display: flex;
  margin-top: 16px;
  gap: 8px;
`

const BackButton = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  color: #66f;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  cursor: pointer;

  &:hover {
    background: #f0f0ff;
  }
`

const NextButton = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  border-radius: 8px;
  background: #66f;
  font-family: Inter;
  color: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  cursor: pointer;
  border: none;

  &:hover {
    background: #dcdcfb;
  }

  &:disabled {
    background: #ececfb;
  }
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

const SwitchText = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const SummaryContainer = styled.div`
  margin-top: 16px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  display: flex;
  padding: 16px;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
`

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const Optimized = styled.div`
  color: #66f;
`

const Maxed = styled.span`
  color: #b8b8d2;
`
