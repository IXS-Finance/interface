import { VeSugar } from 'services/balancer/contracts/ve-sugar'
import { LockedData } from 'services/balancer/contracts/ve-sugar'

export class LockService {
  constructor(private readonly veSugar: VeSugar) {}

  async getLockRewards(address: string): Promise<LockedData[]> {
    return this.veSugar.byAccount(address)
  }

  async getLockDetail(id: string): Promise<LockedData> {
    return this.veSugar.byId(id)
  }
}