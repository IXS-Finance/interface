import { API_URL } from 'config'
import { Asset } from 'state/launchpad/types'

export const getPublicAssetUrl = (asset?: Pick<Asset, 'uuid'>): string => {
  const storageUrl = API_URL + 'storage/file/public/'
  return `${storageUrl}${asset?.uuid}`
}

export const getProtectedAssetUrl = (asset?: Pick<Asset, 'uuid'>): string => {
  const storageUrl = API_URL + 'storage/file/protected/'
  return `${storageUrl}${asset?.uuid}`
}
