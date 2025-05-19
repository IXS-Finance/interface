import { ExtractedFields } from 'components/LaunchpadIssuance/IssuanceReport/Table/helpers'
import { IssuanceStatus } from 'components/LaunchpadIssuance/types'
import React, { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import apiService from 'services/apiService'
import { whitelist } from 'services/apiUrls'
import { IssuanceDataFilter, WhitelistFilter } from 'services/types'
import { AppDispatch } from 'state'
import { useLoader } from 'state/launchpad/hooks'
import { PaginateResponse } from 'types/pagination'
import { deleteWhitelistedWallet, getWhitelistedWallets, saveWhitelistedWallet } from './actions'
import { emptyIssuanceDataStatistics } from './constants'
import { ChangesRequestedValues, IssuanceDataStatisticsDto, WhitelistWallet, WhitelistWalletPayload } from './types'

export interface UseDeleteWhitelistedArgs {
  onSuccess?: () => void
}
export type UseCreateWhitelistedArgs = UseDeleteWhitelistedArgs

export const useWhitelistWallet = ({ onSuccess }: UseCreateWhitelistedArgs) => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(async (offerId: string, data: WhitelistWalletPayload) => {
    dispatch(saveWhitelistedWallet.pending())
    try {
      await apiService.post(whitelist.add(offerId), data)
      onSuccess?.()
      dispatch(saveWhitelistedWallet.fulfilled())
    } catch (e) {
      dispatch(saveWhitelistedWallet.rejected({ errorMessage: (e as { message: string }).message }))
    }
  }, [])
}

export const useGetWhitelisted = () => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(async (offerId: string, filters: WhitelistFilter) => {
    dispatch(getWhitelistedWallets.pending())
    try {
      const result = await apiService.get(whitelist.get(offerId), undefined, filters)

      dispatch(getWhitelistedWallets.fulfilled({ data: result.data as PaginateResponse<WhitelistWallet> }))
    } catch (e) {
      dispatch(getWhitelistedWallets.rejected({ errorMessage: (e as { message: string }).message }))
    }
  }, [])
}

export interface UseDeleteWhitelistedArgs {
  onSuccess?: () => void
}
export const useDeleteWhitelisted = ({ onSuccess }: UseDeleteWhitelistedArgs) => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    async (offerId: string, walletAddress: string) => {
      dispatch(deleteWhitelistedWallet.pending())
      try {
        await apiService.delete(whitelist.delete(offerId, walletAddress), undefined)
        onSuccess?.()
        dispatch(deleteWhitelistedWallet.fulfilled())
      } catch (e) {
        dispatch(deleteWhitelistedWallet.rejected({ errorMessage: (e as { message: string }).message }))
      }
    },
    [onSuccess]
  )
}

export const useGetIssuancesReport = ({ page = '1', tab = '', offset = '11', issuanceId = '' }: IssuanceDataFilter) => {
  const loader = useLoader()
  const populateData = (data: IssuanceDataStatisticsDto) => {
    setData(data)
  }
  const [data, setData] = React.useState<IssuanceDataStatisticsDto>(emptyIssuanceDataStatistics)
  const load = React.useCallback(() => {
    if (!tab) return
    loader.start()
    return apiService
      .get(`issuances/report`, undefined, { page: isNaN(Number(page)) ? '1' : page, tab, offset, issuanceId })
      .then((res) => res.data as IssuanceDataStatisticsDto)
      .then(populateData)
      .then(loader.stop)
  }, [issuanceId, offset, page, tab])

  useEffect(() => {
    load()
  }, [issuanceId, page, offset, tab])

  return { data, load, loading: loader.isLoading }
}

interface UseExtractReportArgs {
  fields: ExtractedFields
  tab: string
  issuanceId: string
}

export const useExtractReport = () => {
  const loader = useLoader()

  const saveCsv = (csvData: any, issuanceId: string) => {
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `issuance-${issuanceId}-data.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const extract = React.useCallback(({ fields, tab, issuanceId }: UseExtractReportArgs) => {
    loader.start()
    return apiService
      .post(`issuances/extract-report`, { fields, tab, issuanceId })
      .then((res) => res.data as any)
      .then((data) => saveCsv(data, issuanceId))
      .then(loader.stop)
  }, [])

  return { extract }
}

export const useBackLink = (issuanceId: string) => {
  const history = useHistory()
  return () => history.push(issuanceId === 'all' ? '/issuance' : `/issuance/manage/${issuanceId}`)
}

export const useDeployOffer = (offerId?: string) => {
  return React.useCallback(
    (feeRate?: string | number, distributionControllerAddress?: string) => {
      if (!offerId) {
        return
      }
      return apiService.post(`offers/blockchain/deploy/${offerId}`, {
        feeRate: Number(feeRate),
        distributionControllerAddress,
      })
    },
    [offerId]
  )
}
export const useConfirmFee = (offerId?: string) => {
  return React.useCallback(
    (feeRate?: string | number) => {
      if (!offerId) {
        return
      }
      return apiService.put(`offers/${offerId}/set-fee-rate`, { feeRate: Number(feeRate) })
    },
    [offerId]
  )
}

export const useManageVetting = (vettingId?: string) => {
  return React.useCallback(
    (status: IssuanceStatus, reasons?: ChangesRequestedValues) => {
      if (!vettingId) {
        return
      }
      return apiService.patch(`vettings/${vettingId}/review`, { status, ...reasons })
    },
    [vettingId]
  )
}

export const useApproveVetting = (vettingId?: string) => {
  const manageVetting = useManageVetting(vettingId)
  return useCallback(() => manageVetting(IssuanceStatus.approved), [manageVetting])
}

export const useRejectVetting = (vettingId?: string) => {
  const manageVetting = useManageVetting(vettingId)
  return useCallback(
    (reasons: ChangesRequestedValues) => manageVetting(IssuanceStatus.declined, reasons),
    [manageVetting]
  )
}

export const useRequestChanges = (vettingId?: string) => {
  const manageVetting = useManageVetting(vettingId)
  return useCallback(
    (reasons: ChangesRequestedValues) => manageVetting(IssuanceStatus.changesRequested, reasons),
    [manageVetting]
  )
}

export const useReviewVetting = (vettingId?: string) => {
  const approve = useApproveVetting(vettingId)
  const reject = useRejectVetting(vettingId)
  const requestChanges = useRequestChanges(vettingId)
  return { approve, reject, requestChanges }
}

export const useManageOffer = (offerId?: string) => {
  return React.useCallback(
    (status: IssuanceStatus, reasons?: ChangesRequestedValues) => {
      if (!offerId) {
        return
      }
      return apiService.patch(`offers/${offerId}/review`, { status, ...reasons })
    },
    [offerId]
  )
}

export const useApproveOffer = (offerId?: string) => {
  const manageOffer = useManageOffer(offerId)
  return useCallback(() => manageOffer(IssuanceStatus.approved), [manageOffer])
}

export const useRejectOffer = (offerId?: string) => {
  const manageOffer = useManageOffer(offerId)
  return useCallback((reasons: ChangesRequestedValues) => manageOffer(IssuanceStatus.declined, reasons), [manageOffer])
}

export const useRequestOfferChanges = (offerId?: string) => {
  const manageOffer = useManageOffer(offerId)
  return useCallback(
    (reasons: ChangesRequestedValues) => manageOffer(IssuanceStatus.changesRequested, reasons),
    [manageOffer]
  )
}

export const useReviewOffer = (offerId?: string) => {
  const approve = useApproveOffer(offerId)
  const reject = useRejectOffer(offerId)
  const requestChanges = useRequestOfferChanges(offerId)
  return { approve, reject, requestChanges }
}
