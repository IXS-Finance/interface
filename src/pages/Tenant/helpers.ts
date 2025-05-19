/* eslint-disable indent */
import { routes } from 'utils/routes'
import { PagesConfig, PagesGroup } from './types'

const defaults = [routes.launchpad]

export const pagesGroup: PagesGroup = {
  admin: [
    routes.adminDashboard,
    routes.admin(),
    routes.adminKYC,
    routes.adminKYCID,
    routes.adminAccreditation,
    routes.adminUsers,
    routes.adminTransactions,
    routes.adminCatalog,
    routes.tenant,
    routes.tenantCreate,
  ],
  dex: [routes.swap, routes.pool, routes.find, routes.swapOutputCurrency, routes.addCurrency, routes.removeCurrency],
  kyc: [routes.kyc, routes.kycIndividual, routes.kycIndividualV2, routes.kycCorporate],
  lbp: [routes.publicDetails],
  offer: [routes.offerPage],
  lbpAdmin: [routes.lbpDashboard, routes.lbpCreate, routes.lbpEdit, routes.adminDetails],
  issuance: [
    routes.issuance,
    routes.issuanceCreate,
    routes.createVetting,
    routes.viewVetting,
    routes.createOffer,
    routes.editOffer,
    routes.reviewOffer,
    routes.issuanceReport,
    routes.manageOffer,
  ],
  securityTokens: [routes.securityToken(), routes.securityTokens()],
  payout: [
    routes.editPayoutEvent(),
    routes.payoutItemManager(),
    routes.payoutItem(),
    routes.createPayoutEvent,
    routes.createAirdropEvent,
    routes.manageTokens,
    routes.payoutHistory,
    routes.payoutEvent,
    routes.tokenManager('my-tokens', null),
    routes.tokenManager(),
  ],
  charts: ['charts'],
  bridge: ['bridge'],
  staking: ['staking'],
  defaults,
}

export function getActiveRoutes(pages: PagesConfig): string | null {
  // Filter out keys with true values
  const activeKeys = Object.keys(pages).filter((key: string) => pages[key as keyof PagesConfig])

  // Map keys to corresponding route arrays and flatten the result
  const activeRoutes = activeKeys.reduce((acc: string[], key: string) => {
    const routes = pagesGroup[key]
    if (routes) {
      acc.push(...routes)
    }
    return acc
  }, [])

  if (activeRoutes.length === 0) {
    return null
  }

  return JSON.stringify(activeRoutes)
}

function isSubset(largerArray: string[], smallerArray: string[]) {
  return smallerArray.every((element) => largerArray.includes(element))
}

export function checkExistInPageGroup(pagesSource: string) {
  const pages = {
    dex: false,
    kyc: false,
    lbp: false,
    lbpAdmin: false,
    offer: false,
    issuance: false,
    payout: false,
    securityTokens: false,
    admin: false,
    charts: false,
    bridge: false,
    staking: false,
  }

  const pagesArray = JSON.parse(pagesSource)

  if (isSubset(pagesArray, pagesGroup.dex)) {
    pages.dex = true
  }
  if (isSubset(pagesArray, pagesGroup.kyc)) {
    pages.kyc = true
  }
  if (isSubset(pagesArray, pagesGroup.lbp)) {
    pages.lbp = true
  }
  if (isSubset(pagesArray, pagesGroup.lbpAdmin)) {
    pages.lbpAdmin = true
  }
  if (isSubset(pagesArray, pagesGroup.offer)) {
    pages.offer = true
  }
  if (isSubset(pagesArray, pagesGroup.issuance)) {
    pages.issuance = true
  }
  if (isSubset(pagesArray, pagesGroup.payout)) {
    pages.payout = true
  }
  if (isSubset(pagesArray, pagesGroup.securityTokens)) {
    pages.securityTokens = true
  }
  if (isSubset(pagesArray, pagesGroup.admin)) {
    pages.admin = true
  }
  if (isSubset(pagesArray, pagesGroup.charts)) {
    pages.charts = true
  }
  if (isSubset(pagesArray, pagesGroup.bridge)) {
    pages.bridge = true
  }
  if (isSubset(pagesArray, pagesGroup.staking)) {
    pages.staking = true
  }

  return pages
}

function checkObjectEmpty(obj: any) {
  return Object.keys(obj).length === 0
}

export function generateTenantSubmitPayload(values: any) {
  const socialLinks = {} as any
  const footerConfig = {} as any
  values?.telegram && (socialLinks['telegram'] = values?.telegram)
  values?.linkedin && (socialLinks['linkedin'] = values?.linkedin)
  values?.youtube && (socialLinks['youtube'] = values?.youtube)
  values?.twitter && (socialLinks['twitter'] = values?.twitter)
  !checkObjectEmpty(socialLinks) && (footerConfig['socialLinks'] = socialLinks)
  values?.termLink && (footerConfig['termsLink'] = values?.termLink)
  values?.policyLink && (footerConfig['policyLink'] = values?.policyLink)
  values?.block1 && (footerConfig['block1'] = values?.block1)
  values?.block2 && (footerConfig['block2'] = values?.block2)
  values?.block3 && (footerConfig['block3'] = values?.block3)

  const payload = {
    name: values?.name,
    title: values?.title,
    appUrl: values?.appUrl,
    description: values?.description,
    bannerImageUrl: values?.bannerImageUrl,
    pages: values?.pages ? getActiveRoutes(values.pages) : null,
    chartsUrl: values?.chartsUrl,
    enableLbp: values?.enableLbp,
    defaultUrl: values?.defaultUrl,
    faviconUrl: values?.faviconUrl,
    logoUrl: values?.logoUrl,
    enableFeaturedSecurityVaults: values?.enableFeaturedSecurityVaults ?? false,
    colors: values?.colorButtonPrimary
      ? JSON.stringify({
          button: { primary: values?.colorButtonPrimary },
        })
      : '',
    customStyles: '{}',
    supportEmail: values?.supportEmail,
    isIxSwap: values?.isIxSwap ?? false,
    tokens: values?.tokens ? JSON.stringify(values.tokens) : null,
    domain: values?.domain,
    enableLaunchpadBanner: values?.enableLaunchpadBanner ?? false,
    launchpadBannerTitle: values?.launchpadBannerTitle,
    launchpadBannerInfoRedirectTitle: values?.launchpadBannerInfoRedirectTitle,
    launchpadBannerInfoRedirectUrl: values?.launchpadBannerInfoRedirectUrl,
    kycSuccessRedirectUrl: values?.kycSuccessRedirectUrl,
    kycCancelRedirectUrl: values?.kycCancelRedirectUrl,
    footerConfig: !checkObjectEmpty(footerConfig) ? JSON.stringify(footerConfig) : '',
  }

  return payload
}

export const pages = {
  dex: false,
  kyc: false,
  lbp: false,
  lbpAdmin: false,
  offer: false,
  issuance: false,
  payout: false,
  securityTokens: false,
  admin: false,
  charts: false,
  bridge: false,
  staking: false,
}

export function setFieldsValue(setFieldValue: any, data: any) {
  setFieldValue('name', data.name)
  setFieldValue('title', data.title)
  setFieldValue('domain', data.domain)
  setFieldValue('appUrl', data.appUrl)
  setFieldValue('description', data.description)
  setFieldValue('bannerImageUrl', data.bannerImageUrl)
  setFieldValue('isIxSwap', data.isIxSwap)
  setFieldValue('enableLbp', data.enableLbp)
  setFieldValue('enableFeaturedSecurityVaults', data.enableFeaturedSecurityVaults)
  setFieldValue('chartsUrl', data.chartsUrl)
  setFieldValue('defaultUrl', data.defaultUrl)
  setFieldValue('tokens', data?.tokens ? JSON.parse(data.tokens) : [])
  setFieldValue('logoUrl', data.logoUrl)
  setFieldValue('faviconUrl', data.faviconUrl)
  setFieldValue('supportEmail', data.supportEmail)
  setFieldValue('enableLaunchpadBanner', data.enableLaunchpadBanner)
  setFieldValue('launchpadBannerTitle', data.launchpadBannerTitle)
  setFieldValue('launchpadBannerInfoRedirectTitle', data.launchpadBannerInfoRedirectTitle)
  setFieldValue('launchpadBannerInfoRedirectUrl', data.launchpadBannerInfoRedirectUrl)
  setFieldValue('kycSuccessRedirectUrl', data.kycSuccessRedirectUrl)
  setFieldValue('kycCancelRedirectUrl', data.kycCancelRedirectUrl)
  const footerConfig = data.footerConfig ? JSON.parse(data.footerConfig) : null
  setFieldValue('termLink', footerConfig?.termsLink)
  setFieldValue('policyLink', footerConfig?.policyLink)
  setFieldValue('block1', footerConfig?.block1)
  setFieldValue('block2', footerConfig?.block2)
  setFieldValue('block3', footerConfig?.block3)
  setFieldValue('telegram', footerConfig?.socialLinks?.telegram)
  setFieldValue('linkedin', footerConfig?.socialLinks?.linkedin)
  setFieldValue('youtube', footerConfig?.socialLinks?.youtube)
  setFieldValue('twitter', footerConfig?.socialLinks?.twitter)
  const colors = data.colors ? JSON.parse(data.colors) : null
  setFieldValue('colorButtonPrimary', colors?.button?.primary)
  setFieldValue('pages', data?.pages ? checkExistInPageGroup(data.pages) : pages)
}

export const PagesMapping = {
  admin: 'Admin Dashboard',
  dex: 'DEX',
  offer: 'Launchpad',
  lbp: 'LBP',
  issuance: 'Issuance Dashboard',
  kyc: 'KYC',
  securityTokens: 'RWA',
  payout: 'Payout',
  lbpAdmin: 'LBP Dashboard',
  charts: 'Charts',
  bridge: 'Bridge',
  staking: 'Staking',
} as any
