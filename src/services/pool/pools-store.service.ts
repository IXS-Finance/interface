import { setPoolState } from 'state/dexV2/pool'
import { Pool } from './types'
import store from 'state'

export interface IPoolsStoreService {
  pools: Pool[] | null
  setPools(pools: Pool[]): void
  findPool(id: string): Pool | void
}

export class PoolsStoreService implements IPoolsStoreService {
  public pools: Pool[] | null = store.getState()?.dexV2Pool?.pools

  public setPools(pools: Pool[]): void {
    store.dispatch(setPoolState({ pools }))
  }

  public addPools(pools: Pool[]): void {
    store.dispatch(setPoolState({ pools: [...(this.pools ?? []), ...pools] }))
  }

  public findPool(id: string): Pool | void {
    return this.pools?.find((pool) => pool.id === id)
  }
}

export const poolsStoreService = new PoolsStoreService()
