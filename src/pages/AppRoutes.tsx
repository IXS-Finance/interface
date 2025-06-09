import React, { lazy } from 'react'
import { Redirect } from 'react-router-dom'

import { routes } from 'utils/routes'

import Faucet from 'pages/Faucet'
import PoolFinder from 'pages/PoolFinder'
import ProductDetail from 'pages/Earn/ProductDetail'
import Earn from 'pages/Earn'

import { StakingTab } from 'pages/Farming/StakingTab'
import { VestingTab } from 'pages/Farming/VestingTab'

import { RedirectPathToSwapOnly, RedirectToSwap } from 'pages/Swap/redirects'
import { RedirectDuplicateTokenIdsV2 } from 'pages/AddLiquidityV2/redirects'
import { ROLES } from 'constants/roles'
import AdminAccreditationTable from 'components/AdminAccreditationTable'
import { UsersList } from 'components/UsersList'
import AdminSecurityCatalog from 'components/AdminSecurityCatalog'
import AdminTransactionsTable from 'components/AdminTransactionsTable'
import { AdminKycTable } from 'components/AdminKyc'
import { KycReviewModal } from 'components/KycReviewModal'
import LBPForm from './LBP/LbpForm'
import LbpDashboardPage from './LBP/Dashboard'
import AdminLbpDetail from './LBP/AdminLbpDetail'

const Admin = lazy(() => import('pages/Admin'))
const Swap = lazy(() => import('pages/Swap'))
const PoolV2 = lazy(() => import('pages/Pool/v2'))
const RemoveLiquidity = lazy(() => import('pages/RemoveLiquidity'))
const SecTokenDetails = lazy(() => import('pages/SecTokenDetails'))

const KYC = lazy(() => import('pages/KYC'))
const Maintenance = lazy(() => import('pages/Maintenance'))
const IndividualKYC = lazy(() => import('pages/KYC/IndividualKycForm'))
const IndividualKYCV2 = lazy(() => import('pages/KYC/IndividualKycFormV2'))
const CorporateKYC = lazy(() => import('pages/KYC/CorporateKycForm'))

const SecurityTokens = lazy(() => import('pages/SecurityTokens'))

const ListNFT = lazy(() => import('pages/ListNFT'))
const CreateNFT = lazy(() => import('pages/CreateNFT'))
const NftImport = lazy(() => import('pages/NftImport'))
const NFTCollection = lazy(() => import('pages/NFTCollection'))
const NFTCollections = lazy(() => import('pages/NFTCollections'))
const UpdateCollection = lazy(() => import('pages/UpdateCollection'))
const CreateCollection = lazy(() => import('pages/CreateCollection'))
const NftAssetPage = lazy(() => import('pages/NFTAsset'))
const TokenManager = lazy(() => import('pages/TokenManager'))
const CreatePayoutEvent = lazy(() => import('pages/CreatePayoutEvent'))
const CreateAirdropEvent = lazy(() => import('pages/CreateAirdropPayoutEvent'))
const EditPayoutEvent = lazy(() => import('pages/CreatePayoutEvent/EditPayoutEvent'))
const PayoutItem = lazy(() => import('pages/PayoutItem'))
const PayoutItemManager = lazy(() => import('pages/PayoutItem/PayoutItemManager'))

const Launchpad = lazy(() => import('pages/Launchpad'))
const LaunchpadOffer = lazy(() => import('pages/LaunchpadOffer'))

const LaunchpadIssuanceDashboard = lazy(() => import('pages/LaunchpadIssuance/Dashboard'))
const LaunchpadIssuanceForm = lazy(() => import('pages/LaunchpadIssuance/Form'))
const LaunchpadIssuanceVettingForm = lazy(() => import('pages/LaunchpadIssuance/VettingForm'))
const LaunchpadIssuanceVettingFormView = lazy(() => import('pages/LaunchpadIssuance/VettingFormView'))
const LaunchpadIssuanceInformationForm = lazy(() => import('pages/LaunchpadIssuance/InformationForm'))
const LaunchpadIssuanceInformationEditForm = lazy(() => import('pages/LaunchpadIssuance/InformationEditForm'))
const LaunchpadIssuanceInformationReview = lazy(() => import('pages/LaunchpadIssuance/InformationReview'))
const ManageOffer = lazy(() => import('pages/LaunchpadIssuance/ManageOffer'))
const LaunchpadIssuanceReport = lazy(() => import('pages/LaunchpadIssuance/Report'))
const LBPPublicDetailsPage = lazy(() => import('./LBP/PublicDetails'))
const TenantPage = lazy(() => import('./Tenant'))
const CreateTenantPage = lazy(() => import('./Tenant/TenantForm'))

export interface RouteMapEntry {
  path: string
  render?: () => JSX.Element
  component?: React.ComponentType<any>

  conditions?: {
    chainId?: number
    chainIsSupported?: boolean
    rolesSupported?: ROLES[]
    isWhitelisted?: boolean
    kycFormAccess?: string
    isKycApproved?: boolean
  }
}
const onlyOfferManager = {
  conditions: {
    rolesSupported: [ROLES.OFFER_MANAGER, ROLES.ADMIN, ROLES.MASTER_TENANT],
    isKycApproved: true,
  },
}
export const routeConfigs: RouteMapEntry[] = [
  { path: '/admin', render: () => <Redirect to={routes.admin('accreditation', null)} /> },
  { path: routes.admin(), component: Admin },

  {
    path: routes.nftCreate,
    component: CreateNFT,
    conditions: { isWhitelisted: true },
  },

  /* Earn routes */
  { path: routes.earn, component: Earn },
  { path: routes.earnProduct(), component: ProductDetail },

  /* LBP routes */
  { path: routes.lbpEdit, component: LBPForm },
  { path: routes.lbpCreate, component: LBPForm },
  { path: routes.lbpDashboard, component: LbpDashboardPage, conditions: { isKycApproved: true } },
  { path: routes.publicDetails, component: LBPPublicDetailsPage },
  { path: routes.adminDetails, component: AdminLbpDetail, conditions: { isKycApproved: true } },

  { path: routes.nftList, component: ListNFT, conditions: { isWhitelisted: true } },
  {
    path: routes.nftCollections,
    component: NFTCollections,
    conditions: { isWhitelisted: true },
  },
  {
    path: routes.nftCollectionCreate,
    component: CreateCollection,
    conditions: { isWhitelisted: true },
  },
  {
    path: routes.nftEditCollectionPath,
    component: UpdateCollection,
    conditions: { isWhitelisted: true },
  },
  {
    path: routes.nftCollectionImport,
    component: NftImport,
    conditions: { isWhitelisted: true },
  },
  {
    path: routes.nftViewCollectionPath,
    component: NFTCollection,
    conditions: { isWhitelisted: true },
  },
  {
    path: routes.nftItemPath,
    component: NftAssetPage,
    conditions: { isWhitelisted: true },
  },

  { path: routes.kyc, component: KYC, conditions: { isWhitelisted: true } },
  { path: '/maintainance', component: Maintenance, },
  {
    path: routes.kycIndividual,
    component: IndividualKYC,
    conditions: { isWhitelisted: true, kycFormAccess: 'individual' },
  },

  {
    path: routes.kycIndividualV2,
    component: IndividualKYCV2,
    conditions: { isWhitelisted: true, kycFormAccess: 'individual' },
  },

  {
    path: routes.kycCorporate,
    component: CorporateKYC,
    conditions: { isWhitelisted: true, kycFormAccess: 'corporate' },
  },
  { path: '/send', component: RedirectPathToSwapOnly, conditions: { isWhitelisted: true, chainIsSupported: true } },
  { path: '/swap/:outputCurrency', component: RedirectToSwap },
  { path: '/swap', component: Swap },
  { path: '/find', component: PoolFinder },
  { path: '/pool', component: PoolV2 },

  { path: '/add/:currencyIdA?/:currencyIdB?', component: RedirectDuplicateTokenIdsV2 },

  { path: '/remove/:currencyIdA/:currencyIdB', component: RemoveLiquidity },

  { path: routes.faucet, component: Faucet },

  { path: routes.securityToken(), component: SecTokenDetails },
  { path: routes.securityTokens(), component: SecurityTokens },

  { path: '/token-manager', render: () => <Redirect to={routes.tokenManager('my-tokens', null)} /> },
  { path: routes.tokenManager(), component: TokenManager },
  { path: routes.createPayoutEvent, component: CreatePayoutEvent },
  { path: routes.createAirdropEvent, component: CreateAirdropEvent },
  { path: routes.editPayoutEvent(), component: EditPayoutEvent },
  { path: routes.payoutItem(), component: PayoutItem },
  { path: routes.payoutItemManager(), component: PayoutItemManager },

  { path: routes.staking, component: StakingTab },
  { path: routes.vesting, component: VestingTab },

  /* Admin Routes */

  { path: routes.adminAccreditation, component: AdminAccreditationTable },
  { path: routes.adminKYCID, component: KycReviewModal },
  { path: routes.adminKYC, component: AdminKycTable },
  { path: routes.adminTransactions, component: AdminTransactionsTable },
  { path: routes.adminCatalog, component: AdminSecurityCatalog },
  { path: routes.adminUsers, component: UsersList },

  /* Launchpad routes */
  { path: routes.launchpad, component: Launchpad },
  { path: routes.offerPage, component: LaunchpadOffer },
  /* Issuance routes */
  {
    path: routes.issuance,
    component: LaunchpadIssuanceDashboard,
    ...onlyOfferManager,
  },
  { path: routes.viewVetting, component: LaunchpadIssuanceVettingFormView, ...onlyOfferManager },
  { path: routes.issuanceCreate, component: LaunchpadIssuanceForm, ...onlyOfferManager },
  {
    path: routes.createVetting,
    component: LaunchpadIssuanceVettingForm,
    ...onlyOfferManager,
  },
  {
    path: routes.createOffer,
    component: LaunchpadIssuanceInformationForm,
    ...onlyOfferManager,
  },
  {
    path: routes.editOffer,
    component: LaunchpadIssuanceInformationEditForm,
    ...onlyOfferManager,
  },
  { path: routes.reviewOffer, component: LaunchpadIssuanceInformationReview, ...onlyOfferManager },
  {
    path: routes.issuanceReport,
    component: LaunchpadIssuanceReport,
    ...onlyOfferManager,
  },
  { path: routes.manageOffer, component: ManageOffer, ...onlyOfferManager },
  { path: routes.tenant, component: TenantPage },
  { path: routes.tenantCreate, component: CreateTenantPage },
  { path: routes.tenantEdit, component: CreateTenantPage },
  { path: routes.tenantClone, component: CreateTenantPage },
]
