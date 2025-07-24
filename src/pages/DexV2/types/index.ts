export enum StepIds {
  ChooseWeights = 0,
  SetPoolFees = 1,
  SimilarPool = 2,
  InitialLiquidity = 3,
  ConfirmPoolCreation = 4,
}

export enum StepLabels {
  ChooseWeights = 'Tokens and weights',
  SetPoolFees = 'Set pool fees',
  SimilarPool = 'Similar pools',
  InitialLiquidity = 'Set initial liquidity',
  ConfirmPoolCreation = 'Confirm pool creation',
}

export type PoolSeedToken = {
  tokenAddress: string
  weight: number
  isLocked: boolean
  amount: string
  id: string
}

export type RuleFunction = (val: string | number) => string | boolean
export type Rules = Array<RuleFunction>

export enum StepState {
  Todo,
  Active,
  WalletOpen,
  Pending,
  Success,
  Warning,
  Error,
  Completed,
}

export type Step = {
  tooltip: string
  state: StepState
}

export type TransactionAction =
  | 'drip'
  | 'claim'
  | 'approve'
  | 'swap'
  | 'wrap'
  | 'unwrap'
  | 'invest'
  | 'withdraw'
  | 'createPool'
  | 'fundPool'
  | 'migratePool'
  | 'createLock'
  | 'extendLock'
  | 'increaseLock'
  | 'unlock'
  | 'voteForGauge'
  | 'unstake'
  | 'stake'
  | 'restake'
  | 'sync'
  | 'userGaugeCheckpoint'
  | 'claimSubmission'
