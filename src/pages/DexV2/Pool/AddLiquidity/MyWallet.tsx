import React, { FC } from 'react'
import { useParams } from 'react-router-dom'

import { useMyWallet } from './useMyWallet'
import BalCard from 'pages/DexV2/common/Card'
import { Box, Flex } from 'rebass'
import { useUserTokens } from 'state/dexV2/pool/useUserTokens'
import useNativeBalance from 'hooks/dex-v2/useNativeBalance'

const MyWallet: FC = () => {
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()

  const { handleMyWalletTokenClick, isLoadingPool, pool, excludedTokens } = useMyWallet(poolId)
  const {
    isLoadingBalances,
    tokensWithBalance,
    tokensWithBalanceFrom,
    tokensWithoutBalanceFrom,
    tokensWithBalanceNotIn,
  } = useUserTokens()
  const { hasNativeBalance, nativeBalance, nativeCurrency } = useNativeBalance()

  console.log('tokensWithBalance', tokensWithBalance)
  return (
    <div>
      <BalCard noPad shadow="none" growContent>
        <Flex flexDirection="column" css={{ height: '100%', width: '100%' }}>
          <Flex
            justifyContent={['flex-start', 'space-between']}
            px={3}
            pt={3}
            pb={[0, 3]}
            css={{ borderBottom: '1px solid #EAF0F6' }}
          >
            <Box css={{ fontSize: 16, fontWeight: 700 }}>My Wallet</Box>
          </Flex>
        </Flex>
      </BalCard>
    </div>
  )
}

export default MyWallet
