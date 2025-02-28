// @ts-nocheck
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { uniqueId, sumBy } from 'lodash'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import TokenWeightInput from '../../../components/TokenWeightInput'
import BalProgressBar from '../../../components/ProgressBar'
import { Line } from '../..'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { PoolSeedToken } from '../../../../types'
import { useWeb3React } from 'hooks/useWeb3React'
import config from 'lib/config'
import { setTokensList } from 'state/dexV2/poolCreation'
import { useDispatch } from 'react-redux'
import BalAlert from '../../../components/BalAlert'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { Box, Flex } from 'rebass'
import BalCard from 'pages/DexV2/common/Card'
import BalStack from 'pages/DexV2/common/BalStack'
import { configService } from 'services/config/config.service'

const emptyTokenWeight: PoolSeedToken = {
  tokenAddress: '',
  weight: 0,
  id: '0',
  isLocked: false,
  amount: '0',
}

const ChooseWeights: React.FC = () => {
  const {
    hasUnlistedToken,
    seedTokens,
    tokensList,
    totalLiquidity,
    updateTokenWeights,
    updateTokenWeight,
    updateLockedWeight,
    updateTokenAddress,
    addTokenWeightToPool,
    proceed,
    removeTokenWeights,
    getPoolSymbol,
  } = usePoolCreation()
  const { account } = useWeb3React()
  const { openConnectModal } = useConnectModal()
  const dispatch = useDispatch()
  const { getToken } = useTokens()
  const { fNum } = useNumbers()
  const { isWalletReady } = useWeb3()

  const networkName = configService.network.name

  // Compute values directly on every render

  const maxTokenAmountReached = seedTokens.length >= 8

  const excludedTokens = [...tokensList]

  const validTokens = seedTokens.filter((t) => t.tokenAddress !== '')
  const zeroToken = validTokens.find((t) => t.weight === 0)
  const zeroWeightToken = zeroToken ? getToken(zeroToken.tokenAddress) : null

  const totalAllocatedWeight = sumBy(validTokens, 'weight').toFixed(2)
  const totalWeight = sumBy(seedTokens, 'weight').toFixed(2)

  const isProceedDisabled = (() => {
    if (!isWalletReady) return false
    if (Number(totalAllocatedWeight) !== 100) return true
    if (seedTokens.length < 2) return true
    if (zeroWeightToken) return true
    if (hasUnlistedToken && !isTestnet) return true
    return false
  })()

  const validTokensForAlert = seedTokens.filter((t) => t.tokenAddress !== '')
  const showLiquidityAlert = totalLiquidity.lt(20000) && validTokensForAlert.length >= 2

  const weightColor = Number(totalWeight) > 100 || Number(totalWeight) <= 0 ? { color: 'red' } : {}

  const walletLabel = !account ? 'Connect Wallet' : 'Next'

  const progressBarColor = () => {
    if (Number(totalAllocatedWeight) > 100 || Number(totalAllocatedWeight) <= 0) {
      return 'red'
    }
    return '#66F'
  }

  async function addTokenToPool() {
    addTokenWeightToPool({ ...emptyTokenWeight, id: uniqueId() } as PoolSeedToken)
  }

  function handleWeightChange(weight: string, id: number) {
    updateTokenWeight(id, Number(weight))
  }

  function handleLockedWeight(isLocked: boolean, id: number) {
    updateLockedWeight(id, isLocked)
  }

  async function handleRemoveToken(index: number) {
    removeTokenWeights(index)
  }

  function handleAddressChange(address: string, id: number) {
    updateTokenAddress(id, address)
  }

  function handleProceed() {
    if (!account) {
      openConnectModal && openConnectModal()
    } else {
      proceed()
    }
  }

  useEffect(() => {
    if (!seedTokens.length) {
      const newWeights: PoolSeedToken[] = [
        { ...emptyTokenWeight, id: uniqueId() } as PoolSeedToken,
        { ...emptyTokenWeight, id: uniqueId() } as PoolSeedToken,
      ]
      updateTokenWeights(newWeights)
    }
  }, [])

  useEffect(() => {
    dispatch(setTokensList(seedTokens.map((w) => w.tokenAddress)))
  }, [JSON.stringify(seedTokens)])

  return (
    <BalCard shadow="xl" noBorder>
      <BalStack vertical spacing="sm">
        <Box color="#b8b8d2" fontSize="14px" fontWeight={500}>
          {networkName}
        </Box>
        <Box color="rgba(41, 41, 51, 0.9)" fontSize="20px" fontWeight={600}>
          Choose tokens & weights
        </Box>
        {seedTokens.map((token, i) => (
          <TokenWeightInput
            key={`tokenweight-${token.id}`}
            weight={token.weight}
            address={token.tokenAddress}
            excludedTokens={excludedTokens}
            updateWeight={(data) => handleWeightChange(data, i)}
            updateLocked={(data) => handleLockedWeight(data, i)}
            deleteItem={() => handleRemoveToken(i)}
            updateAddress={(data) => handleAddressChange(data, i)}
          />
        ))}

        <AddTokenButton disabled={maxTokenAmountReached} onClick={addTokenToPool}>
          Add a Token
        </AddTokenButton>

        <Line />

        <WrapProgressBar>
          <TitleProgressBar>
            <LeftContentProgressBar>Total Allocated</LeftContentProgressBar>
            <RightContentProgressBar style={weightColor}>{totalAllocatedWeight}%</RightContentProgressBar>
          </TitleProgressBar>
          <BalProgressBar width={Number(totalAllocatedWeight)} color={progressBarColor()} />
        </WrapProgressBar>

        <Line />

        <Flex direction="column" gap="16px" mb="16px">
          {showLiquidityAlert && isWalletReady ? (
            <BalAlert
              title="It’s recommended to provide new pools with at least $20,000 in initial funds"
              type="warning"
            >
              {`Based on your wallet balances for these tokens, the maximum amount you can fund this pool with is ~${fNum(
                totalLiquidity.toString(),
                FNumFormats.fiat
              )}.`}
            </BalAlert>
          ) : null}

          {!!zeroWeightToken ? (
            <BalAlert title="You’ve included a token with zero weight" type="warning">
              {`All tokens in a pool must have a weighting greater than zero. Either remove or replace ${zeroWeightToken?.symbol} or set it above 0.01%.`}
            </BalAlert>
          ) : null}
        </Flex>

        {/* Uncomment the below if needed */}
        {/* {isPoolExisting ? <BalAlert title={`Pair ${getPoolSymbol()} already exists!`} type="warning" /> : null} */}

        <ButtonPrimary onClick={handleProceed} disabled={isProceedDisabled}>
          {walletLabel}
        </ButtonPrimary>
      </BalStack>
    </BalCard>
  )
}

export default ChooseWeights

const AddTokenButton = styled.button`
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  display: flex;
  height: 36px;
  padding: 8px 12px;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 16px;
  color: rgba(102, 102, 255, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
  line-height: 0;
  cursor: pointer;

  &:hover {
    background: #f6f6ff;
  }

  &:active {
    background: #f0f0ff;
  }

  &:disabled {
    color: #b8b8d2;
  }
`

const ButtonPrimary = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  color: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  border-radius: 8px;
  background: #66f;
  border: none;
  width: 100%;
  cursor: pointer;

  &:hover {
    transform: scale(0.99);
  }

  &:disabled {
    background: #ececfb;
  }
`

const LeftContentProgressBar = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const RightContentProgressBar = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

const TitleProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
`

const WrapProgressBar = styled.div`
  margin-bottom: 32px;
`
