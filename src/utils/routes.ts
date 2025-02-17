import { Currency } from '@ixswap1/sdk-core'

import { currencyId } from './currencyId'

export const routes = {
  add: (currency0: Currency, currency1: Currency) => `/add/${currencyId(currency0)}/${currencyId(currency1)}`,
  remove: (currency0: Currency, currency1: Currency) => `/remove/${currencyId(currency0)}/${currencyId(currency1)}`,
  find: '/find',
  pool: '/pool',
  swap: '/swap',
  swapOutputCurrency: '/swap/:outputCurrency',
  addCurrency: '/add/:currencyIdA?/:currencyIdB?',
  removeCurrency: '/remove/:currencyIdA/:currencyIdB',
  send: '/send',
  faucet: '/faucet',
  kyc: '/kyc',
  kycIndividual: '/kyc/individual',
  kycIndividualV2: '/kyc/individual/v2',
  kycCorporate: '/kyc/corporate',
  createPayoutEvent: '/payout/create/claim',
  createAirdropEvent: '/payout/create/airdrop',
  editPayoutEvent: (id?: number) => `/payout/edit/${`${id || ':id?'}`}`,
  securityTokens: (tab?: string) => `/security-tokens/${tab || ':tab'}`,
  securityToken: (id?: number) => `/security-token/${id || ':currencyId'}`,
  staking: '/staking',
  vesting: '/vesting',
  nftList: '/nft',
  nftCreate: '/nft-create',
  nftCollections: '/nft/collections',
  nftCollectionCreate: '/nft/collections/create',
  nftEditCollection: (id: number) => `/nft/${id}/edit`,
  nftEditCollectionPath: `/nft/:id/edit`,
  nftCollectionImport: `/nft/collections/import`,
  nftViewCollectionPath: `/nft/collections/:collectionAddress`,
  nftViewCollection: (address: string) => `/nft/collections/${address}`,
  nftItemPath: `/nft/collections/:collectionAddress/:itemId`,
  nftItem: (address: string, id: number) => `/nft/collections/${address}/${id}`,
  payoutItem: (id?: number) => `/payout/${id || ':payoutId'}`,
  payoutItemManager: (id?: number) => `/payout/${id || ':payoutId'}/manager`,
  tokenManager: (tab?: string, id?: number | null) =>
    `/token-manager/${tab || ':tab'}${id !== null ? `/${id || ':id?'}` : ''}`,
  admin: (tab?: string, id?: number | null) => `/admin/${tab || ':tab'}${id !== null ? `/${id || ':id?'}` : ''}`,
  adminDashboard: '/admin',
  payoutHistory: '/token-manager/payout-history',
  payoutEvent: '/token-manager/payout-events',
  userPayoutEvents: '/security-tokens/payout-events',
  manageTokens: '/token-manager/my-tokens',
  launchpad: '/launchpad',
  offerPage: '/offers/:offerId',
  issuance: '/issuance',
  issuanceCreate: '/issuance/create',
  createVetting: '/issuance/create/vetting',
  viewVetting: '/issuance/view/vetting',
  createOffer: '/issuance/create/information',
  editOffer: '/issuance/edit/information',
  reviewOffer: '/issuance/review/information',
  issuanceReport: `/issuance/extract/:issuanceId`,
  manageOffer: `/issuance/manage/:issuanceId`,
  newAdmin: '/admin/accreditation',
  lbpDashboard: '/lbp-admin',
  lbpEdit: '/lbp-admin/edit',
  lbpCreate: '/lbp-admin/create',
  publicDetails: '/lbp/:id',
  adminDetails: '/lbp-admin/detail/:id',
  defaultRoute: '/kyc',

  //admin urls

  adminAccreditation: '/admin/accreditation',
  adminKYC: '/admin/kyc',
  adminKYCID: '/admin/kyc/:kycId',
  adminTransactions: 'admin/transactions',
  adminCatalog: '/admin/security-catalog',
  adminUsers: '/admin/users-list',
  tenant: '/tenant',
  tenantCreate: '/tenant/create',
  tenantClone: '/tenant/clone',
  tenantEdit: '/tenant/edit/:id',

  // Dex V2
  dexV2CreatePool: '/dex-v2/pool/create',
  dexV2Pools: '/dex-v2/pools',
  dexV2Swap: '/dex-v2/swap',
  dexV2Lock: '/dex-v2/lock',
  dexV2PoolDetail: '/dex-v2/pool/:id',
  dexV2PoolAddLiquidity: '/dex-v2/pool/:id/add-liquidity',
  dexV2PoolWithdraw: '/dex-v2/pool/:id/withdraw',
}

export function checkAllowed(path: string, allowedPages: string[] | null | undefined): boolean {
  if (!allowedPages || allowedPages.length === 0) {
    return true
  }

  return allowedPages.includes(path)
}
