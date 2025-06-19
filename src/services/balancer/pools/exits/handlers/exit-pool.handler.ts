import { Address, BalancerSDK } from '@ixswap1/dex-v2-sdk';
import { Pool } from 'services/pool/types';
import { TokenInfoMap } from 'types/TokenList';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { TransactionActionInfo } from 'types/transactions';

export type AmountsOut = Record<Address, string>;

export enum ExitType {
  GivenIn, // When BPT in is specified.
  GivenOut, // When an amount out is specified.
}

type AmountOut = {
  address: string;
  value: string;
  valid: boolean;
  max: string;
};

export type ExitParams = {
  exitType: ExitType;
  bptIn: string;
  amountsOut: AmountOut[];
  tokenInfo: TokenInfoMap;
  signer: any;
  slippageBsp: number;
  relayerSignature?: string;
  bptInValid: boolean;
  approvalActions: TransactionActionInfo[];
  transactionDeadline: number;
  toInternalBalance?: boolean;
};

export type QueryOutput = {
  priceImpact: number;
  amountsOut: AmountsOut;
  // Whether the transaction is ready to be sent.
  // In some cases queries may require approvals first before they can generate
  // the tx paylod. So in the UI we need a way to show a loading state until the tx is ready.
  txReady: boolean;
};

export abstract class ExitPoolHandler {
  constructor(
    public readonly pool: Pool,
    public readonly sdk: BalancerSDK
  ) {}

  abstract exit(params: ExitParams): Promise<TransactionResponse>;

  abstract queryExit(params: ExitParams): Promise<QueryOutput>;
}
