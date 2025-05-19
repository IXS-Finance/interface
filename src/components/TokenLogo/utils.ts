import { Asset } from 'state/launchpad/types'

const apiUrl = process.env.REACT_APP_API_URL

export const getPublicAssetUrl = (asset?: Pick<Asset, 'uuid'>): string => {
  const storageUrl = apiUrl + 'storage/file/public/'
  return `${storageUrl}${asset?.uuid}`
}
