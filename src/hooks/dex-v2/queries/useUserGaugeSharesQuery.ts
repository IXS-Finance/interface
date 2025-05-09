import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import QUERY_KEYS from 'constants/dexV2/queryKeys';
import { subgraphRequest } from 'lib/utils/subgraph';
import { configService } from 'services/config/config.service';
import useWeb3 from '../useWeb3';

/**
 * TYPES
 */
export type GaugeShare = {
  balance: string;
  gauge: {
    id: string;
    poolAddress: string;
    poolId: string;
    totalSupply: string;
    isPreferentialGauge: boolean;
    isKilled: boolean;
  };
};

export type UserGaugeShares = {
  __name: 'GaugeShares';
  gaugeShares: GaugeShare[];
};
type QueryOptions = UseQueryOptions<GaugeShare[]>;

/**
 * useUserGaugeSharesQuery
 *
 * Fetches all gaugeShares for the current user or for a specific pool if
 * poolAddress is provided.
 *
 * @param {string} poolAddress - Pool to fetch gaugeShares for.
 * @param {QueryOptions} options - useQuery options.
 * @returns {GaugeShare[]} An array of user gauge shares.
 */
export default function useUserGaugeSharesQuery(
  poolAddress?: string,
  options?: QueryOptions,
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.User.Gauges(account, poolAddress)

  /**
   * COMPUTED
   */
  if (!options) options = {} as QueryOptions
  options.enabled = !!configService.network.subgraphs.gauge && isWalletReady
  options.refetchOnWindowFocus = false

  const queryArgs = () => {
    if (poolAddress)
      return {
        where: {
          user: account.toLowerCase(),
          balance_gt: '0',
          gauge_: { pool: poolAddress.toLowerCase() },
        },
      };

    return { where: { user: account.toLowerCase(), balance_gt: '0' } };
  };

  const subgraphQuery = {
    __name: 'GaugeShares',
    gaugeShares: {
      __args: queryArgs(),
      balance: true,
      gauge: {
        id: true,
        poolAddress: true,
        poolId: true,
        totalSupply: true,
        isPreferentialGauge: true,
        isKilled: true,
      },
    },
  }

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      const { gaugeShares } = await subgraphRequest<UserGaugeShares>({
        url: configService.network.subgraphs.gauge,
        query: subgraphQuery,
      });

      return gaugeShares;
    } catch (error) {
      console.error('Failed to fetch pool gauges user', {
        cause: error,
      });
      throw error;
    }
  };

  /**
   * QUERY OPTIONS
   */
  return useQuery<GaugeShare[]>({
    ...options,
    queryKey,
    queryFn,
  });
}
