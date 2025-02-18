import { useState, useCallback } from 'react';
import { TransactionReceipt } from '@ethersproject/abstract-provider';

export type TxState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  receipt?: TransactionReceipt;
};

export function useTxState() {
  const [txState, setTxState] = useState<TxState>({
    init: false,
    confirming: false,
    confirmed: false,
    confirmedAt: '',
  });

  // Derived state: true if any of the transaction flags are true.
  const txInProgress = txState.init || txState.confirming || txState.confirmed;

  const resetTxState = useCallback(() => {
    setTxState({
      init: false,
      confirming: false,
      confirmed: false,
      confirmedAt: '',
    });
  }, []);

  return { txState, txInProgress, resetTxState, setTxState };
}
