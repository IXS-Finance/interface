import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

import { lsGet, lsSet } from 'lib/utils'
import config from 'lib/config'

export function useSwapAssets() {
  const { chainId } = useAccount()
  const networkId: any = chainId
  const configService = config[networkId]

  const [inputAsset, setInputAssetState] = useState<string>(
    lsGet(`inputAsset.${networkId}`, configService.tokens.InitialSwapTokens.input)
  )
  const [outputAsset, setOutputAssetState] = useState<string>(
    lsGet(`outputAsset.${networkId}`, configService.tokens.InitialSwapTokens.output)
  )

  useEffect(() => {
    lsSet(`inputAsset.${networkId}`, inputAsset)
  }, [inputAsset])

  useEffect(() => {
    lsSet(`outputAsset.${networkId}`, outputAsset)
  }, [outputAsset])

  const setInputAsset = (asset: string): void => {
    setInputAssetState(asset)
  }

  const setOutputAsset = (asset: string): void => {
    setOutputAssetState(asset)
  }

  return {
    inputAsset,
    outputAsset,
    setInputAsset,
    setOutputAsset,
  }
}
