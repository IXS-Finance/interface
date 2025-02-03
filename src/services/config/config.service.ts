import { getChainId } from '@wagmi/core'

import { Config } from 'lib/config/types';
import configs from 'lib/config';
import { Network } from 'lib/config/types';
import template from 'lib/utils/template';
import { wagmiConfig } from 'components/Web3Provider';

interface Env {
  APP_ENV: string;
  APP_DOMAIN: string;
  APP_HOST: string;
  API_URL: string;
  IPFS_NODE: string;
  BLOCKNATIVE_DAPP_ID: string;
  ALCHEMY_KEY: string;
  GRAPH_KEY: string;
  INFURA_PROJECT_ID: string;
  ENABLE_STABLE_POOLS: boolean;
  WALLET_SCREENING: boolean;
}
const networkId = getChainId(wagmiConfig)
console.log('networkId', networkId)

export default class ConfigService {
  public get env(): Env {
    return {
      APP_ENV: process.env.REACT_APP_ENV || 'development',
      APP_DOMAIN: process.env.REACT_APP_DOMAIN || 'app.balancer.fi',
      APP_HOST: process.env.REACT_APP_HOST || 'balancer.fi',
      API_URL:
        process.env.REACT_APP_API_URL || 'https://api-v3.balancer.fi/graphql',
      IPFS_NODE: process.env.REACT_APP_IPFS_NODE || 'cloudflare-ipfs.com',
      BLOCKNATIVE_DAPP_ID:
        process.env.REACT_APP_BLOCKNATIVE_DAPP_ID || 'MISSING_KEY',
      ALCHEMY_KEY:
        process.env.REACT_APP_ALCHEMY_KEY ||
        this.getNetworkConfig(networkId).keys.alchemy ||
        'MISSING_KEY',
      GRAPH_KEY:
        process.env.REACT_APP_ENV === 'development'
          ? process.env.REACT_APP_GRAPH_KEY_DEV || 'MISSING_KEY'
          : process.env.REACT_APP_GRAPH_KEY ||
            this.getNetworkConfig(networkId).keys.graph ||
            'MISSING_KEY',
      INFURA_PROJECT_ID:
        process.env.REACT_APP_INFURA_PROJECT_ID ||
        this.getNetworkConfig(networkId).keys.infura ||
        'MISSING_KEY',
      ENABLE_STABLE_POOLS: process.env.REACT_APP_ENABLE_STABLE_POOLS === 'true',
      WALLET_SCREENING: process.env.REACT_APP_WALLET_SCREENING === 'true',
    };
  }

  public get isDevEnv(): boolean {
    return this.env.APP_ENV === 'development';
  }

  public get network(): Config {
    return configs[networkId];
  }

  public getNetworkConfig(key: Network): Config {
    if (!Object.keys(configs).includes(key?.toString()))
      throw new Error(`No config for network key: ${key}`);
    return configs[key];
  }

  public getNetworkRpc(network: Network): string {
    console.log('network', network)
    const networkConfig = this.getNetworkConfig(network);

    return template(
      process.env[`REACT_APP_RPC_URL_${network}`] || networkConfig.rpc,
      {
        INFURA_KEY: networkConfig.keys.infura,
        ALCHEMY_KEY: networkConfig.keys.alchemy,
      }
    );
  }

  public get rpc(): string {
    return template(
      process.env[`REACT_APP_RPC_URL_${networkId}`] ||
        this.getNetworkConfig(networkId).rpc,
      {
        INFURA_KEY: this.env.INFURA_PROJECT_ID,
        ALCHEMY_KEY: this.env.ALCHEMY_KEY,
      }
    );
  }

  public get subgraphUrls(): string[] | void {
    return this.network.subgraphs.main?.map(url => {
      if (url.includes('GRAPH_KEY')) {
        return template(url, {
          GRAPH_KEY: this.env.GRAPH_KEY,
        });
      }
      return url;
    });
  }

  public get ws(): string {
    return template(this.network.ws, {
      INFURA_KEY: this.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.env.ALCHEMY_KEY,
    });
  }
}

export const configService = new ConfigService();
