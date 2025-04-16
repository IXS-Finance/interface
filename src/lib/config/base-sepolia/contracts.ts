import baseSepolia from 'assets/data/contracts/base-sepolia.json';
import { Contracts } from 'lib/config/types';

const contracts: Contracts = {
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
  authorizer: baseSepolia.Authorizer,
  vault: baseSepolia.Vault,
  weightedPoolFactory: baseSepolia.WeightedPoolFactory,
  voter: baseSepolia.Voter,
  veSugar: baseSepolia.VeSugar,
  votingEscrow: baseSepolia.VotingEscrow,
  rewardSugar: baseSepolia.RewardSugar,
};

export default contracts;
