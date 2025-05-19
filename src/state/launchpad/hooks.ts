/* eslint-disable indent */
import lodash from 'lodash'
import React from 'react'

import { Currency, CurrencyAmount } from '@ixswap1/sdk-core'
import { useDispatch, useSelector } from 'react-redux'

import { FilterConfig } from 'components/Launchpad/InvestmentList/Filter'
import { OrderConfig, SearchConfig } from 'components/LaunchpadIssuance/IssuanceDashboard/SearchFilter'

import { AppState } from 'state'
import { tryParseAmount } from 'state/swap/helpers'
import { ApprovedRejectedOrderConfig, InvestedData, OfferFile, OrderTypes } from './types'

import {
  Asset,
  DashboardOffer,
  Issuance,
  IssuancePlain,
  IssuanceVetting,
  Offer,
  OfferFileType,
  OfferStatus,
  WhitelistStatus,
  ManagedOffer,
  OfferPresaleStatistics,
  OfferPresaleWhitelist,
  ManageOfferBody,
  PresaleOrderConfig,
  PaginationRes,
  AbstractOrder,
  PinnedOffer,
} from 'state/launchpad/types'

import { toggleKYCDialog } from './actions'

import {
  AdditionalDocument,
  InformationFormValues,
  OfferTokenType,
  SocialMediaType,
  TeamMember,
  VideoLink,
} from 'components/LaunchpadIssuance/IssuanceForm/Information/types'
import {
  getInitialValues as getOfferInitialValues,
  isDefinedNumber,
} from 'components/LaunchpadIssuance/IssuanceForm/Information/util'
import { IssuanceFile } from 'components/LaunchpadIssuance/IssuanceForm/types'
import { DirectorInfo, VettingFormValues } from 'components/LaunchpadIssuance/IssuanceForm/Vetting/types'
import { initialValues as vettingInitialFormValues } from 'components/LaunchpadIssuance/IssuanceForm/Vetting/util'
import { IssuanceStatus, SMART_CONTRACT_STRATEGIES } from 'components/LaunchpadIssuance/types'
import { useTokensList } from 'hooks/useTokensList'
import apiService from 'services/apiService'
import { useKyc } from 'state/user/hooks'
import { PaginateResponse } from 'types/pagination'
import { useActiveWeb3React } from 'hooks/web3'
import { getPublicAssetUrl } from 'components/TokenLogo/utils'
import { useWeb3React } from 'hooks/useWeb3React'

interface OfferPagination {
  page: number
  nextPage: number
  prevPage?: number
  offset: number

  totalItems: number
  totalPages: number

  itemsCount: number

  items: Offer[]
}

export const useLoader = (initial = true) => {
  const [isLoading, setLoading] = React.useState(initial)

  const stop = React.useCallback(() => setLoading(false), [])
  const start = React.useCallback(() => setLoading(true), [])

  return { isLoading, stop, start }
}

export const useKYCIsModalOpen = () => {
  return useSelector<AppState, boolean>((state) => state.launchpad.isKYCModalOpen)
}

export const useKYCAllowOnlyAccredited = () => {
  return useSelector<AppState, boolean>((state) => state.launchpad.allowOnlyAccredited)
}

export const useToggleKYCModal = () => {
  const dispatch = useDispatch()
  const isOpen = useKYCIsModalOpen()

  return React.useCallback(() => {
    dispatch(toggleKYCDialog({ open: !isOpen }))
  }, [isOpen])
}

export const useSetAllowOnlyAccredited = () => {
  const dispatch = useDispatch()

  return React.useCallback(
    (allowOnlyAccredited: boolean) => {
      dispatch(toggleKYCDialog({ open: allowOnlyAccredited }))
    },
    [dispatch]
  )
}

export const useCheckKYC = () => {
  const { account } = useActiveWeb3React()
  const { isApproved, isAccredited } = useKyc()
  return React.useCallback(
    (allowOnlyAccredited: boolean, isClosed: boolean) => {
      return Boolean(account && isApproved && (isClosed || !allowOnlyAccredited || isAccredited))
    },
    [account, isApproved, isAccredited]
  )
}

export const useGetOffers = () => {
  return React.useCallback(async (page: number, filter?: FilterConfig) => {
    let query = [`page=${page}`, 'offset=6']

    if (filter) {
      query = query.concat(
        Object.entries(filter)
          .filter(([, value]) => value.length > 0)
          .map(
            ([key, value]) => `${key}=${typeof value === 'string' ? value : value.map((x: any) => x.value).join(',')}`
          )
      )
    }

    const result = await apiService.get(`/offers?${query.join('&')}`).then((res) => res.data as OfferPagination)

    return {
      hasMore: result.nextPage !== null,
      items: result.items,
    }
  }, [])
}

export const useGetPinnedOffer = () => {
  return React.useCallback(() => apiService.get('/offers/main').then((res) => res.data as PinnedOffer), [])
}

export const useFormatOfferValue = (addComa = true) => {
  return React.useCallback((value?: string | number, decimalsLimit?: number) => {
    if (!value) {
      return ''
    }

    let result = value.toString()

    if (result) {
      const [wholeNumber, decimals] = result.split('.')

      const digits = wholeNumber
        .split('')
        .reverse()
        .filter((x) => /[0-9]/.test(x))

      result = digits
        .flatMap((x, idx) => (addComa && idx > 0 && idx % 3 === 0 ? [',', x] : x))
        .flat()
        .reverse()
        .join('')

      if (decimals !== undefined) {
        if (decimalsLimit && decimals.length > decimalsLimit) {
          const formatDecimals = decimals.substring(0, decimalsLimit)
          result = result.concat(`.${formatDecimals}`)
        } else {
          result = result.concat(`.${decimals}`)
        }
      }
    }
    return result
  }, [])
}

interface GetSupportPayload {
  email: string
  subject: string
  text: string
  offerId?: string
  issuanceId?: number
}

export const useRequestSupport = () => {
  return React.useCallback((payload: GetSupportPayload) => {
    return apiService.post(`/offers/support`, payload)
  }, [])
}

export const useSubscribeToOffer = () => {
  return React.useCallback(
    (email: string, offerId?: string) => apiService.post('/offers/subscribe', { email, offerId }),
    []
  )
}

export const useGetOffer = (id: string | number | undefined, startLoading = true) => {
  const loader = useLoader()
  const { account } = useWeb3React()
  const [data, setData] = React.useState<Offer | undefined>()
  const [error, setError] = React.useState('')
  const load = React.useCallback(() => {
    if (!id) {
      loader.stop()
      setData(undefined)
      return
    }
    setError('')
    apiService
      .get(`/offers/${id}`)
      .then((res) => res.data as Offer)
      .then(setData)
      .catch((e: any) => setError(e?.message))
      .finally(loader.stop)
  }, [id, account])

  React.useEffect(() => {
    if (startLoading && id) {
      load()
    } else {
      loader.stop()
    }
  }, [id, account])
  return { loading: loader.isLoading, load, data, error }
}

export const useGetWhitelistStatus = (id: string) => {
  const { account } = useWeb3React()
  const [loading, setLoading] = React.useState(true)
  const [info, setInfo] = React.useState<{ status: WhitelistStatus; isInterested: number }>()

  const getWhitelist = React.useCallback(() => apiService.get(`/offers/${id}/me/whitelist`), [id])

  React.useEffect(() => {
    getWhitelist()
      .then((res) => setInfo(res.data))
      .finally(() => setLoading(false))
  }, [id, account])

  return { ...info, loading }
}

export const useRequestWhitelist = (id: string) => {
  return React.useCallback(
    (payload: { amount: number; isInterested: boolean }) => apiService.post(`/offers/${id}/me/whitelist`, payload),
    [id]
  )
}

export const useInvest = (id: string) => {
  return React.useCallback(
    (status: OfferStatus, payload: { amount: string; txHash: string }) => {
      if (![OfferStatus.preSale, OfferStatus.sale].includes(status)) {
        throw new Error('Invalid offer status')
      }

      return apiService.post(`/offers/${id}/invest/${status.toLowerCase()}`, payload)
    },
    [id]
  )
}

export const usePresaleProof = (id: string) => {
  return React.useCallback(
    (amount: string) => apiService.get(`/offers/${id}/presale/proof`, undefined, { amount }),
    [id]
  )
}

export const useInvestPublicSaleStructData = (id: string) => {
  return React.useCallback(
    (amount: string, ethAddress: string | undefined | null) =>
      apiService.post(`/offers/${id}/request/invest-sale-struct`, {
        amount,
        ethAddress,
      }),
    [id]
  )
}

export const useDerivedBalanceInfo = (id: string) => {
  return React.useCallback(
    (amount: string, inputCurrency: Currency | null | undefined, balance?: CurrencyAmount<Currency>) => {
      if (amount) {
        const realAmount = amount.replace(/,/g, '')
        const parsedAmount = tryParseAmount(realAmount, inputCurrency ?? undefined)

        return parsedAmount && balance && !balance.lessThan(parsedAmount)
      }
      return true
    },
    [id]
  )
}

export const useClaimOfferRefund = (id: string) => {
  return React.useCallback(
    (payload: { amount: string; txHash: string }) => apiService.post(`/offers/${id}/claim/refund`, payload),
    [id]
  )
}

export const useCheckClaimed = (offerId: string) => {
  const [hasClaimed, setHasClaimed] = React.useState<boolean>(false)

  apiService
    .get(`/offers/${offerId}/claim/refund/check-has-claimed`)
    .then((res) => res.data as boolean)
    .then(setHasClaimed)

  return { setHasClaimed, hasClaimed }
}

export const useInvestedData = (offerId: string) => {
  const loader = useLoader()
  const { account } = useWeb3React()

  const [data, setData] = React.useState<InvestedData>({
    amount: 0,
    amountClaim: 0,
    availableToInvest: 0,
    lastStatus: null,
  })
  const [error, setError] = React.useState('')
  const load = React.useCallback(() => {
    loader.start()
    return apiService
      .get(`offers/${offerId}/invested`)
      .then((res) => res.data as InvestedData)
      .then(setData)
      .catch((e: any) => setError(e?.message))
      .finally(loader.stop)
  }, [offerId, account])

  React.useEffect(() => {
    load()
  }, [offerId, account])

  return { ...data, load, error, loading: loader.isLoading }
}

export const useCreateIssuance = () => {
  return React.useCallback(
    (name: string) => apiService.post('/issuances', { name }).then((res) => res.data as Issuance),
    []
  )
}

export const useGetIssuancePlain = (params?: { showAll?: string; forPinning?: string }) => {
  const loader = useLoader()

  const [items, setItems] = React.useState<IssuancePlain[]>([])

  const load = React.useCallback(() => {
    loader.start()

    return apiService
      .get('/issuances/plain', undefined, params)
      .then((res) => res.data as IssuancePlain[])
      .then(setItems)
      .then(loader.stop)
  }, [])

  React.useEffect(() => {
    load()
  }, [params?.showAll])

  return { items, load, loading: loader.isLoading }
}

export const useGetIssuanceFull = () => {
  const loader = useLoader()

  const [items, setItems] = React.useState<Issuance[]>([])

  const load = React.useCallback(() => {
    loader.start()

    return apiService
      .get('/issuances/full')
      .then((res) => res.data as PaginateResponse<Issuance>)
      .then((res) => setItems(res.items))
      .then(loader.stop)
  }, [])

  React.useEffect(() => {
    load()
  }, [])

  return { items, load, loading: loader.isLoading }
}

export const useGetIssuance = () => {
  const loader = useLoader()

  const [data, setData] = React.useState<Issuance>()
  const [error, setError] = React.useState('')
  const load = React.useCallback((id?: number | string) => {
    if (!id) {
      return
    }
    setError('')
    loader.start()
    return apiService
      .get(`/issuances/${id}/full`)
      .then((res) => res.data as Issuance)
      .then(setData)
      .catch((e: any) => setError(e.message))
      .finally(loader.stop)
  }, [])

  return { data, load, loading: loader.isLoading, error }
}

export const useVetting = (issuanceId?: number | string) => {
  const loader = useLoader()
  const [vetting, setVettings] = React.useState<IssuanceVetting>()
  const [error, setError] = React.useState<string>()
  React.useEffect(() => {
    if (issuanceId) {
      setError('')
      apiService
        .get(`/vettings/by-issuance/${issuanceId}`)
        .then((res) => res.data as IssuanceVetting)
        .then(setVettings)
        .catch((e: any) => setError(e?.message))
        .finally(loader.stop)
    }
  }, [issuanceId])

  return { data: vetting, loading: loader.isLoading, error }
}

export const useGetFile = () => {
  return React.useCallback((asset?: Asset) => {
    if (!asset) {
      return
    }

    return fetch(getPublicAssetUrl(asset))
      .then((res) => res.blob())
      .then((res) => ({ id: asset.id, file: new File([res], asset.name) }))
  }, [])
}

export const useVettingFormInitialValues = (issuanceId?: number | string) => {
  const loader = useLoader()
  const getFile = useGetFile()
  const vetting = useVetting(issuanceId)

  const [values, setValues] = React.useState<VettingFormValues>()

  const findFile = React.useCallback((files: { id: number; file: File }[], id?: number) => {
    if (!id) {
      return
    }

    return files.find((x) => x.id === id)
  }, [])

  const transform = React.useCallback(async (payload: IssuanceVetting) => {
    const files = await Promise.all([
      getFile(payload.document.pitchDeck),
      getFile(payload.document.certificateOfIncorporation),
      getFile(payload.document.certificateOfIncumbency),
      getFile(payload.document.memorandumArticle),
      getFile(payload.document.ownershipStructure),
      getFile(payload.document.resolutionAuthorizedSignatory),
      getFile(payload.document.shareDirectorRegistry),
      getFile(payload.document.auditedFinancials),

      ...payload.fundingDocuments.map((x) => getFile(x.document)),

      ...payload.directors.flatMap((entry) => [getFile(entry.proofOfAddress), getFile(entry.proofOfIdentity)]),
      ...payload.beneficialOwners.flatMap((entry) => [getFile(entry.proofOfAddress), getFile(entry.proofOfIdentity)]),
    ]).then((files) => files.filter((x) => !!x).map((x) => x as { id: number; file: File }))

    const owners = payload.beneficialOwners.map((director) => ({
      ...director,
      proofOfAddress: findFile(files, director.proofOfAddress?.id),
      proofOfIdentity: findFile(files, director.proofOfIdentity?.id),
    }))

    const directors = payload.directors.map((director) => ({
      ...director,
      proofOfAddress: findFile(files, director.proofOfAddress?.id),
      proofOfIdentity: findFile(files, director.proofOfIdentity?.id),
    }))

    return {
      ...payload,

      document: {
        pitchDeck: findFile(files, payload.document.pitchDeck?.id),
        certificateOfIncorporation: findFile(files, payload.document.certificateOfIncorporation?.id),
        certificateOfIncumbency: findFile(files, payload.document.certificateOfIncumbency?.id),
        memorandumArticle: findFile(files, payload.document.memorandumArticle?.id),
        ownershipStructure: findFile(files, payload.document.ownershipStructure?.id),
        resolutionAuthorizedSignatory: findFile(files, payload.document.resolutionAuthorizedSignatory?.id),
        shareDirectorRegistry: findFile(files, payload.document.shareDirectorRegistry?.id),
        auditedFinancials: findFile(files, payload.document.auditedFinancials?.id),
      },

      directors: directors.length > 0 ? directors : vettingInitialFormValues.directors,
      beneficialOwners: owners.length > 0 ? owners : vettingInitialFormValues.beneficialOwners,

      fundingDocuments: payload.fundingDocuments.map((doc) => ({
        id: doc.document.id,
        file: findFile(files, doc.document.id),
      })),
    } as unknown as VettingFormValues
  }, [])

  React.useEffect(() => {
    if (!vetting.loading && !vetting.data) {
      setValues(vettingInitialFormValues)
      loader.stop()
    } else if (!vetting.loading && vetting.data) {
      transform(vetting.data).then(setValues).then(loader.stop)
    }
  }, [vetting.loading])

  return { data: values, loading: loader.isLoading, vettingId: vetting.data?.id, error: vetting.error }
}

export const useGetIssuances = () => {
  return React.useCallback(async (page: number, filter?: SearchConfig, order?: OrderConfig, size = 10) => {
    let query = [`page=${page}`, `offset=${size}`]

    if (filter) {
      query = query.concat(
        Object.entries(filter)
          .filter(([, value]) => value.length > 0)
          .map(
            ([key, value]) => `${key}=${typeof value === 'string' ? value : value.map((x: any) => x.value).join(',')}`
          )
      )
    }

    if (order) {
      query = query.concat(
        Object.entries(order)
          .filter(([, value]) => value && value.length > 0)
          .map(([key, value]) => `order=${key}=${value}`)
      )
    }

    const result = await apiService
      .get(`/issuances/full?${query.join('&')}`)
      .then((res) => res.data as PaginateResponse<Issuance>)

    return {
      hasMore: result.nextPage !== null,
      items: result.items,

      totalPages: result.totalPages,
      totalItems: result.totalItems,
    }
  }, [])
}

export const useGetOffersFull = () => {
  return React.useCallback(
    async (page: number, filter?: SearchConfig, order?: OrderConfig, type?: string, size = 10) => {
      let query = [`page=${page}`, `offset=${size}`]

      if (filter) {
        query = query.concat(
          Object.entries(filter)
            .filter(([, value]) => value.length > 0)
            .map(
              ([key, value]) => `${key}=${typeof value === 'string' ? value : value.map((x: any) => x.value).join(',')}`
            )
        )
      }

      if (order) {
        query = query.concat(
          Object.entries(order)
            .filter(([, value]) => value && value.length > 0)
            .map(([key, value]) => `order=${key}=${value}`)
        )
      }

      query = query.concat(`type=${type?.toLocaleLowerCase()}`)

      const result = await apiService
        .get(`/offers/me?${query.join('&')}`)
        .then((res) => res.data as PaginateResponse<DashboardOffer>)

      return {
        hasMore: result.nextPage !== null,
        items: result.items,

        totalPages: result.totalPages,
        totalItems: result.totalItems,
      }
    },
    []
  )
}

export const useGetFieldArrayId = (numeric = true) => {
  let counter = 0

  return React.useCallback(() => {
    ++counter
    return numeric ? counter : `MN-${counter}`
  }, [numeric])
}

export interface FileUpload {
  name: string
  file: File
}

export const useUploadFiles = () => {
  return React.useCallback(async (files: FileUpload[]) => {
    const data = new FormData()

    for (const entry of files) {
      data.append(entry.name, entry.file)
    }

    return await apiService
      .post('/storage/batch', data)
      .then((res) => res.data as { [key: string]: number })
      .then((res) => lodash.toPairs(res))
      .then((res) => res.map(([name, id]) => ({ name, id })))
  }, [])
}

const useUploadVettingFiles = () => {
  const uploadFiles = useUploadFiles()

  return React.useCallback(
    async (payload: VettingFormValues, initial: VettingFormValues) => {
      const files: FileUpload[] = []
      const filesToRemove: { name: string; id: number | null }[] = []

      const addDocument = (key: keyof VettingFormValues['document']) => {
        if (!initial.document[key] || initial.document[key].id !== payload.document?.[key]?.id)
          files.push({ name: `document.${key}Id`, file: payload.document[key]?.file })

        if (initial.document[key] && payload.document?.[key] === null)
          filesToRemove.push({ name: `document.${key}Id`, id: null })
      }

      payload.directors?.forEach((entry, idx) => {
        if (
          !initial.directors[idx]?.proofOfAddress ||
          initial.directors[idx]?.proofOfAddress.id !== entry.proofOfAddress?.id
        )
          files.push({ name: `directors.${idx}.proofOfAddressId`, file: entry.proofOfAddress?.file })

        if (
          !initial.directors[idx]?.proofOfIdentity ||
          initial.directors[idx]?.proofOfIdentity.id !== entry.proofOfIdentity?.id
        )
          files.push({ name: `directors.${idx}.proofOfIdentityId`, file: entry.proofOfIdentity?.file })
      })

      payload.beneficialOwners?.forEach((entry, idx) => {
        if (
          !initial.beneficialOwners[idx]?.proofOfAddress ||
          initial.beneficialOwners[idx]?.proofOfAddress.id !== entry.proofOfAddress?.id
        )
          files.push({ name: `beneficialOwners.${idx}.proofOfAddressId`, file: entry.proofOfAddress?.file })
        if (
          !initial.beneficialOwners[idx]?.proofOfIdentity ||
          initial.beneficialOwners[idx]?.proofOfIdentity.id !== entry.proofOfIdentity?.id
        )
          files.push({ name: `beneficialOwners.${idx}.proofOfIdentityId`, file: entry.proofOfIdentity?.file })
      })

      payload.fundingDocuments?.forEach((entry, idx) => {
        if (!initial.fundingDocuments.some((x) => x.id === entry.id))
          files.push({ name: `fundingDocuments.${idx}`, file: entry.file?.file })
      })

      Object.keys(payload.document).map((key) => addDocument(key as keyof VettingFormValues['document']))

      const filesToUpload = files.filter((x) => !!x.file)
      const uploadedFiles = filesToUpload.length === 0 ? [] : await uploadFiles(filesToUpload)

      return [...uploadedFiles, ...filesToRemove]
    },
    [uploadFiles]
  )
}

export const useSaveVettingDraft = (issuanceId?: number) => {
  const uploadFiles = useUploadVettingFiles()

  return React.useCallback(
    async (payload: VettingFormValues, initialValues: VettingFormValues, vettingId?: number) => {
      const filterEmptyPeople = (item: any) => Object.values(item).some((v) => Boolean(v))

      let data: Record<string, any> = {
        issuanceId: Number(issuanceId),

        toSubmit: false,

        applicantFullName: payload.applicantFullName,
        email: payload.email,

        companyName: payload.companyName,
        companyWebsite: payload.companyWebsite,

        description: payload.description,

        document: payload.document,
        directors: payload.directors.filter(filterEmptyPeople).map((x: any) => ({
          fullName: x.fullName,
          proofOfIdentityId: x.proofOfIdentityId,
          proofOfAddressId: x.proofOfAddressId,
          ...(x.id && { id: x.id }),
        })),

        beneficialOwners: payload.beneficialOwners.filter(filterEmptyPeople).map((x: any) => ({
          fullName: x.fullName,
          proofOfIdentityId: x.proofOfIdentityId,
          proofOfAddressId: x.proofOfAddressId,
          ...(x.id && { id: x.id }),
        })),

        fundingDocuments: payload.fundingDocuments,
        smartContractStrategy: payload.smartContractStrategy || SMART_CONTRACT_STRATEGIES.original,
      }

      const uploadedFiles = await uploadFiles(payload, initialValues)

      const updateDirectors = (key: 'directors' | 'beneficialOwners') => {
        const fileUpdates = uploadedFiles
          .filter((x) => x.name.startsWith(key))
          .map((x) => ({ ...x, name: x.name.split('.')[2] as keyof DirectorInfo, index: Number(x.name.split('.')[1]) }))

        fileUpdates.forEach((x) => {
          data[key][x.index][x.name] = x.id
        })
      }

      updateDirectors('beneficialOwners')
      updateDirectors('directors')

      data.document = uploadedFiles
        .filter((x) => x.name.startsWith('document'))
        .map((x) => ({ ...x, name: x.name.split('.').pop() ?? '' }))
        .reduce((acc, e) => ({ ...acc, [e.name]: e.id }), {})

      const existingFunding = payload.fundingDocuments.filter((i) => typeof i.id === 'number').map((i) => i.id)
      const uploadedFunding = uploadedFiles.filter((x) => x.name.startsWith('fundingDocuments')).map((x) => x.id)
      data.fundingDocuments = [...existingFunding, ...uploadedFunding]

      data = Object.entries(data)
        .filter(([, value]) => typeof value === 'boolean' || value !== undefined)
        .map(([key, value]) => {
          if (value === '') {
            return [key, null]
          }
          if (Array.isArray(value)) {
            const newValue = value.map((valueItem) => {
              // for directors and "beneficialOwners"
              if (typeof valueItem === 'object') {
                return Object.entries(valueItem)
                  .map(([valueItemKey, valueItemValue]) => [
                    valueItemKey,
                    valueItemValue === '' ? null : valueItemValue,
                  ])
                  .reduce(
                    (acc, [valueItemKey, valueItemValue]: any) => ({ ...acc, [valueItemKey]: valueItemValue }),
                    {}
                  )
              }
              return valueItem
            })
            return [key, newValue]
          }
          return [key, value]
        })
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

      if (vettingId) {
        delete data.issuanceId
        return apiService.put(`/vettings/${vettingId}`, data)
      } else {
        return apiService.post(`/vettings`, data)
      }
    },
    [uploadFiles]
  )
}

export const useSubmitVettingForm = (issuanceId?: number | string) => {
  const uploadFiles = useUploadVettingFiles()

  return React.useCallback(
    async (payload: VettingFormValues, initialValues: VettingFormValues, vettingId?: number) => {
      const filterEmptyPeople = (item: any) => Object.values(item).some((v) => Boolean(v))
      const uploadedFiles = await uploadFiles(payload, initialValues)

      const findDoc = (key: keyof VettingFormValues['document']) =>
        uploadedFiles.find((x) => x.name === `document.${key}Id`)?.id ?? initialValues.document[key]?.id

      const data: Record<string, any> = {
        issuanceId: Number(issuanceId),

        toSubmit: true,

        applicantFullName: payload.applicantFullName,
        email: payload.email,

        companyName: payload.companyName,
        companyWebsite: payload.companyWebsite,

        description: payload.description,

        document: {
          pitchDeckId: findDoc('pitchDeck'),

          certificateOfIncorporationId: findDoc('certificateOfIncorporation'),
          certificateOfIncumbencyId: findDoc('certificateOfIncumbency'),

          shareDirectorRegistryId: findDoc('shareDirectorRegistry'),
          auditedFinancialsId: findDoc('auditedFinancials'),

          memorandumArticleId: findDoc('memorandumArticle'),
          ownershipStructureId: findDoc('ownershipStructure'),

          resolutionAuthorizedSignatoryId: findDoc('resolutionAuthorizedSignatory'),
        },

        directors: payload.directors.filter(filterEmptyPeople).map((x: any) => ({
          fullName: x.fullName,
          proofOfIdentityId: x.proofOfIdentityId,
          proofOfAddressId: x.proofOfAddressId,
          ...(x.id && { id: x.id }),
        })),

        beneficialOwners: payload.beneficialOwners.filter(filterEmptyPeople).map((x: any) => ({
          fullName: x.fullName,
          proofOfIdentityId: x.proofOfIdentityId,
          proofOfAddressId: x.proofOfAddressId,
          ...(x.id && { id: x.id }),
        })),

        fundingDocuments: payload.fundingDocuments,
        smartContractStrategy: payload.smartContractStrategy || SMART_CONTRACT_STRATEGIES.original,
      }

      const updateDirectors = (key: 'directors' | 'beneficialOwners') => {
        const fileUpdates = uploadedFiles
          .filter((x) => x.name.startsWith(key))
          .map((x) => ({ ...x, name: x.name.split('.')[2] as keyof DirectorInfo, index: Number(x.name.split('.')[1]) }))

        fileUpdates.forEach((x) => {
          data[key][x.index][x.name] = x.id
        })
      }

      updateDirectors('beneficialOwners')
      updateDirectors('directors')

      const updatedFundingDocuments = new Set(payload.fundingDocuments.map((x) => x.id))
      const oldFundingDocs = initialValues.fundingDocuments
        .map((x) => x.id)
        .filter((x) => !updatedFundingDocuments.has(x))

      data.fundingDocuments = [
        ...oldFundingDocs,
        ...uploadedFiles.filter((x) => x.name.startsWith('fundingDocuments')).map((x) => x.id),
      ]

      if (vettingId) {
        delete data.issuanceId
        return apiService.put(`/vettings/${vettingId}`, data)
      } else {
        return apiService.post(`/vettings`, data)
      }
    },
    [issuanceId, uploadFiles]
  )
}

const useUploadOfferFiles = () => {
  const uploadFiles = useUploadFiles()

  const getMemberFiles = React.useCallback((payload: InformationFormValues, initial: InformationFormValues) => {
    const uploadedFiles = new Set(initial.members.filter((x) => x.photo?.id).map((x) => x.photo?.id))

    const files: FileUpload[] = []

    payload.members.forEach((entry, idx) => {
      if (!entry.photo || uploadedFiles.has(entry.photo?.id)) {
        return
      }

      files.push({ name: `member.photo.${idx}`, file: entry.photo.file })
    })

    return files
  }, [])

  const getImageFiles = React.useCallback((payload: InformationFormValues, initial: InformationFormValues) => {
    const uploadedFiles = new Set(initial.images.filter((x) => x.id).map((x) => x.id))

    const files: FileUpload[] = []

    payload.images.forEach((entry, idx) => {
      if (uploadedFiles.has(entry?.id)) {
        return
      }

      files.push({ name: `image.${idx}`, file: entry.file })
    })

    return files
  }, [])

  const getDocumentFiles = React.useCallback((payload: InformationFormValues, initial: InformationFormValues) => {
    const uploadedFiles = new Set(initial.additionalDocuments.filter((x) => x.file?.id).map((x) => x.file?.id))

    const files: FileUpload[] = []

    payload.additionalDocuments.forEach((entry, idx) => {
      if (!entry.file || uploadedFiles.has(entry.file?.id)) {
        return
      }

      files.push({ name: `document.${idx}`, file: entry.file?.file })
    })

    return files
  }, [])

  const getOtherExecutionDocumentFiles = React.useCallback(
    (payload: InformationFormValues, initial: InformationFormValues) => {
      const uploadedFiles = new Set(initial.otherExecutionDocuments.filter((x) => x.file?.id).map((x) => x.file?.id))

      const files: FileUpload[] = []

      payload.otherExecutionDocuments.forEach((entry, idx) => {
        if (!entry.file || uploadedFiles.has(entry.file?.id)) {
          return
        }

        files.push({ name: `otherExecutionDocument.${idx}`, file: entry.file?.file })
      })

      return files
    },
    []
  )

  return React.useCallback(
    (payload: InformationFormValues, initial: InformationFormValues) => {
      const files = [
        ...getDocumentFiles(payload, initial),
        ...getImageFiles(payload, initial),
        ...getMemberFiles(payload, initial),
        ...getOtherExecutionDocumentFiles(payload, initial),
      ]

      if (payload.cardPicture?.id !== initial.cardPicture?.id) {
        files.push({ name: 'card', file: payload.cardPicture?.file })
      }

      if (payload.profilePicture?.id !== initial.profilePicture?.id) {
        files.push({ name: 'profile', file: payload.profilePicture?.file })
      }

      const firstUploadedPurchaseAgreement = payload.purchaseAgreement?.file && !payload.purchaseAgreement?.file?.id
      const firstUploadedInvestmentMemorandum =
        payload.investmentMemorandum?.file && !payload.investmentMemorandum?.file?.id

      if (
        firstUploadedPurchaseAgreement ||
        payload.purchaseAgreement?.file?.id !== initial.purchaseAgreement?.file?.id
      ) {
        files.push({ name: 'purchaseAgreement', file: payload.purchaseAgreement?.file?.file })
      }

      if (
        firstUploadedInvestmentMemorandum ||
        payload.investmentMemorandum?.file?.id !== initial.investmentMemorandum?.file?.id
      ) {
        files.push({ name: 'investmentMemorandum', file: payload.investmentMemorandum?.file?.file })
      }

      return uploadFiles(files.filter((x) => x.file))
    },
    [uploadFiles, getDocumentFiles, getImageFiles, getMemberFiles, getOtherExecutionDocumentFiles]
  )
}

export const useOfferFormInitialValues = (
  issuanceId?: number | string,
  smartContractStrategy?: SMART_CONTRACT_STRATEGIES
) => {
  const getFile = useGetFile()

  const issuance = useGetIssuance()
  const offer = useGetOffer(issuance?.data?.vetting?.offer?.id)
  const [values, setValues] = React.useState<InformationFormValues>()

  React.useEffect(() => {
    issuance.load(issuanceId)
  }, [issuanceId])

  React.useEffect(() => {
    if (!offer.loading && !offer.data) {
      setValues(getOfferInitialValues(smartContractStrategy))
    } else if (!offer.loading && offer.data) {
      transform(offer.data).then(setValues)
    }
  }, [offer.loading, offer.data, smartContractStrategy])

  const transform = React.useCallback(
    async (payload: Offer): Promise<InformationFormValues> => {
      const initialValues = getOfferInitialValues(smartContractStrategy)
      const files = await Promise.all([
        ...payload.members.map((x) => getFile(x.avatar)),
        ...payload.files.filter((x) => x.type !== OfferFileType.video).map((x) => getFile(x.file)),

        getFile(payload.cardPicture),
        getFile(payload.profilePicture),
      ])
        .then((res) => res.filter((x) => !!x))
        .then((res) => res as { id: number; file: File }[])

      const {
        images = [],
        videos = [],
        documents = [],
        otherExecutionDocuments = [],
        purchaseAgreement,
        investmentMemorandum,
      } = payload.files?.reduce(
        (accum: any, item) => {
          if (item.type === OfferFileType.image) {
            accum.images.push(item)
          } else if (item.type === OfferFileType.video) {
            accum.videos.push(item)
          } else if (item.type === OfferFileType.document) {
            accum.documents.push(item)
          } else if (item.type === OfferFileType.otherExecutionDocument) {
            accum.otherExecutionDocuments.push(item)
          } else if (item.type === OfferFileType.investmentMemorandum) {
            accum.investmentMemorandum = item
          } else if (item.type === OfferFileType.purchaseAgreement) {
            accum.purchaseAgreement = item
          }
          return accum
        },
        {
          images: [],
          videos: [],
          documents: [],
          otherExecutionDocuments: [],
          purchaseAgreement: null,
          investmentMemorandum: null,
        }
      )

      const res = {
        id: payload?.id,
        status: payload?.status as unknown as IssuanceStatus,
        title: payload.title,

        shortDescription: payload.shortDescription,
        longDescription: payload.longDescription,

        cardPicture: files.find((x) => x.id === payload.cardPicture?.id) as IssuanceFile,
        profilePicture: files.find((x) => x.id === payload.profilePicture?.id) as IssuanceFile,

        allowOnlyAccredited: payload.allowOnlyAccredited,
        tokenomicsAgreement: payload.tokenomicsAgreement,

        country: payload.country,
        restrictedJurisdictions: payload.restrictedJurisdictions,
        email: payload.contactUsEmail,
        website: payload.issuerWebsite,
        whitepaper: payload.whitepaperUrl,

        hardCap: payload.hardCap,
        softCap: payload.softCap,

        faq: payload.faq?.length ? payload.faq : initialValues.faq,
        members: payload.members?.length
          ? payload.members.map(
              (member) =>
                ({
                  id: member.id,
                  name: member.name,
                  role: member.title,
                  about: member.description,
                  photo: files.find((x) => x.id === member.avatar?.id),
                } as TeamMember)
            )
          : initialValues.members,

        social: Object.entries(payload.socialMedia || {}).map(([name, link]) => ({
          type: name as SocialMediaType,
          url: link,
        })),

        images: images.map((image: any) => files.find((x) => x.id === image.file?.id) as IssuanceFile),

        videos: videos.length
          ? videos.map((video: any) => ({ url: video.videoUrl, id: video.id } as VideoLink))
          : initialValues.videos,

        additionalDocuments: documents.length
          ? documents.map((document: any) => {
              const file = files.find((x) => x.id === document.file?.id)

              return { file: file, asset: document?.file } as AdditionalDocument
            })
          : initialValues.additionalDocuments,

        purchaseAgreement: { file: purchaseAgreement },
        investmentMemorandum: { file: investmentMemorandum },
        otherExecutionDocuments: otherExecutionDocuments.length
          ? otherExecutionDocuments.map((document: any) => {
              const file = files.find((x) => x.id === document.file?.id)

              return { file: file, asset: document?.file } as AdditionalDocument
            })
          : initialValues.otherExecutionDocuments,

        hasPresale: payload.hasPresale,
        presaleAlocated: payload.presaleAlocated,
        presaleMaxInvestment: payload.presaleMaxInvestment,
        presaleMinInvestment: payload.presaleMinInvestment,

        industry: payload.industry,
        investmentType: payload.investmentType,
        issuerIdentificationNumber: payload.issuerIdentificationNumber,
        maxInvestment: payload.maxInvestment,
        minInvestment: payload.minInvestment,

        changesRequested: payload.changesRequested,
        reasonRequested: payload.reasonRequested,

        terms: {
          distributionFrequency: payload.terms.distributionFrequency ?? '',
          dividentYield: payload.terms.dividentYield ?? '',
          grossIrr: payload.terms.grossIrr ?? '',
          investmentPeriod: payload.terms.investmentPeriod ? String(payload.terms.investmentPeriod) : '',
          investmentStructure: payload.terms.investmentStructure ?? '',
        },

        network: payload.network,

        timeframe: payload.timeframe,
        tokenName: payload.tokenName ?? '',
        decimals: payload.decimals,
        trusteeAddress: payload.trusteeAddress,
        tokenPrice: isDefinedNumber(payload.tokenPrice) ? Number(payload.tokenPrice) : null,
        presaleTokenPrice: isDefinedNumber(payload.presaleTokenPrice) ? Number(payload.presaleTokenPrice) : null,
        tokenStandart: payload.tokenStandart,
        totalSupply: payload.totalSupply ?? '',
        tokenReceiverAddress: payload.tokenReceiverAddress ?? '',
        // mapping: tokenTicker, tokenType. server to frontend fields
        tokenTicker: payload.tokenSymbol,
        tokenType: payload.investingTokenSymbol as OfferTokenType,
        tokenAddress: payload.tokenAddress,
        investingTokenAddress: payload.investingTokenAddress,
        smartContractStrategy,
      }
      return res
    },
    [offer.data?.status, smartContractStrategy]
  )

  const refetch = async () => {
    await issuance.load(issuanceId)
    await offer.load()
  }

  return {
    data: values,
    loading: issuance.loading || offer.loading,
    vettingId: issuance.data?.vetting?.id,
    error: issuance.error,
    issuance: issuance.data,
    refetch,
  }
}

export const useSubmitOffer = () => {
  const uploadFiles = useUploadOfferFiles()

  const { tokensOptions, secTokensOptions } = useTokensList()
  const mixedTokens = React.useMemo(() => [...tokensOptions, ...secTokensOptions], [tokensOptions, secTokensOptions])

  return React.useCallback(
    async (
      payload: InformationFormValues,
      initial: InformationFormValues,
      draft = false,
      vettingId?: number | string,
      offerId?: string
    ) => {
      const uploadedFiles = await uploadFiles(payload, initial)
      const findDoc = (prefix: 'member.photo' | 'document' | 'image' | 'otherExecutionDocument', idx: number) =>
        uploadedFiles.find((x) => x.name === `${prefix}.${idx}`)?.id
      const purchaseAgreementId =
        uploadedFiles.find((x) => x.name === 'purchaseAgreement')?.id ||
        payload.purchaseAgreement?.file?.file?.id ||
        null

      const investmentMemorandumId =
        uploadedFiles.find((x) => x.name === 'investmentMemorandum')?.id ||
        payload.investmentMemorandum?.file?.file?.id ||
        null

      const executionDocuments = []
      if (purchaseAgreementId)
        executionDocuments.push({
          type: OfferFileType.purchaseAgreement,
          fileId: purchaseAgreementId,
        })

      if (investmentMemorandumId)
        executionDocuments.push({
          type: OfferFileType.investmentMemorandum,
          fileId: investmentMemorandumId,
        })

      let data: Record<string, any> = {
        offerId,
        vettingId,

        toSubmit: !draft,

        shortDescription: payload.shortDescription,
        longDescription: payload.longDescription,

        network: payload.network,
        industry: payload.industry,
        investmentType: payload.investmentType,
        country: payload.country,
        restrictedJurisdictions: payload.restrictedJurisdictions,

        socialMedia: payload.social.reduce((acc, e) => ({ ...acc, [e.type]: e.url }), {}),

        contactUsEmail: payload.email,
        issuerWebsite: payload.website,
        whitepaperUrl: payload.whitepaper || null,

        profilePictureId: uploadedFiles.find((x) => x.name === 'profile')?.id || payload.profilePicture?.id || null,
        cardPictureId: uploadedFiles.find((x) => x.name === 'card')?.id || payload.cardPicture?.id || null,

        title: payload.title,
        issuerIdentificationNumber: payload.issuerIdentificationNumber,

        tokenAddress: payload.tokenAddress,
        trusteeAddress: payload.trusteeAddress,
        // mapping : tokenSymbol, investingTokenSymbol frontend to server
        tokenSymbol: payload.tokenTicker,
        investingTokenSymbol: payload.tokenType,
        tokenPrice: payload.tokenPrice?.toString(),
        decimals: isDefinedNumber(payload.decimals) ? Number(payload.decimals) : null,
        tokenStandart: payload.tokenStandart,

        totalSupply: payload.totalSupply,
        tokenReceiverAddress: payload.tokenReceiverAddress,

        softCap: payload.softCap,
        hardCap: payload.hardCap,
        tokenName: payload.tokenName,
        minInvestment: payload.minInvestment,
        maxInvestment: payload.maxInvestment,

        hasPresale: payload.hasPresale,
        presaleTokenPrice: payload.presaleTokenPrice?.toString(),
        presaleMinInvestment: payload.presaleMinInvestment,
        presaleMaxInvestment: payload.presaleMaxInvestment,
        presaleAlocated: payload.presaleAlocated,

        allowOnlyAccredited: payload.allowOnlyAccredited ?? false,
        tokenomicsAgreement: payload.tokenomicsAgreement,

        terms: {
          investmentStructure: String(payload.terms.investmentStructure),
          dividentYield: payload.terms.dividentYield,
          investmentPeriod: payload.terms.investmentPeriod ? Number(payload.terms.investmentPeriod) : null,
          grossIrr: payload.terms.grossIrr,
          distributionFrequency: payload.terms.distributionFrequency,
        },

        timeframe: {
          whitelist: payload.timeframe.whitelist || null,
          preSale: payload.timeframe.preSale || null,
          sale: payload.timeframe.sale || null,
          closed: payload.timeframe.closed || null,
          claim: payload.timeframe.claim || null,
        },

        faq: payload.faq.filter((x) => x.question || x.answer).map((x) => ({ question: x.question, answer: x.answer })),

        members: payload.members
          .map((x, idx) => ({
            avatarId: findDoc('member.photo', idx) || x.photo?.id || null,
            name: x.name,
            title: x.role,
            description: x.about,
          }))
          .filter((x) => x.avatarId || x.name || x.title || x.description),

        files: [
          ...executionDocuments,
          ...payload.additionalDocuments
            .map((x, idx) => ({
              type: OfferFileType.document,
              fileId: findDoc('document', idx) || x.file?.id || null,
            }))
            .filter((x) => x.fileId),

          ...payload.otherExecutionDocuments
            .map((x, idx) => ({
              type: OfferFileType.otherExecutionDocument,
              fileId: findDoc('otherExecutionDocument', idx) || x.file?.id || null,
            }))
            .filter((x) => x.fileId),

          ...payload.images
            .map((x, idx) => ({
              type: OfferFileType.image,
              fileId: findDoc('image', idx) || x.id || null,
            }))
            .filter((x) => x.fileId),

          ...payload.videos
            .map((x) => ({
              type: OfferFileType.video,
              videoUrl: x.url,
            }))
            .filter((x) => x.videoUrl),
        ],
      }

      function filter(filterData: any): any {
        if (filterData === undefined || filterData === null) {
          return filterData
        }
        if (filterData === '') {
          return null
        }

        if (Array.isArray(filterData) && filterData.length === 1 && Object.keys(filterData[0]).length === 0) {
          return []
        }

        if (typeof filterData === 'object' && filterData.length !== undefined) {
          return filterData.map(filter).filter((x: any) => x !== undefined)
        }

        if (typeof filterData !== 'object' || filterData instanceof Date) {
          return filterData
        }

        const result = Object.entries(filterData)
          .map(([key, value]) => ({ key, value }))
          .map((entry) => ({ ...entry, value: filter(entry.value) }))
          .filter(
            (entry) =>
              entry.value !== undefined ||
              typeof entry.value === 'boolean' ||
              (typeof entry.value === 'object' &&
                entry.value &&
                (entry.value instanceof Date || Object.keys(entry.value).length > 0))
          )
          .reduce((acc, entry) => ({ ...acc, [entry.key]: filter(entry.value) }), {})

        return result
      }

      data = filter(data)
      if (offerId) {
        delete data.offerId
        delete data.vettingId
        return apiService.put(`/offers/${offerId}/full`, data)
      } else {
        return apiService.post(`/offers`, data)
      }
    },
    [uploadFiles, mixedTokens]
  )
}

export const useMinimalOfferEdit = () => {
  const uploadFiles = useUploadOfferFiles()

  return React.useCallback(async (offerId: string, payload: InformationFormValues, initial: InformationFormValues) => {
    const files = await uploadFiles(payload, initial)

    const find = (prefix: 'member.photo' | 'document' | 'image' | 'otherExecutionDocument', idx: number) =>
      files.find((x) => x.name === `${prefix}.${idx}`)?.id

    const purchaseAgreementId =
      files.find((x) => x.name === 'purchaseAgreement')?.id || // file id is from uploaded files
      payload.purchaseAgreement?.file?.file.id || // if we keep the file in the state
      null
    const investmentMemorandumId =
      files.find((x) => x.name === 'investmentMemorandum')?.id || // file id is from uploaded files
      payload.investmentMemorandum?.file?.file.id || // if we keep the file in the state
      null

    const executionDocuments = []
    if (purchaseAgreementId)
      executionDocuments.push({
        type: OfferFileType.purchaseAgreement,
        fileId: purchaseAgreementId,
      })

    if (investmentMemorandumId)
      executionDocuments.push({
        type: OfferFileType.investmentMemorandum,
        fileId: investmentMemorandumId,
      })

    const data = {
      shortDescription: payload.shortDescription,
      longDescription: payload.longDescription,

      network: payload.network,
      industry: payload.industry,
      investmentType: payload.investmentType,
      country: payload.country,
      restrictedJurisdictions: payload.restrictedJurisdictions,

      contactUsEmail: payload.email,
      issuerWebsite: payload.website,
      whitepaperUrl: payload.whitepaper || null,

      profilePictureId: files.find((x) => x.name === 'profile')?.id || payload.profilePicture?.id || null,
      cardPictureId: files.find((x) => x.name === 'card')?.id || payload.cardPicture?.id || null,

      faq: payload.faq
        .filter((x) => x.question || x.answer)
        .map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        })),

      socialMedia: payload.social.reduce((acc, e) => ({ ...acc, [e.type]: e.url }), {}),

      members: payload.members
        .map((member, idx) => ({
          id: member.id && member.id >= 0 ? member.id : undefined,
          avatarId: find('member.photo', idx) || member.photo?.id || null,
          name: member.name,
          title: member.role,
          description: member.about,
        }))
        .filter((x) => x.avatarId || x.name || x.title || x.description),

      files: [
        ...executionDocuments,
        ...payload.otherExecutionDocuments
          .map((x, idx) => ({
            type: OfferFileType.otherExecutionDocument,
            fileId: find('otherExecutionDocument', idx) || x.file?.id || null,
          }))
          .filter((x) => x.fileId),

        ...payload.additionalDocuments
          .map((x, idx) => ({
            type: OfferFileType.document,
            fileId: find('document', idx) || x.file?.id || null,
          }))
          .filter((x) => x.fileId),

        ...payload.images
          .map((x, idx) => ({
            type: OfferFileType.image,
            fileId: find('image', idx) || x.id || null,
          }))
          .filter((x) => x.fileId),

        ...payload.videos
          .map((x) => ({
            type: OfferFileType.video,
            videoUrl: x.url,
          }))
          .filter((x) => x.videoUrl),
      ],
    }

    return apiService.put(`/offers/${offerId}/minimal`, data)
  }, [])
}

export const useGetManagedOffer = (id: string | undefined) => {
  const loader = useLoader()
  const [data, setData] = React.useState<ManagedOffer>()

  const load = React.useCallback(() => {
    apiService
      .get(`/offers/me/${id}`)
      .then((res) => res.data as ManagedOffer)
      .then(setData)
      .finally(loader.stop)
  }, [id])
  React.useEffect(() => {
    load()
  }, [load])

  return { loading: loader.isLoading, load, data }
}

export const useGetManagedOfferPresaleStatistics = () => {
  return React.useCallback(async (offerId: string) => {
    const result = await apiService
      .get(`/offers/me/${offerId}/presale-statistics`)
      .then((res) => res.data as OfferPresaleStatistics)
    return result
  }, [])
}

export const useGetManagedOfferPresaleWhitelists = () => {
  return React.useCallback(
    async (
      offerId: string,
      page: number,
      isPending: boolean,
      order?: PresaleOrderConfig | ApprovedRejectedOrderConfig,
      size = 8
    ) => {
      const query = {
        page,
        offset: size,
        order,
        isPending,
      } as { [key: string]: any }
      const result = await apiService
        .get(`/offers/${offerId}/whitelists`, { paramsSerializer }, query)
        .then((res) => res.data as PaginateResponse<OfferPresaleWhitelist>)

      return {
        hasMore: result.nextPage !== null,
        items: result.items,

        totalPages: result.totalPages,
        totalItems: result.totalItems,
      }
    },
    []
  )
}

export const useApproveRandomPresaleWhitelists = () => {
  const loader = useLoader(false)
  const [error, setError] = React.useState<string>()

  const load = React.useCallback((offerId: string, count: number) => {
    loader.start()
    setError('')
    return apiService
      .patch(`/offers/${offerId}/approve/random`, { count })
      .catch((err) => setError(err.message))
      .finally(loader.stop)
  }, [])
  return { isLoading: loader.isLoading, load, error }
}

export const useManagePresaleWhitelists = () => {
  const loader = useLoader(false)
  const [error, setError] = React.useState<string>()

  const load = React.useCallback((offerId: string, body: ManageOfferBody) => {
    loader.start()
    setError('')
    return apiService
      .patch(`/offers/${offerId}/whitelists`, body)
      .catch((err) => setError(err.message))
      .finally(loader.stop)
  }, [])
  return { isLoading: loader.isLoading, load, error }
}

/* This method is used to parse params when order might be present, as axios format it with brackets */
const paramsSerializer = (params: { [key: string]: any }) => {
  if (!Object.keys(params).length) {
    return ''
  }
  const { order, ...rest } = params
  let query = Object.entries(rest)
    .filter(([, value]) => !!value)
    .map(([key, value]) => `${key}=${value}`)
  if (order) {
    const allowedValues = Object.values(OrderTypes)
    query = query.concat(
      Object.entries(order as { [key: string]: any })
        .filter(([, value]) => allowedValues.includes(value))
        .map(([key, value]) => `order=${key}=${value}`)
    )
  }
  return query.join('&')
}

export const useGenericPaginationFetch = (url: string) => {
  const loader = useLoader(false)
  const [data, setData] = React.useState<PaginationRes<any>>()
  const [error, setError] = React.useState<string | undefined>()

  const load = React.useCallback(
    (query: { [key: string]: any }) => {
      loader.start()

      const params = query.order ? { paramsSerializer } : undefined
      apiService
        .get(url, params, query)
        .then((res) => {
          const formatted = {
            hasMore: res.data.nextPage !== null,
            items: res.data.items,
            totalPages: res.data.totalPages,
            totalItems: res.data.totalItems,
          } as PaginationRes<any>
          setData(formatted)
        })
        .catch((err) => setError(err.message))
        .finally(() => loader.stop())
    },
    [url]
  )

  return { isLoading: loader.isLoading, error, load, data }
}

export const useGetManagedOfferInvestments = (id: string | undefined) => {
  return useGenericPaginationFetch(`/offers/${id}/investments`)
}

export const useOnChangeOrder = (
  order: AbstractOrder,
  setOrder: (foo: AbstractOrder) => void,
  setPage?: (foo: number) => void
) => {
  const onChangeOrder = React.useCallback(
    (key: string) => {
      const current = Object.keys(order)[0]
      if (!current || current !== key) {
        setOrder({ [key]: 'ASC' })
      }
      if (current === key) {
        const value = Object.values(order)[0]
        const manner = !value ? 'ASC' : value === 'ASC' ? 'DESC' : null

        setOrder({ [current]: manner })
      }
      if (setPage) setPage(1)
    },
    [order, setOrder, setPage]
  )

  return onChangeOrder
}

enum GenericMethods {
  post = 'post',
  put = 'put',
  patch = 'patch',
}

export const useGenericPost = (url: string | ((foo: any) => string), method: GenericMethods = GenericMethods.post) => {
  const loader = useLoader(false)
  const [error, setError] = React.useState<string>()

  const load = React.useCallback(
    (body?: any, successCallback?: () => void) => {
      loader.start()
      setError('')
      const apiUrl = typeof url === 'string' ? url : url(body)
      return apiService[method](apiUrl, body)
        .then(() => {
          if (successCallback) successCallback()
        })
        .catch((err) => setError(err.message))
        .finally(() => {
          loader.stop()
        })
    },
    [url]
  )
  return { isLoading: loader.isLoading, load, error }
}

export const useTriggerUserClaim = (offerId?: string) => {
  return useGenericPost(`/offers/${offerId}/trigger-claim`)
}

export const useTriggerIssuerClaim = (offerId?: string) => {
  return useGenericPost(`/offers/${offerId}/issuer-claim`)
}

export const useEditTimeframe = (offerId?: string) => {
  return useGenericPost(`/offers/${offerId}/timeframe`, GenericMethods.put)
}

export const usePinOffer = () => {
  const getUrl = (issuanceId: number) => `/offers/${issuanceId}/pin`
  return useGenericPost(getUrl, GenericMethods.patch)
}
