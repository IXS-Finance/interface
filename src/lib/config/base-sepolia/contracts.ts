import baseSepolia from 'assets/data/contracts/base-sepolia.json';
import { Contracts } from 'lib/config/types';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
  authorizer: baseSepolia.Authorizer,
  vault: baseSepolia.Vault,
  weightedPoolFactory: baseSepolia.WeightedPoolFactory,
  stablePoolFactory: baseSepolia.ComposableStablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: baseSepolia.BalancerHelpers,
  batchRelayer: baseSepolia.BalancerRelayer,
  gaugeFactory: '',
  balancerMinter: baseSepolia.BalancerMinter,
  gaugeController: baseSepolia.GaugeController,
  tokenAdmin: baseSepolia.BalancerTokenAdmin,
  veBAL: baseSepolia.VotingEscrow,
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: '',
};

export default contracts;
