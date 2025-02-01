import { getChainId } from '@wagmi/core';
import { wagmiConfig } from 'components/Web3Provider';
import { Network } from 'lib/config/types';
import { configService } from 'services/config/config.service';

const chainId = getChainId(wagmiConfig);
export const networkId = chainId as Network;

export const isPolygon =  networkId === Network.POLYGON;

export default function useNetwork() {
  const appNetworkConfig = configService.network;



  return {
    // appUrl,
    networkId,
    // networkConfig,
    // networkSlug,
    // getNetworkSlug,
    // getSubdomain,
    // handleNetworkSlug,
    appNetworkConfig,
  };
}