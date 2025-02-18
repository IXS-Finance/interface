import { EthereumTxType } from 'state/dexV2/userSettings'

export const ethereumTxTypeOptions = Object.values(EthereumTxType)
  .filter((v) => typeof v === 'string')
  .map((option) => ({
    label: option,
    value: option,
  }))
