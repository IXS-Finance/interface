import { Pool } from './types';

export interface IPoolsStoreService {
  pools: Pool[] | null;
  setPools(pools: Pool[]): void;
  findPool(id: string): Pool | void;
}

export class PoolsStoreService implements IPoolsStoreService {
  public pools: Pool[] | null = null;

  public setPools(pools: Pool[]): void {
    this.pools = pools;
  }

  public addPools(pools: Pool[]): void {
    this.pools = [...(this.pools ?? []), ...pools];
  }

  public findPool(id: string): Pool | void {
    return this.pools?.find(pool => pool.id === id);
  }
}

export const poolsStoreService = new PoolsStoreService();
