import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Box, Flex } from 'rebass'
import { useDispatch } from 'react-redux'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

import { BackButton, Line, NavigationButtons, NextButton } from '../..'
import TokenInfo from '../../../components/TokenInfo'
import CreateActions from '../../../components/CreateActions'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { bnum, shortenLabel } from 'lib/utils'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { useWeb3React } from 'hooks/useWeb3React'
import BalCard from 'pages/DexV2/common/Card'
import BalStack from 'pages/DexV2/common/BalStack'
import { configService } from 'services/config/config.service'
import BalAlert from 'pages/DexV2/common/BalAlert'
import ConfirmationIndicator, { ButtonReturnPool } from 'pages/DexV2/common/ConfirmationIndicator'
import { useState } from 'react'

type CreateState = {
  confirmed: boolean
  confirmedAt: string
  isRestoredTxConfirmed: boolean
  isLoadingRestoredTx: boolean
  receipt?: any
}

const PreviewPool: React.FC = () => {
  const [createState, setCreateState] = useState<CreateState>({
    confirmed: false,
    confirmedAt: '',
    isRestoredTxConfirmed: false,
    isLoadingRestoredTx: false,
    receipt: undefined,
  })

  const { account } = useWeb3React()
  const {
    poolId,
    seedTokens,
    name: poolName,
    symbol: poolSymbol,
    initialFee,
    feeManagementType,
    feeController,
    thirdPartyFeeController,
    getAmounts,
    goBack,
    poolLiquidity,
    poolTypeString,
    sortSeedTokens,
  } = usePoolCreation()
  const { priceFor } = useTokens()
  const { fNum } = useNumbers()

  const redirectLabel: string = 'View pool'
  const returnRoute = { pathname: `/v2/pool/${poolId}`, search: '' }

  const tokenAddresses = seedTokens.map((token) => token.tokenAddress)

  const tokensAmounts = getAmounts()

  const hasMissingPoolNameOrSymbol = poolSymbol === '' || poolName === ''

  const actionsDisabled = hasMissingPoolNameOrSymbol

  const initialWeights: Record<string, BigNumber> = (() => {
    const _initialWeights: Record<string, BigNumber> = {}
    for (const seedToken of seedTokens) {
      _initialWeights[seedToken.tokenAddress] = bnum(seedToken.amount)
        .times(priceFor(seedToken.tokenAddress))
        .div(poolLiquidity)
    }
    return _initialWeights
  })()

  const hasInvalidInitialWeight = Object.values(initialWeights).some((initialWeight) => initialWeight.lt(0.01))

  function handleSuccess(tx: TransactionReceipt, confirmedAt: string): void {
    setCreateState((prev) => ({
      ...prev,
      confirmed: true,
      receipt: tx,
      confirmedAt: confirmedAt,
    }))
  }

  function getSwapFeeManager() {
    if (feeManagementType === 'governance') {
      return 'Balancer governance'
    } else {
      if (feeController === 'self') {
        return `My Ethereum wallet: ${shortenLabel(account || '')}`
      } else {
        return shortenLabel(thirdPartyFeeController)
      }
    }
  }

  useEffect(() => {
    sortSeedTokens()
  }, [])

  return (
    <BalCard shadow="xl" noBorder>
      <BalStack vertical spacing="sm">
        <Box color="rgba(41, 41, 51, 0.9)" fontSize="20px" fontWeight={600}>
          Confirm pool creation
        </Box>
        <SubTitle>Tokens and initial seed liquidity</SubTitle>
        <Line />

        {seedTokens.length > 0 ? (
          <div>
            {seedTokens.map((token, i) => {
              return (
                <TokenInfo
                  key={`token-${i}`}
                  address={token?.tokenAddress}
                  initialWeights={initialWeights}
                  token={token}
                />
              )
            })}
          </div>
        ) : null}

        <Flex justifyContent="space-between">
          <Total>Total</Total>
          <Total>{fNum(poolLiquidity.toString(), FNumFormats.fiat)}</Total>
        </Flex>

        <SummaryContainer>
          <SummaryTitle>Summary</SummaryTitle>
          <Flex justifyContent="space-between" width="100%">
            <SummaryKey>Pool name</SummaryKey>
            <SummaryValue>{poolName}</SummaryValue>
          </Flex>
          <Flex justifyContent="space-between" width="100%">
            <SummaryKey>Pool symbol</SummaryKey>
            <SummaryValue>{poolSymbol}</SummaryValue>
          </Flex>
          <Flex justifyContent="space-between" width="100%">
            <SummaryKey>Pool type</SummaryKey>
            <SummaryValue>{poolTypeString}</SummaryValue>
          </Flex>
          <Flex justifyContent="space-between" width="100%">
            <SummaryKey>Swap fee</SummaryKey>
            <SummaryValue>{fNum(initialFee, FNumFormats.percent)}</SummaryValue>
          </Flex>
          <Flex justifyContent="space-between" width="100%">
            <SummaryKey>Swap fee manager</SummaryKey>
            <SummaryValue>{getSwapFeeManager()}</SummaryValue>
          </Flex>
        </SummaryContainer>

        {hasMissingPoolNameOrSymbol ? (
          <BalAlert title="Missing pool name or symbol" type="warning">
            There is a missing pool name or symbol, fill it in before creating the pool.
          </BalAlert>
        ) : null}

        {hasInvalidInitialWeight ? (
          <BalAlert title="Invalid initial weight" type="warning">
            One or more tokens has an initial weight less than 1% which may cause funding to fail. If the token has a
            missing price, enter in a price. Otherwise, adjust the initial balances in the previous step.
          </BalAlert>
        ) : null}

        {/* <BalAlert title="Invalid initial weight" type="warning">
        Your ETH/WETH balance may not be sufficient for seed this pool and may cause pool funding to fail. You can
        adjust whether you use ETH or WETH for seed liquidity in the previous step.
      </BalAlert> */}

        {!createState.confirmed || !createState.receipt ? (
          <CreateActions
            tokenAddresses={tokenAddresses}
            amounts={tokensAmounts}
            createDisabled={actionsDisabled}
            goBack={() => goBack()}
            success={handleSuccess}
          />
        ) : (
          <div>
            <ConfirmationIndicator txReceipt={createState?.receipt} />
            <ButtonReturnPool to={`${returnRoute.pathname}${returnRoute.search}`}>{redirectLabel}</ButtonReturnPool>
          </div>
        )}
      </BalStack>
    </BalCard>
  )
}

export default PreviewPool

const SubTitle = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  margin-top: 16px;
`

const Total = styled.div`
  color: rgba(41, 41, 51, 0.9);
  text-align: center;
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.45px;
`

const SummaryContainer = styled.div`
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  display: flex;
  padding: 16px;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
  margin-top: 32px;
  margin-bottom: 16px;
`

const SummaryTitle = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 200%; /* 28px */
  letter-spacing: -0.28px;
`

const SummaryKey = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const SummaryValue = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const AlertWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
