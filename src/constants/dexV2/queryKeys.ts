import { Network } from 'lib/config/types'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

import { SubgraphGauge } from 'services/dexV2/gauges/types'
import { NativeAsset, TokenInfo } from 'types/TokenList'
import { GaugeShare } from 'hooks/dex-v2/queries/useUserGaugeSharesQuery'
import { TokenPrices } from 'hooks/dex-v2//queries/useTokenPricesQuery'
import { MerkleOrchardVersion } from 'services/claim/claim.service'
import { PoolFilterOptions } from 'types/pools'
export const POOLS_ROOT_KEY = 'pools'
export const BALANCES_ROOT_KEY = 'accountBalances'
export const CLAIMS_ROOT_KEY = 'claims'
export const QUERY_EXIT_ROOT_KEY = [POOLS_ROOT_KEY, 'query', 'exit']
export const QUERY_JOIN_ROOT_KEY = [POOLS_ROOT_KEY, 'query', 'join']

const QUERY_KEYS = {
  Pools: {
    All: (networkId: Network, filterOptions: PoolFilterOptions) => [
      POOLS_ROOT_KEY,
      'all',
      {
        networkId,
        filterOptions,
      },
    ],
    PoolsHasGauge: (networkId: Network) => [
      POOLS_ROOT_KEY,
      'poolsHasGauge',
      {
        networkId,
      },
    ],
    VoteHistories: (networkId: Network) => [
      POOLS_ROOT_KEY,
      'voteHistories',
      {
        networkId,
      },
    ],
    User: (networkId: Network, account: string, gaugeAddresses: string[]) => [
      POOLS_ROOT_KEY,
      'user',
      { networkId, account, gaugeAddresses },
    ],
    Current: (id: string) => [POOLS_ROOT_KEY, 'current', { id }],
    APR: (networkId: Network, id: string) => [POOLS_ROOT_KEY, 'apr', { networkId, id }],
    Snapshot: (networkId: Network, id: string) => [POOLS_ROOT_KEY, 'snapshot', { networkId, id }],
    Activities: (networkId: Network, id: string) => [POOLS_ROOT_KEY, 'activities', 'all', { networkId, id }],
    UserActivities: (networkId: Network, id: string, account: string) => [
      POOLS_ROOT_KEY,
      'activities',
      'user',
      { networkId, account, id },
    ],
    Swaps: (networkId: Network, id: string, subgraphQuery: Record<string, any>) => [
      POOLS_ROOT_KEY,
      'swaps',
      { networkId, id, subgraphQuery },
    ],
    UserSwaps: (networkId: Network, id: string, account: string) => [
      POOLS_ROOT_KEY,
      'swaps',
      'user',
      { networkId, account, id },
    ],
    HistoricalPrices: (networkId: Network, id: string) => [POOLS_ROOT_KEY, 'historicalPrices', { networkId, id }],
    Joins: {
      QueryJoin: (amountsIn: unknown, isSingleAssetJoin: unknown) => [
        ...QUERY_JOIN_ROOT_KEY,
        {
          amountsIn,
          isSingleAssetJoin,
        },
      ],
    },
    Exits: {
      QueryExit: (
        account: string,
        bptIn: unknown,
        isSingleAssetExit: unknown,
        singleAmountOut: unknown,
        relayerSignature: string | undefined
      ) => [
        ...QUERY_EXIT_ROOT_KEY,
        {
          account,
          bptIn,
          isSingleAssetExit,
          singleAmountOut,
          relayerSignature,
        },
      ],
      SingleAssetMax: (bptBalance: string, isSingleAssetExit: unknown, singleAmountOut: unknown) => [
        POOLS_ROOT_KEY,
        'singleAssetMax',
        {
          bptBalance,
          isSingleAssetExit,
          singleAmountOut,
        },
      ],
    },
    Gauges: (poolAddresses: string[] | undefined) => ['pools', 'gauges', { poolAddresses }],
  },
  Pool: {
    Gauge: (poolId: string | undefined) => ['pool', 'gauge', { poolId }],
    Gauges: (poolIds: string[]) => ['pool', 'gauges', { poolIds }],
    Decorated: (poolId: string | undefined) => ['pool', 'decorated', { poolId }],
  },
  User: {
    Pool: {
      StakedShares: (userGaugeShares: GaugeShare[] | undefined, account: string) => [
        'user',
        'pool',
        'stakedShares',
        { userGaugeShares, account },
      ],
    },
    Vote: {
      VoteInfo: (account: string) => ['user', 'pool', 'VoteInfo', { account }],
    },
    Pools: (account: string) => ['user', 'pools', { account }],
    Gauges: (account: string, poolAddress: string | undefined) => ['user', 'gauges', { account, poolAddress }],
    Boosts: (account: string, userGaugeShares: undefined | GaugeShare[]) => [
      'user',
      'boosts',
      { account, userGaugeShares },
    ],
  },
  TokenLists: {
    All: (networkId: Network) => ['tokenLists', 'all', { networkId }],
  },
  Claims: {
    All: (networkId: Network, account: string, merkleOrchardVersion: MerkleOrchardVersion) => [
      CLAIMS_ROOT_KEY,
      { networkId, account, merkleOrchardVersion },
    ],
    Protocol: (networkId: Network, account: string) => [CLAIMS_ROOT_KEY, 'protocol', { networkId, account }],
    GaugePools: (poolIds: string[]) => [CLAIMS_ROOT_KEY, 'gaugePools', { poolIds }],
  },
  Tokens: {
    PairPriceData: (
      tokenInAddress: string,
      tokenOutAddress: string,
      activeTimespan: { option: string; value: number },
      userNetworkId: number,
      nativeAsset: NativeAsset,
      wrappedNativeAsset: TokenInfo
    ) => [
      'pairPriceData',
      {
        tokenInAddress,
        tokenOutAddress,
        activeTimespan,
        userNetworkId,
        nativeAsset,
        wrappedNativeAsset,
      },
    ],
    Prices: (networkId: Network, pricesToInject: TokenPrices) => ['tokens', 'prices', { networkId, pricesToInject }],
    AllPrices: ['tokens', 'prices'],
    VeBAL: (networkId: Network, account: string) => ['tokens', 'veBAL', { networkId, account }],
  },
  Account: {
    Balances: (networkId: Network, account: string, tokens: string[]) => [
      'account',
      'balances',
      { networkId, account, tokens },
    ],
    Allowances: (networkId: Network, account: string, contractAddresses: string[], tokens: string[]) => [
      'account',
      'allowances',
      { networkId, account, contractAddresses, tokens },
    ],
    RelayerApprovals: (networkId: Network, account: string, relayer: string) => [
      'account',
      'relayer',
      { networkId, account, relayer },
    ],
    Profile: (networkId: Network, account: string, chainId: number | undefined) => [
      'account',
      'profile',
      { networkId, account, chainId },
    ],
  },
  Gauges: {
    All: {
      Static: () => ['gauges', 'all', 'static'],
      Onchain: (gauges: SubgraphGauge[] | undefined, account: string, networkId: Network) => [
        'gauges',
        'all',
        'onchain',
        { gauges, account, networkId },
      ],
    },
    Expired: (gauges: string[] | undefined, networkId: Network) => ['gauges', 'expired', { gauges, networkId }],
    VotingEscrowLocks: (lockedAmount?: string) => ['votingEscrowLocks', lockedAmount],
    VotingEscrowLocksByNetworkId: (networkId: Network, account: string, providedUser: string | undefined) => [
      'votingEscrowLocksByNetworkId',
      { networkId, account, providedUser },
    ],
    OmniEscrowLocks: (networkId: Network, account: string) => ['omniEscrowLocks', { account, networkId }],
    Voting: (account: string) => ['gauges', 'voting', { account }],
  },
  PoolDayDatas: {
    All: {
      Static: () => ['pool', 'day', 'datas'],
    },
  },
  Transaction: {
    ConfirmationDate: (receipt: TransactionReceipt) => ['tx', 'confirmation', 'date', { receipt }],
  },
  Locks: {
    Historical: (networkId: Network, account: string) => ['historical-locks', { networkId, account }],
    UserRank: (networkId: Network, account: string) => ['user-rank', { networkId, account }],
  },
}

export default QUERY_KEYS
