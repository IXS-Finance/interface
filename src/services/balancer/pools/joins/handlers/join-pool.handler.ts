import { Pool } from 'services/pool/types';
import { TokenInfoMap } from 'types/TokenList';
import { TransactionActionInfo } from 'types/transactions';
import { BalancerSDK } from '@ixswap1/dex-v2-sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { AmountIn } from 'state/dexV2/pool/useJoinPool';

export type JoinParams = {
  amountsIn: AmountIn[];
  tokensIn: TokenInfoMap;
  signer: any;
  slippageBsp: number;
  relayerSignature?: string;
  approvalActions: TransactionActionInfo[];
  transactionDeadline: number;
};

export type QueryOutput = {
  bptOut: string;
  priceImpact: number;
};

export abstract class JoinPoolHandler {
  constructor(
    public readonly pool: Pool,
    public readonly sdk: BalancerSDK
  ) {}

  abstract join(params: JoinParams): Promise<TransactionResponse>;

  abstract queryJoin(params: JoinParams): Promise<QueryOutput>;
}
