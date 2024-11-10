export enum StepIds {
  ChooseWeights = 0,
  SetPoolFees = 1,
  SetInitialLiquidity = 2,
  ConfirmPoolCreation = 3,
}

export enum StepLabels {
  ChooseWeights = 'Tokens and weights',
  SetPoolFees = 'Set pool fees',
  SetInitialLiquidity = 'Set initial liquidity',
  ConfirmPoolCreation = 'Confirm pool creation',
}

export type PoolSeedToken = {
  tokenAddress: string;
  weight: number;
  isLocked: boolean;
  amount: string;
  id: string;
};