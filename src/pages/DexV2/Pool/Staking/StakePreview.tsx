import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { tokensListExclBpt } from 'hooks/dex-v2/usePoolHelpers'
import { AnyPool } from 'services/pool/types'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { LpToken, StakeAction, useStakePreview } from './hooks/useStakePreview'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import AssetSet from 'pages/DexV2/common/AssetSet'
import ActionSteps from './ActionSteps'
import { Box, Flex } from 'rebass'
import BalCard from 'pages/DexV2/common/Card'
import { bnum } from 'lib/utils'
import { Address } from 'viem'
import { LP_DECIMALS } from './constants'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

const FIXED_OPTIONS = ['0.25', '0.5', '0.75', '1']

export type StakePreviewPoolProps = Pick<AnyPool, 'totalLiquidity' | 'totalShares' | 'address' | 'tokensList' | 'name'>

type Props = {
  pool: StakePreviewPoolProps
  lpToken: LpToken
  gaugeAddress: Address
  currentShares: string
  action: StakeAction
  onClose: () => void
  onSuccess: () => void
  unstakeBalance: bigint
  stakedBalance: bigint
}

const StakePreview: React.FC<Props> = ({
  pool,
  lpToken,
  gaugeAddress,
  currentShares,
  action,
  onClose,
  onSuccess,
  stakedBalance,
  unstakeBalance,
}) => {
  const { fNum } = useNumbers()
  const { isMismatchedNetwork } = useWeb3()

  const { isActionConfirmed, isLoading, isStakeAndZero } = useStakePreview({
    currentShares,
    pool,
    lpToken,
    action,
    onClose,
    onSuccess,
  })

  const [amountPercent, setAmountPercent] = useState<string>('0.5')

  const amountToSubmit = useMemo((): BigNumber => {
    const balance = action === 'stake' ? unstakeBalance : stakedBalance
    const amountPercentPrecision = 18
    const scaledFloat = BigInt(Math.round(+amountPercent * 10 ** amountPercentPrecision)) // 0.5 * 10^18
    return BigNumber.from((balance * scaledFloat) / BigInt(10 ** amountPercentPrecision))
  }, [action, unstakeBalance, stakedBalance, amountPercent])

  const options: any[] = FIXED_OPTIONS.map((option) => ({
    label: fNum(option, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      fixedFormat: true,
    }),
    value: option,
  }))

  const fiatValueOfStakedShares = bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times(amountToSubmit.toString())
    .div(10 ** LP_DECIMALS)
    .toString()

  const assetRowWidth = (tokensListExclBpt(pool).length * 32) / 1.5

  return (
    <Box>
      <Flex
        p="32px"
        bg="#F5F5FF"
        flexDirection="column"
        css={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', gap: '16px' }}
      >
        <Title>{action} LP tokens</Title>

        <BalCard shadow="none" noBorder className="p-4">
          <Flex alignItems="center" css={{ gap: '8px' }}>
            <AssetSet addresses={tokensListExclBpt(pool)} width={assetRowWidth} size={24} />

            <Box fontSize="14px" fontWeight={500}>
              {pool.name}
            </Box>
          </Flex>
        </BalCard>
      </Flex>

      <Box p="32px">
        <Flex flexDirection="column" p="24px" css={{ gap: '24px', borderRadius: '8px', fontSize: '14px' }} bg="#F7F7FA">
          <Flex justifyContent="space-between" alignItems="center">
            <Flex flexDirection="column" css={{ gap: '4px' }} alignItems="flex-start">
              <Box color="#B8B8D2" fontWeight={500}>
                {action === 'stake' ? 'Amount to Stake' : 'Amount to Unstake'}
              </Box>
              <Box fontSize="20px" fontWeight={600}>
                {fNum(formatUnits(amountToSubmit, LP_DECIMALS), FNumFormats.token)} LP
              </Box>
              <Box color="#B8B8D2" fontWeight={500}>
                {fNum(fiatValueOfStakedShares, FNumFormats.fiat)}
              </Box>
            </Flex>
            <Flex flexDirection="column" css={{ gap: '4px' }} alignItems="flex-end">
              <Box color="#B8B8D2" fontWeight={500} css={{ textTransform: 'capitalize' }}>
                {action} percentage
              </Box>
              <Box fontSize="20px" fontWeight={600}>
                {fNum(amountPercent, {
                  style: 'percent',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  fixedFormat: true,
                })}
              </Box>
            </Flex>
          </Flex>

          <Flex alignSelf="stretch" css={{ gap: '8px', width: '100%' }}>
            {options.map((option) => {
              const isSelected = amountPercent === option.value
              return (
                <PercentButton key={option.value} active={isSelected} onClick={() => setAmountPercent(option.value)}>
                  {option.label}
                </PercentButton>
              )
            })}
          </Flex>

          <Line />

          <Flex alignSelf="stretch" css={{ gap: '16px', width: '100%' }}>
            <Flex
              flexDirection="column"
              bg="#fff"
              p="16px"
              css={{
                border: '1px solid #E6E6FF',
                borderRadius: '8px',
                flex: '1 0 0',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              <Box color="#B8B8D2">APR</Box>
              <Box>34.5%</Box>
            </Flex>
            <Flex
              flexDirection="column"
              bg="#fff"
              p="16px"
              css={{
                border: '1px solid #E6E6FF',
                borderRadius: '8px',
                flex: '1 0 0',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              <Box color="#B8B8D2">Total Staked</Box>
              <Box>{fNum(formatUnits(stakedBalance, LP_DECIMALS), FNumFormats.token)} LP</Box>
            </Flex>
          </Flex>
        </Flex>

        {!isActionConfirmed && (
          <ActionSteps
            pool={pool}
            lpToken={lpToken}
            currentShares={currentShares}
            gaugeAddress={gaugeAddress}
            amountToSubmit={amountToSubmit}
            primaryActionType={action}
            isLoading={isLoading}
            disabled={isStakeAndZero || !!isMismatchedNetwork}
            onClose={onClose}
            // onSuccess={handleSuccess}
            // onFailed={() => {}}
          />
        )}
      </Box>

      {/* {isActionConfirmed && confirmationReceipt && (
        <VStack spacing="sm">
          <ConfirmationIndicator txReceipt={confirmationReceipt} />
          {action === 'stake' ? (
            <Button variant="gradient" block onClick={() => history.push('/claim')}>
              {t('viewClaims')}
            </Button>
          ) : (
            <Button variant="gray" outlined block onClick={handleClose}>
              {t('close')}
            </Button>
          )}
        </VStack>
      )}

      {(isActionConfirming || isActionConfirmed) && <FeedbackCard />} */}
    </Box>
  )
}

export default StakePreview

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
  text-transform: capitalize;
`

const PercentButton = styled.button<{ active?: boolean }>`
  border: ${(props) => (props.active ? '1px solid rgba(102, 102, 255, 0.30)' : '1px solid #E6E6FF')};
  border-radius: 8px;
  color: ${(props) => (props.active ? 'rgba(102, 102, 255, 0.90)' : 'rgba(41, 41, 51, 0.90)')};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  padding: 8px 10px;
  align-items: center;
  background: #fff;
  flex: 1 0 0;
  cursor: pointer;
`

const Line = styled.div`
  border-top: solid 1px #e6e6ff;
`
