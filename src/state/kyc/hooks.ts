import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import apiService from 'services/apiService'
import { kyc } from 'services/apiUrls'
import { AppDispatch, AppState } from 'state'
import { BROKER_DEALERS_STATUS } from 'state/brokerDealer/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useAuthState } from 'state/auth/hooks'
import {
  createKYC,
  exportCSV,
  fetchGetMyKyc,
  setExportCSVOptionsRowLimit,
  toggleExportCSVModal,
  updateKYC,
} from './actions'

import { LONG_WAIT_RESPONSE } from 'constants/misc'
import { KYCStatuses } from 'pages/KYC/enum'
import React from 'react'
import saveCsvFile from 'utils/saveCsvFile'
import { KycFilter } from 'components/AdminKyc'

const individualKYCFiles = ['proofOfAddress', 'proofOfIdentity', 'selfie', 'evidenceOfAccreditation']
const corporateKYCFiles = [
  'beneficialOwnersAddress',
  'beneficialOwnersIdentity',
  'corporateMembersIdentity',
  'authorizationDocuments',
  'corporateDocuments',
  'financialDocuments',
  'authorizationDocuments',
  'authorizationIdentity',
]

export const invalidateKycQueries = async (queryClient: any, account: string | null) => {
  await queryClient.invalidateQueries({
    queryKey: ['myKyc'],
    predicate: (query: any) => query.queryKey[0] === 'myKyc' && query.queryKey[1] === (account || 'anonymous'),
  })
}

export function useKYCState() {
  return useSelector<AppState, AppState['kyc']>((state) => state.kyc)
}

export const getMyKyc = async () => {
  try {
    const result = await apiService.get(kyc.getMyKyc)
    return result.data
  } catch (e) {
    // Don't wrap the error, let React Query handle the original error for retry logic
    throw e
  }
}

export const getStatusStats = async (params?: KycFilter) => {
  try {
    // @ts-ignore
    const result = await apiService.get(kyc.getStatusStats, undefined, params)
    return result.data
  } catch (e) {
    console.log(e)
  }
}

export const getCynopsisRisks = async (address: string) => {
  try {
    const result = await apiService.get(kyc.cynopsisRisks(address))
    return result.data
  } catch (e) {
    console.log(e)
  }
}

export const getIndividualProgress = async () => {
  try {
    const result = await apiService.get(kyc.individualProgress)
    return result.data
  } catch (e) {
    console.log(e)
  }
}

export const getCorporateProgress = async () => {
  try {
    const result = await apiService.get(kyc.corporateProgress)
    return result.data
  } catch (e) {
    console.log(e)
  }
}

export const useEmailVerify = () => {
  return React.useCallback(async (email: string, identity: string) => {
    try {
      const response = await apiService.post(`/kyc/registerEmail`, { email, identity })
      console.log(response)
      return { success: true, response } // Return success and response
    } catch (error: any) {
      // Handle errors here
      console.error(error)
      return { success: false, error }
    }
  }, [])
}

export const useEmailEdit = () => {
  return React.useCallback(async (email: string, identity: string) => {
    try {
      const response = await apiService.post(`/kyc/editEmail `, { email, identity })
      console.log(response)
      return { success: true, response } // Return success and response
    } catch (error: any) {
      // Handle errors here
      console.error(error)
      return { success: false, error }
    }
  }, [])
}

export const useGenerateEmailVerifyCode = () => {
  return React.useCallback(
    async (personalInfo: {
      firstName: string
      middleName: string
      lastName: string
      email: string
      referralCode?: any
    }) => {
      try {
        const response = await apiService.post(`/kyc/individual/registration`, personalInfo)
        return { success: true, response }
      } catch (error: any) {
        console.error(error)
        return { success: false, error }
      }
    },
    []
  )
}

export const useGenerateSecondaryEmailVerifyCode = () => {
  return React.useCallback(async (type: string, email: string) => {
    const payload = {
      type: type,
      data: {
        email: email,
      },
    }
    try {
      const response = await apiService.put(`/kyc/individual/secondaryContact`, payload)
      return { success: true, response }
    } catch (error: any) {
      console.error(error)
      return { success: false, error }
    }
  }, [])
}

export const useVerifyIndividualCode = () => {
  return React.useCallback(async (otp: string) => {
    try {
      const response = await apiService.put(`/kyc/individual/verifyEmail`, { otp })
      console.log(response)
      return { success: true, response }
    } catch (error: any) {
      console.error(error)
      return { success: false, error }
    }
  }, [])
}

export const useVerifySecondaryEmailCode = () => {
  return React.useCallback(async (otp: string) => {
    try {
      const response = await apiService.put(`/kyc/individual/verifySecondaryEmail`, { otp })
      console.log(response)
      return { success: true, response }
    } catch (error: any) {
      console.error(error)
      return { success: false, error }
    }
  }, [])
}

export const useSocialAccountVerificationStatus = () => {
  return React.useCallback(async () => {
    try {
      const response = await apiService.get(`/kyc/individual/socialAccountVerificationStatus`)
      console.log(response)
      const { status } = response.data
      return { success: true, status }
    } catch (error) {
      console.error(error)
      return { success: false, error }
    }
  }, [])
}
export const useVerifyIdentity = () => {
  function verifyIdentity() {
    return apiService.put(`/kyc/individual/verifyIdentity`, {})
  }

  function secondaryContact() {
    return apiService.put(`/kyc/individual/secondaryContact`, { type: 'proof_of_address', data: {} })
  }

  return {
    verifyIdentity,
    secondaryContact,
  }
}

export const useEmailVerifyCode = () => {
  return React.useCallback(async (code: string) => {
    try {
      const response = await apiService.put(`/kyc/verifyEmail`, { code })
      console.log(response)
      return { success: true, response } // Return success and response
    } catch (error: any) {
      console.error(error)
      return { success: false, error } // Return failure and error
    }
  }, [])
}

export const useResendEmail = () => {
  return React.useCallback(async (emailType: string) => {
    try {
      const response = await apiService.post('/kyc/resendEmailCode', { emailType })
      return { success: true, response }
    } catch (error: any) {
      console.error(error)
      return { success: false, error }
    }
  }, [])
}

export const createIndividualKYC = async (newKYC: any, draft = false) => {
  const formData = new FormData()

  for (const key in newKYC) {
    if (individualKYCFiles.includes(key)) {
      newKYC[key].forEach((item: any) => {
        formData.append(`${key}`, item)
      })
    } else if (['removedDocuments', 'removedTaxDeclarations'].some((x) => x === key)) {
      formData.append(key, JSON.stringify(newKYC[key]))
    } else if (typeof newKYC[key] === 'object' && newKYC[key].length) {
      const entries = (newKYC[key] as Array<any>)
        .map((x: any, idx: number) =>
          Object.entries(x).map(([objKey, value]) => ({ key: `${key}[${idx}][${objKey}]`, value: value as string }))
        )

        .reduce((acc, e) => [...acc, ...e], [])

      for (const entry of entries) {
        formData.append(entry.key, entry.value as string)
      }
    } else if (typeof newKYC[key] === 'object') {
      const entries = Object.entries(newKYC[key]).map(([objKey, value]) => ({
        key: `${key}[${objKey}]`,
        value: value as string,
      }))

      for (const entry of entries) {
        formData.append(entry.key, entry.value as string)
      }
    } else {
      formData.append(key, newKYC[key])
    }
  }

  try {
    const result = await apiService.post(draft ? kyc.createIndividualDraft : kyc.createIndividual, formData)
    return result.data
  } catch (e: any) {
    if (e.message === LONG_WAIT_RESPONSE) {
      return { id: 1, status: 'pending' }
    }

    throw new Error(e.message)
  }
}

export const createCorporateKYC = async (newKYC: any, draft = false) => {
  const formData = new FormData()
  for (const key in newKYC) {
    if (newKYC[key]) {
      if (corporateKYCFiles.includes(key)) {
        newKYC[key].forEach((item: any) => {
          formData.append(`${key}`, item)
        })
      } else if (['removedDocuments', 'removedBeneficialOwners'].some((x) => x === key)) {
        formData.append(key, JSON.stringify(newKYC[key]))
      } else if (typeof newKYC[key] === 'object' && newKYC[key].length) {
        const entries = (newKYC[key] as Array<any>)
          .map((x: any, idx: number) =>
            Object.entries(x).map(([objKey, value]) => ({ key: `${key}[${idx}][${objKey}]`, value: value as string }))
          )

          .reduce((acc, e) => [...acc, ...e], [])

        for (const entry of entries) {
          formData.append(entry.key, entry.value as string)
        }
      } else if (typeof newKYC[key] === 'object') {
        const entries = Object.entries(newKYC[key]).map(([objKey, value]) => ({
          key: `${key}[${objKey}]`,
          value: value as string,
        }))

        for (const entry of entries) {
          formData.append(entry.key, entry.value as string)
        }
      } else {
        formData.append(key, newKYC[key])
      }
    }
  }

  try {
    const result = await apiService.post(draft ? kyc.createCorporateDraft : kyc.createCorporate, formData)
    return result.data
  } catch (e: any) {
    if (e.message === LONG_WAIT_RESPONSE) {
      return { id: 1, status: 'pending' }
    }

    throw new Error(e.message)
  }
}

// export const createCorporateKYC = async (newKYC: any) => {
//   const formData = new FormData()

//   for (const key in newKYC) {
//     if (corporateKYCFiles.includes(key)) {
//       newKYC[key].forEach((item: any) => {
//         formData.append(`${key}`, item)
//       })
//     } else {
//       if (key === 'removedDocuments' || key === 'removedBeneficialOwners') {
//         formData.append(key, JSON.stringify(newKYC[key]))
//       } else {
//         formData.append(key, newKYC[key])
//       }
//     }
//   }

//   try {
//     const result = await apiService.post(kyc.createCorporate, formData)
//     return result.data
//   } catch (e: any) {
//     if (e.message === LONG_WAIT_RESPONSE) {
//       return { id: 1, status: 'pending' }
//     }

//     throw new Error(e.message)
//   }
// }

export const updateIndividualKYC = async (kycId: number, newKYC: any, draft = false) => {
  const formData = new FormData()
  for (const key in newKYC) {
    if (individualKYCFiles.includes(key)) {
      newKYC[key].forEach((item: any) => {
        if (item.uuid || item.asset?.uuid) {
          console.log('not binary')
        } else {
          formData.append(`${key}`, item)
        }
      })
    } else {
      if (['removedDocuments', 'removedTaxDeclarations'].some((x) => x === key)) {
        formData.append(key, JSON.stringify(newKYC[key]))
      } else if (typeof newKYC[key] === 'object' && newKYC[key].length) {
        const entries = (newKYC[key] as Array<any>)
          .map((x: any, idx: number) =>
            Object.entries(x).map(([objKey, value]) => ({ key: `${key}[${idx}][${objKey}]`, value: value as string }))
          )

          .reduce((acc, e) => [...acc, ...e], [])

        for (const entry of entries) {
          if (entry.value) {
            formData.append(entry.key, entry.value as string)
          }
        }
      } else if (typeof newKYC[key] === 'object') {
        const entries = Object.entries(newKYC[key]).map(([objKey, value]) => ({
          key: `${key}[${objKey}]`,
          value: value as string,
        }))

        for (const entry of entries) {
          if (entry.value) {
            formData.append(entry.key, entry.value as string)
          }
        }
      } else {
        formData.append(key, newKYC[key])
      }
    }
  }

  try {
    const result = draft
      ? await apiService.post(kyc.updateIndividual(kycId, draft), formData)
      : await apiService.put(kyc.updateIndividual(kycId, draft), formData)
    return result.data
  } catch (e) {
    console.log(e)
  }
}

// export const updateCorporateKYC = async (kycId: number, newKYC: any) => {
//   const formData = new FormData()

//   for (const key in newKYC) {
//     if (corporateKYCFiles.includes(key)) {
//       newKYC[key].forEach((item: any) => {
//         if (item.uuid || item.asset?.uuid) {
//           console.log('not binary')
//         } else {
//           formData.append(`${key}`, item)
//         }
//       })
//     } else {
//       if (key === 'removedDocuments' || key === 'removedBeneficialOwners') {
//         formData.append(key, JSON.stringify(newKYC[key]))
//       } else {
//         formData.append(key, newKYC[key])
//       }
//     }
//   }

//   try {
//     const result = await apiService.put(kyc.updateCorporate(kycId), formData)
//     return result.data
//   } catch (e) {
//     console.log(e)
//   }
// }

export const updateCorporateKYC = async (kycId: number, newKYC: any, draft = false) => {
  const formData = new FormData()
  for (const key in newKYC) {
    if (newKYC[key]) {
      if (corporateKYCFiles.includes(key)) {
        newKYC[key].forEach((item: any) => {
          if (item) {
            if (item.uuid || item.asset?.uuid) {
              console.log('not binary')
            } else {
              formData.append(`${key}`, item)
            }
          }
        })
      } else {
        if (['removedDocuments', 'removedBeneficialOwners'].some((x) => x === key)) {
          formData.append(key, JSON.stringify(newKYC[key]))
        } else if (typeof newKYC[key] === 'object' && newKYC[key].length) {
          const entries = (newKYC[key] as Array<any>)
            .map((x: any, idx: number) =>
              Object.entries(x).map(([objKey, value]) => ({ key: `${key}[${idx}][${objKey}]`, value: value as string }))
            )

            .reduce((acc, e) => [...acc, ...e], [])

          for (const entry of entries) {
            if (entry.value) {
              formData.append(entry.key, entry.value as string)
            }
          }
        } else if (typeof newKYC[key] === 'object') {
          const entries = Object.entries(newKYC[key]).map(([objKey, value]) => ({
            key: `${key}[${objKey}]`,
            value: value as string,
          }))

          for (const entry of entries) {
            if (entry.value) {
              formData.append(entry.key, entry.value as string)
            }
          }
        } else {
          formData.append(key, newKYC[key])
        }
      }
    }
  }

  try {
    if (formData.get('taxIdAvailable') === null) {
      formData.set('taxIdAvailable', newKYC.taxIdAvailable)
    }
    if (formData.get('taxNumber') === null) {
      formData.set('taxNumber', newKYC.taxNumber)
    }
    const result = draft
      ? await apiService.post(kyc.createCorporateDraft, formData)
      : await apiService.put(kyc.updateCorporate(kycId, draft), formData)
    return result.data
  } catch (e) {
    console.log(e)
  }
}

export function useCreateIndividualKYC() {
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()
  const { account } = useActiveWeb3React()
  const callback = useCallback(
    async (newKYC: any, draft = false) => {
      try {
        dispatch(createKYC.pending())
        const data = await createIndividualKYC(newKYC, draft)
        dispatch(createKYC.fulfilled(data))
        // Invalidate and refetch KYC data for the current account
        await invalidateKycQueries(queryClient, account)
        return data
      } catch (error: any) {
        if (error.message === LONG_WAIT_RESPONSE) {
          const data = { id: 1, status: KYCStatuses.DRAFT } as any
          dispatch(createKYC.fulfilled(data))
          return data
        }

        dispatch(createKYC.rejected({ errorMessage: 'Could not create individual kyc' }))
        return BROKER_DEALERS_STATUS.FAILED
      }
    },
    [dispatch, queryClient, account]
  )
  return callback
}

export function useCreateCorporateKYC() {
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()
  const { account } = useActiveWeb3React()
  const callback = useCallback(
    async (newKYC: any, draft = false) => {
      try {
        dispatch(createKYC.pending())
        const data = await createCorporateKYC(newKYC, draft)
        dispatch(createKYC.fulfilled(data))
        // Invalidate and refetch KYC data for the current account
        await invalidateKycQueries(queryClient, account)
        return data
      } catch (error: any) {
        if (error.message === LONG_WAIT_RESPONSE) {
          const data = { id: 1, status: KYCStatuses.DRAFT } as any
          dispatch(createKYC.fulfilled(data))
          return data
        }

        dispatch(createKYC.rejected({ errorMessage: 'Could not create individual kyc' }))
        return BROKER_DEALERS_STATUS.FAILED
      }
    },
    [dispatch, queryClient, account]
  )
  return callback
}

export function useUpdateIndividualKYC() {
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()
  const { account } = useActiveWeb3React()

  const callback = useCallback(
    async (kycId: number, newKYC: any, draft = false) => {
      try {
        dispatch(updateKYC.pending())
        const data = await updateIndividualKYC(kycId, newKYC, draft)
        dispatch(updateKYC.fulfilled(data))
        // Invalidate and refetch KYC data for the current account
        await invalidateKycQueries(queryClient, account)
        return data
      } catch (error: any) {
        dispatch(updateKYC.rejected({ errorMessage: 'Could not update individual kyc' }))
        return BROKER_DEALERS_STATUS.FAILED
      }
    },
    [dispatch, queryClient, account]
  )
  return callback
}

export function useUpdateCorporateKYC() {
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()
  const { account } = useActiveWeb3React()

  const callback = useCallback(
    async (kycId: number, newKYC: any, draft = false) => {
      try {
        dispatch(updateKYC.pending())
        const data = await updateCorporateKYC(kycId, newKYC, draft)
        dispatch(updateKYC.fulfilled(data))
        // Invalidate and refetch KYC data for the current account
        await invalidateKycQueries(queryClient, account)
        return data
      } catch (error: any) {
        dispatch(updateKYC.rejected({ errorMessage: 'Could not update individual kyc' }))
        return BROKER_DEALERS_STATUS.FAILED
      }
    },
    [dispatch, queryClient, account]
  )
  return callback
}

export function useGetMyKycQuery() {
  const dispatch = useDispatch<AppDispatch>()
  const { account } = useActiveWeb3React()
  const { token } = useAuthState()

  return useQuery({
    queryKey: ['myKyc', account || 'anonymous', token || 'no-token'],
    queryFn: async () => {
      dispatch(fetchGetMyKyc.pending())
      try {
        const data = await getMyKyc()
        dispatch(fetchGetMyKyc.fulfilled(data))
        return data
      } catch (error: any) {
        dispatch(fetchGetMyKyc.rejected({ errorMessage: 'Could not get kyc' }))
        // Let React Query handle the error for retry logic
        throw error
      }
    },
    enabled: !!token, // Only run query when user is authenticated (has token)
    refetchInterval: 300000, // Refetch every 5 minutes
    refetchIntervalInBackground: true, // Continue refetching even when window is not focused
    staleTime: 0, // Data is considered stale immediately
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors, let the token refresh handle it
      if (error?.response?.status === 401 || error?.status === 401) {
        return false
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

// Custom hook to handle KYC query with better 401 recovery
export function useKycQueryWithAuthRecovery() {
  const { token } = useAuthState()
  const query = useGetMyKycQuery()

  // When token changes (user logs in after 401), refetch the query
  useEffect(() => {
    if (token && query.isError) {
      // If we have a token and the query was in error state, retry
      query.refetch()
    }
  }, [token, query.isError, query.refetch])

  return query
}

export const exportCSVApi = async (filters: KycFilter) => {
  return apiService
    .post(kyc.exportCSV, filters)
    .then((res) => res.data as any)
    .then((data) => saveCsvFile(data, `kyc-${new Date().getTime()}-data`))
}

export function useToggleExportCSVModal() {
  const dispatch = useDispatch<AppDispatch>()
  const callback = useCallback(
    (open: boolean) => {
      dispatch(toggleExportCSVModal({ open }))
    },
    [dispatch]
  )
  return callback
}

export function useSetExportCSVOptionsRowLimit() {
  const dispatch = useDispatch<AppDispatch>()
  const callback = useCallback(
    (rowLimit: number) => {
      dispatch(setExportCSVOptionsRowLimit({ rowLimit }))
    },
    [dispatch]
  )
  return callback
}

export function useExportCSV() {
  const dispatch = useDispatch<AppDispatch>()
  const callback = useCallback(
    async (filters: KycFilter) => {
      try {
        dispatch(exportCSV.pending())
        const data = await exportCSVApi(filters)
        dispatch(exportCSV.fulfilled(data))
        toast.success('CSV file has been downloaded.')
        return data
      } catch (error: any) {
        dispatch(exportCSV.rejected({ errorMessage: 'Could not export csv' }))
        toast.error('Could not export csv')
        return false
      }
    },
    [dispatch]
  )
  return callback
}
