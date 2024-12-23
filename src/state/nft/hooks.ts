import { t } from '@lingui/macro'
import NFT_CREATE_ABI from 'abis/nft-contract-create.json'
import NFT_ABI from 'abis/nft-contract.json'
import axios from 'axios'
import NFT_BYTE_CODE from 'byte-code/nft-contract-byte-code.json'
import { BigNumber, Contract } from 'ethers'
import * as H from 'history'
import { getNftContract, useNftContract } from 'hooks/useContract'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileWithPath } from 'react-dropzone'
import { useDispatch, useSelector } from 'react-redux'
import apiService from 'services/apiService'
import { nft } from 'services/apiUrls'
import { AppDispatch, AppState } from 'state'
import { useShowError } from 'state/application/hooks'
import { useAppDispatch } from 'state/hooks'
import { importNftCollection, setCollections, setCollectionsLoading, setCreateNftLoading } from 'state/nft/actions'
import {
  setActiveTraitType,
  setCollection,
  setDescription,
  setFile,
  setFreeze,
  setLevels,
  setLink,
  setMaxSupply,
  setName,
  setNewCollectionName,
  setNSFW,
  setPreview,
  setProperties,
  setSelectedContractAddress,
  setStats,
  setClearState,
  setCollectionDescription,
  setCollectionLogo,
} from 'state/nft/assetForm.actions'
import {
  setBanner,
  setCover,
  setDescription as setCollectionDescrition,
  setLogo,
  setName as setCollectionName,
  setMaxSupply as setCollectionMaxSupply,
  setClearCollectionState,
} from './collectionForm.actions'

import {
  AssetForm,
  CollectionFullCreateProps,
  CollectionUpdateProps,
  NFTCollection,
  NftCreateProps,
  NumericTrait,
  Trait,
  TraitType,
} from 'state/nft/types'
import { useTransactionAdder } from 'state/transactions/hooks'
import { CollectionCreateProps } from './types'
import { groupKeyValues } from './utils'
import { Web3Provider } from '@ethersproject/providers'
import { adminOffset } from 'state/admin/constants'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3') // for some reason import Web3 from web3 didn't see eth module

export const createNftCollection = async (collectionDto: CollectionCreateProps) => {
  const { name, address, chainId } = collectionDto

  const formData = new FormData()
  formData.append('name', name)
  formData.append('address', address)
  formData.append('chainId', chainId as any)

  const result = await apiService.post(nft.createCollection, formData)
  return result.data
}

function buildCollectionFormData(dto: CollectionUpdateProps | CollectionFullCreateProps) {
  const { name, description, cover, logo, banner, chainId } = dto
  const formData = new FormData()
  if (name) {
    formData.append('name', name)
  }
  if (description) {
    formData.append('description', description)
  }
  if (cover) {
    formData.append('cover', cover, cover.name)
  }
  if (logo) {
    formData.append('logo', logo, logo.name)
  }
  if (banner) {
    formData.append('banner', banner, banner.name)
  }
  if (chainId) {
    formData.append('chainId', chainId as any)
  }
  return formData
}

export const updateNftCollection = async (collectionDto: CollectionUpdateProps, id: number) => {
  const formData = buildCollectionFormData(collectionDto)
  try {
    const result = await apiService.put(nft.updateCollection(id), formData)
    return result.data
  } catch (e) {
    console.error((e as Error).message)
  }
}

export const createFullNftCollection = async (collectionDto: CollectionFullCreateProps) => {
  const formData = buildCollectionFormData(collectionDto)
  formData.append('address', collectionDto.address)

  const result = await apiService.post(nft.createCollection, formData)

  return result.data
}

export const createNftAsset = async (nftDto: NftCreateProps) => {
  const { file, name, preview, freeze, keyValues } = nftDto
  const formData = new FormData()
  formData.append('file', file, file.name)
  formData.append('name', name)
  formData.append('freeze', JSON.stringify(freeze))
  formData.append('keyValues', JSON.stringify(keyValues))

  if (preview) {
    formData.append('preview', preview, preview.name)
  }

  const result = await apiService.post(nft.create, formData)
  return result.data
}

export const getCollections = async (address: string, chainId?: number) => {
  const collections = await apiService.get(nft.getCollections(address, chainId))
  return collections
}
export const getCollection = async (id?: number, chainId?: number, library?: Web3Provider) => {
  if (id === undefined || isNaN(id)) {
    return null
  }

  const collection = await apiService.get(nft.getCollection(id, chainId))

  if (collection.data) {
    const web3 = new Web3(library?.provider)
    const contract = new web3.eth.Contract(NFT_ABI, collection.data.address)

    const supply = await contract.methods.maxSupply().call()
    collection.data.maxSupply = supply
  }

  return collection.data
}

export function useCollection(id?: number) {
  const dispatch = useDispatch()
  const { chainId, library } = useActiveWeb3React()
  const [collection, setCollection] = useState<any | null>(null)
  useEffect(() => {
    async function fetchCollection() {
      try {
        dispatch(setCollectionsLoading({ loading: true }))
        const result = await getCollection(id, chainId, library)
        setCollection(result)
        dispatch(setCollectionsLoading({ loading: false }))
      } catch (e) {
        dispatch(setCollectionsLoading({ loading: false }))
      }
    }
    fetchCollection()
  }, [id])
  return collection
}

export function useNFTState(): AppState['nft'] {
  return useSelector<AppState, AppState['nft']>((state) => state.nft)
}

export const useCreateFullCollection = (history: H.History) => {
  const deployCollection = useDeployCollection()
  const { chainId } = useActiveWeb3React()

  return useCallback(
    async (args: any) => {
      const newContractAddress = await deployCollection({ name: args.name, maxSupply: args.maxSupply })
      if (newContractAddress) {
        await createFullNftCollection({ ...args, address: newContractAddress, chainId: chainId })
        history.push(`/nft/collections/${newContractAddress}`)
      }
    },
    [deployCollection, history, chainId]
  )
}

export const useUpdateFullCollection = (history: H.History) => {
  const { chainId } = useActiveWeb3React()

  return useCallback(
    async (args: any) => {
      await updateNftCollection(
        {
          cover: args.cover,
          logo: args.logo,
          banner: args.banner,
          name: args.name,
          description: args.description,
          chainId: chainId,
        },
        args.collectionId
      )

      history.push(`/nft/collections/${args.collectionAddress}`)
    },
    [history, chainId]
  )
}

export const useDeployCollection = () => {
  const { account, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const showError = useShowError()
  return useCallback(
    async ({ name, maxSupply }: { name: string; maxSupply: number }) => {
      try {
        if (!account || !library) {
          return
        }
        //Deploy contract
        const web3 = new Web3(library.provider)
        const contract = new web3.eth.Contract(NFT_ABI)
        const myContract = contract
          .deploy({
            data: NFT_BYTE_CODE['byteCode'],
            arguments: [maxSupply, `IXS-${name}`, 'IXSNFT'],
          })
          .encodeABI()

        const params = {
          from: account,
          gasLimit: Web3.utils.toHex('4500000 '),
          gasPrice: Web3.utils.toHex(Web3.utils.toWei('30', 'gwei')),
          data: myContract,
        }

        const result = await library.getSigner().sendTransaction(params)
        addTransaction(result, { summary: `Created your ${name} collection successfully` })
        const resp = await result.wait()
        return resp?.contractAddress
      } catch (e) {
        showError(`Could not create collection ${(e as Error)?.message}`)
      }
    },
    [account, addTransaction, library, showError]
  )
}

interface NftCollectionInfo extends NFTCollection {
  name: string
  supply: number
}

export const useNftCollection = (address: string) => {
  const { library, chainId } = useActiveWeb3React()

  const contract = useMemo(() => {
    const web3 = new Web3(library?.provider)
    return new web3.eth.Contract(NFT_ABI, address)
  }, [library, address])

  const [info, setInfo] = useState<NftCollectionInfo | undefined>(undefined)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const loading = useMemo(() => info === null, [info])

  const pageSize = adminOffset

  useEffect(() => {
    async function fetchCollectionInfo() {
      const collection = await apiService.get(nft.getCollectionByAddress(address, chainId))

      const name = collection.data.name
      //const name = await contract.methods.name().call() //get collection name from blockchain

      const supply = await contract.methods.totalSupply().call()

      setInfo({ name, supply: Number(supply), ...collection.data })

      if (supply === 0) {
        setHasMore(false)
      }
    }

    fetchCollectionInfo()
  }, [contract, setInfo, setHasMore])

  const fetchTokens = useCallback(async () => {
    if (loading || !info) {
      return
    }

    const size = (page + 1) * pageSize > info.supply ? info.supply - page * pageSize : pageSize

    if (size < 0) {
      return
    }

    const tokenIndexes = Array(size)
      .fill(null)
      .map((item, idx) => idx)

    const tokenURIs: string[] = await Promise.all(
      tokenIndexes.map((item) => contract.methods.tokenURI(BigNumber.from(item)).call())
    )

    setHasMore((page + 1) * pageSize <= info.supply)
    setPage(page + 1)

    return tokenURIs
  }, [contract.methods, hasMore, info, loading, page])

  return useMemo(() => ({ loading, info, hasMore, fetchTokens }), [fetchTokens, hasMore, info, loading])
}

export const useNftCollectionImport = (history: H.History) => {
  const { account, library, chainId } = useActiveWeb3React()
  const showError = useShowError()
  const dispatch = useDispatch()

  return useCallback(
    async ({ address }: { address: string }) => {
      if (!account || !library) {
        return
      }

      try {
        const web3 = new Web3(library?.provider)
        const contract = new web3.eth.Contract(NFT_CREATE_ABI, address)

        const [result, balance] = await Promise.all([
          contract.methods.owner().call(),
          contract.methods.balanceOf(account).call(),
        ])

        if (result !== account || balance === 0) {
          //showError('Cannot import collection, you are not the owner')
          history.push(`/nft/collections/${address}`)
          return
        }

        const name = await contract.methods.name().call()
        await createNftCollection({ name: name, address: address, chainId: chainId })
        //await apiService.post(nft.createCollection, { name, address, chainId })

        dispatch(importNftCollection({ id: address }))

        history.push(`/nft/collections/${address}`)
      } catch (e) {
        showError(`Error when importing NFT collection: ${(e as Error).message}`)
      }
    },
    [account, dispatch, history, library, showError]
  )
}

export const mintNFT = async ({
  nft,
  account,
  assetURI,
}: {
  nft: Contract | null
  assetURI: string
  account?: string | null
}) => {
  const res = await nft?.mint(account, assetURI, {
    gasLimit: 900000,
  })
  const params = await res.wait()
  const status = params.status
  // mint transaction will have status 0 if fail and 1 if success
  return Boolean(status)
}

export const useGetNFTDetails = (contractAddress?: string, itemId?: number) => {
  const nft = useNftContract(contractAddress)
  return useCallback(async () => {
    try {
      if (!nft || itemId === undefined) {
        return null
      }
      const URI = await nft?.tokenURI(itemId)
      const json = await axios.get(URI)
      const data = json.data
      return data
    } catch (e) {
      console.error('cant get uri')
    }
  }, [nft, itemId])
}

export function useAssetFormState(): AppState['assetForm'] {
  return useSelector<AppState, AppState['assetForm']>((state) => state.assetForm)
}
export function useCollectionFormState(): AppState['collectionForm'] {
  return useSelector<AppState, AppState['collectionForm']>((state) => state.collectionForm)
}
export function useCreateAssetActionHandlers(): {
  onSelectFile: (file: FileWithPath | null) => void
  onSelectPreview: (file: FileWithPath | null) => void
  onSetName: (name: string) => void
  onSetLink: (link: string) => void
  onSetFreeze: (freeze: boolean) => void
  onSetDescription: (description: string) => void
  onSetActiveTraitType: (trait: TraitType) => void
  onSetProperties: (properties: Array<Trait>) => void
  onSetLevels: (levels: Array<NumericTrait>) => void
  onSetStats: (stats: Array<NumericTrait>) => void
  onSetIsNSFW: (isNSFW: boolean) => void
  onSetCollection: (collection: NFTCollection | null) => void
  onSetNewCollectionName: (name: string) => void
  onSetActiveContractAddress: (address: string) => void
  onSetMaxSupply: (supply: number) => void
  onClearState: () => void
  onSetCollectionDescription: (name: string) => void
  onSetCollectionLogo: (file: FileWithPath | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onSelectFile = useCallback(
    (file: FileWithPath | null) => {
      dispatch(setFile({ file }))
    },
    [dispatch]
  )
  const onSelectPreview = useCallback(
    (file: FileWithPath | null) => {
      dispatch(setPreview({ file }))
    },
    [dispatch]
  )
  const onSetName = useCallback(
    (name: string) => {
      dispatch(setName({ name }))
    },
    [dispatch]
  )
  const onSetLink = useCallback(
    (link: string) => {
      dispatch(setLink({ link }))
    },
    [dispatch]
  )
  const onSetFreeze = useCallback(
    (freeze: boolean) => {
      dispatch(setFreeze({ freeze }))
    },
    [dispatch]
  )
  const onSetDescription = useCallback(
    (description: string) => {
      dispatch(setDescription({ description }))
    },
    [dispatch]
  )
  const onSetActiveTraitType = useCallback(
    (trait: TraitType) => {
      dispatch(setActiveTraitType({ trait }))
    },
    [dispatch]
  )
  const onSetProperties = useCallback(
    (properties: Array<Trait>) => {
      dispatch(setProperties({ properties }))
    },
    [dispatch]
  )
  const onSetLevels = useCallback(
    (levels: Array<NumericTrait>) => {
      dispatch(setLevels({ levels }))
    },
    [dispatch]
  )
  const onSetStats = useCallback(
    (stats: Array<NumericTrait>) => {
      dispatch(setStats({ stats }))
    },
    [dispatch]
  )
  const onSetIsNSFW = useCallback(
    (isNSFW: boolean) => {
      dispatch(setNSFW({ isNSFW }))
    },
    [dispatch]
  )
  const onSetCollection = useCallback(
    (collection: NFTCollection | null) => {
      dispatch(setCollection({ collection }))
    },
    [dispatch]
  )
  const onSetNewCollectionName = useCallback(
    (name: string) => {
      dispatch(setNewCollectionName({ name }))
    },
    [dispatch]
  )
  const onSetActiveContractAddress = useCallback(
    (address: string) => {
      dispatch(setSelectedContractAddress({ address }))
    },
    [dispatch]
  )
  const onSetMaxSupply = useCallback(
    (supply: number) => {
      dispatch(setMaxSupply({ supply }))
    },
    [dispatch]
  )
  const onClearState = useCallback(() => {
    dispatch(setClearState())
  }, [dispatch])

  const onSetCollectionDescription = useCallback(
    (description: string) => {
      dispatch(setCollectionDescription({ description }))
    },
    [dispatch]
  )
  const onSetCollectionLogo = useCallback(
    (file: FileWithPath | null) => {
      dispatch(setCollectionLogo({ file }))
    },
    [dispatch]
  )

  return {
    onSelectFile,
    onSelectPreview,
    onSetName,
    onSetLink,
    onSetFreeze,
    onSetDescription,
    onSetActiveTraitType,
    onSetProperties,
    onSetLevels,
    onSetStats,
    onSetIsNSFW,
    onSetCollection,
    onSetNewCollectionName,
    onSetActiveContractAddress,
    onSetMaxSupply,
    onClearState,
    onSetCollectionDescription,
    onSetCollectionLogo,
  }
}
export function useCollectionActionHandlers(): {
  onSetName: (name: string) => void
  onSelectCover: (file: FileWithPath | null) => void
  onSelectBanner: (file: FileWithPath | null) => void
  onSelectLogo: (file: FileWithPath | null) => void
  onSetDescription: (description: string) => void
  onSetMaxSupply: (maxSupply: number) => void
  onClearCollectionState: () => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onSelectCover = useCallback(
    (file: FileWithPath | null) => {
      dispatch(setCover({ file }))
    },
    [dispatch]
  )
  const onSelectBanner = useCallback(
    (file: FileWithPath | null) => {
      dispatch(setBanner({ file }))
    },
    [dispatch]
  )
  const onSelectLogo = useCallback(
    (file: FileWithPath | null) => {
      dispatch(setLogo({ file }))
    },
    [dispatch]
  )

  const onSetName = useCallback(
    (name: string) => {
      dispatch(setCollectionName({ name }))
    },
    [dispatch]
  )

  const onSetDescription = useCallback(
    (description: string) => {
      dispatch(setCollectionDescrition({ description }))
    },
    [dispatch]
  )

  const onSetMaxSupply = useCallback(
    (maxSupply: number) => {
      dispatch(setCollectionMaxSupply({ maxSupply }))
    },
    [dispatch]
  )

  const onClearCollectionState = useCallback(() => {
    dispatch(setClearCollectionState())
  }, [dispatch])

  return {
    onSelectBanner,
    onSelectCover,
    onSelectLogo,
    onSetName,
    onSetDescription,
    onSetMaxSupply,
    onClearCollectionState,
  }
}
export const useCreateNft = () => {
  const dispatch = useAppDispatch()
  return useCallback(async (nftDto: NftCreateProps) => {
    try {
      dispatch(setCreateNftLoading({ loading: true }))
      const data = await createNftAsset(nftDto)
      const assetURI = data?.metaUrl
      dispatch(setCreateNftLoading({ loading: false }))
      return assetURI
    } catch (e) {
      dispatch(setCreateNftLoading({ loading: false }))
      throw e
    }
  }, [])
}

export const useFetchMyCollections = () => {
  const dispatch = useAppDispatch()
  const { account } = useActiveWeb3React()
  return useCallback(
    async (chainId?: number) => {
      if (!account) {
        return
      }
      try {
        dispatch(setCollectionsLoading({ loading: true }))
        const response = await getCollections(account, chainId)
        const collections = response.data
        dispatch(setCollections({ collections }))
        dispatch(setCollectionsLoading({ loading: false }))
      } catch (e) {
        dispatch(setCollectionsLoading({ loading: false }))
        console.log(e)
      }
    },
    [account]
  )
}

const getCreateNftDto = ({
  name,
  file,
  preview,
  freeze,
  description,
  link,
  properties,
  stats,
  levels,
  isNSFW,
}: AssetForm): NftCreateProps | null => {
  if (!name || !file) {
    return null
  }
  const dto: NftCreateProps = {
    file,
    preview,
    name,
    keyValues: groupKeyValues({ description, link, properties, stats, levels, isNSFW }),
  }
  if (freeze) {
    dto.freeze = freeze
  }
  return dto
}

export const useCreateNftAssetForm = (history: H.History) => {
  const deployCollection = useDeployCollection()
  const createNFTAsset = useCreateNft()
  const form = useAssetFormState()
  const showError = useShowError()
  const { collection, newCollectionName, maxSupply, collectionDescription, collectionLogo } = form
  const { library, account, chainId } = useActiveWeb3React()
  return useCallback(async () => {
    try {
      // first we create the asset on backend (uploading all files, etc, and get an assetUri)
      const nftDto = getCreateNftDto(form)
      if (!nftDto) {
        return
      }
      const assetURI = await createNFTAsset(nftDto)
      // end creating asset

      // we create a contract instance either with the selected collection, or we create a new one on the spot
      let contractInstance
      let contractAddress
      //this is contract instance with test contract created by me
      // const contractInstance = getNftContract({
      //   addressOrAddressMap: '0xadc2e42d74f57028d7be2da41ba9643bdb70d99b',
      //   library,
      //   account,
      //   chainId,
      // })
      if (collection) {
        contractInstance = getNftContract({ addressOrAddressMap: collection?.address, library, account, chainId })
        contractAddress = collection.address
      } else {
        if (newCollectionName) {
          const newContractAddress = await deployCollection({
            name: newCollectionName,
            maxSupply,
          })
          contractAddress = newContractAddress
          if (contractAddress) {
            contractInstance = getNftContract({ addressOrAddressMap: contractAddress, library, account, chainId })
            await createFullNftCollection({
              name: newCollectionName,
              address: contractAddress,
              chainId: chainId,
              logo: collectionLogo,
              description: collectionDescription,
              cover: null,
              banner: null,
            })
          }
        }
      }
      // end getting contract instance
      if (contractInstance) {
         // @ts-ignore
        const mintStatus = await mintNFT({ nft: contractInstance, account, assetURI })

        if (!mintStatus) {
          const message = `Failed transaction. Please, try again or check your collection max supply settings`
          throw new Error(message)
          return
        }

        const supply = await contractInstance?.totalSupply()
        // supply shows how many. index starts at 0
        history.push(`/nft/collections/${contractAddress}/${supply - 1}`)
        //redirect to individual asset page
      }
    } catch (e) {
      const message = `An error occured when creating NFT: ${(e as Error).message}`

      showError(message)
      throw new Error(message)
    }
  }, [
    form,
    createNFTAsset,
    collection,
    library,
    account,
    chainId,
    newCollectionName,
    deployCollection,
    history,
    showError,
    maxSupply,
  ])
}
