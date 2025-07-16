import { Percent } from '@ixswap1/sdk-core'
import { Pair } from '@ixswap1/v2-sdk'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback } from 'react'
import ReactGA from 'react-ga'
import { useDerivedSwapInfo, useSwapState } from 'state/swap/hooks'
import {
  getAddressesIfChangedAmount,
  useAuthorizationsState,
  useClearAuthorization,
  useOpenModal,
  useSaveSwapTx,
  useSetSwapState,
  useSwapSecPairs,
} from 'state/swapHelper/hooks'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import useENSAddress from '../../hooks/useENSAddress'
import { useAuthorizationDigest, useSwapCallback, useSwapCallbackError } from '../../hooks/useSwapCallback'
import { Version } from '../../hooks/useToggledVersion'
import { useUserSingleHopOnly } from '../../state/user/hooks'

export function useHandleSwap({
  priceImpact,
  confirm,
  prompt
}: {
  priceImpact: Percent | undefined
  confirm: (options: { message: string }) => Promise<boolean>
  prompt: (options: { message: string; expectedValue: string }) => Promise<string | null>
}) {
  const { showConfirm, tradeToConfirm, setSwapState } = useSetSwapState()
  const { account } = useActiveWeb3React()
  const { toggledTrade: trade, allowedSlippage, shouldGetAuthorization } = useDerivedSwapInfo()
  const { recipient } = useSwapState()
  const { setOpenModal } = useOpenModal()
  const getSwapCallback = useSwapCallback(trade, allowedSlippage, recipient)
  const { address: recipientAddress } = useENSAddress(recipient)
  const saveSwapTx = useSaveSwapTx()
  const [singleHopOnly] = useUserSingleHopOnly()
  // if missing authorization, don't swap. after successful swap, clear all authorizations
  const authorizationDigest = useAuthorizationDigest(trade)
  const clearAuthorization = useClearAuthorization()
  const { secPairs: pairs } = useSwapSecPairs(trade)
  const { error: swapCallbackError } = useSwapCallbackError(trade, allowedSlippage, recipient)
  const authorizations = useAuthorizationsState()

  return useCallback(async () => {
    const { callback: swapCallback } = await getSwapCallback()
    const cleanUpAddresses = getAddressesIfChangedAmount({
      secPairs: pairs,
      trade,
      authorizations,
      allowedSlippage,
    })
    if (cleanUpAddresses.length) {
      clearAuthorization(cleanUpAddresses)
      setSwapState({
        attemptingTxn: false,
        tradeToConfirm,
        showConfirm: false,
        swapErrorMessage: `Amount changed. Please repeat authorization`,
        txHash: undefined,
      })
      return
    }

    if (swapCallbackError || !swapCallback || shouldGetAuthorization) {
      return
    }
    if (priceImpact && !(await confirmPriceImpactWithoutFee(priceImpact, confirm, prompt))) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    setOpenModal(true)
    const onlySecTokens: string[] = pairs
      .filter((pair): pair is Pair => !!pair)
      .map((pair) => pair.liquidityToken.address)
    try {
      if (authorizationDigest && onlySecTokens.length) {
        clearAuthorization(onlySecTokens)
      }
      const hash = await swapCallback()
      await saveSwapTx({ transactionHash: hash, addresses: onlySecTokens })
      setSwapState({
        attemptingTxn: false,
        tradeToConfirm: undefined,
        showConfirm: false,
        swapErrorMessage: undefined,
        txHash: hash,
      })

      ReactGA.event({
        category: 'Swap',
        action:
          recipient === null
            ? 'Swap w/o Send'
            : (recipientAddress ?? recipient) === account
            ? 'Swap w/o Send + recipient'
            : 'Swap w/ Send',
        label: [
          trade?.inputAmount?.currency?.symbol,
          trade?.outputAmount?.currency?.symbol,
          Version.v2,
          singleHopOnly ? 'SH' : 'MH',
        ].join('/'),
      })
    } catch (error) {
      setSwapState({
        attemptingTxn: false,
        tradeToConfirm,
        showConfirm,
        swapErrorMessage: (error as any)?.message as string,
        txHash: undefined,
      })
    }
  }, [
    priceImpact,
    getSwapCallback,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade,
    singleHopOnly,
    authorizationDigest,
    shouldGetAuthorization,
    clearAuthorization,
    swapCallbackError,
    pairs,
    setOpenModal,
    setSwapState,
    authorizations,
    allowedSlippage,
    saveSwapTx,
  ])
}
