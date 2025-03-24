import React, { useState } from 'react'
import Modal from '../../../common/modals'
import styled from 'styled-components'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { TokenPrices } from 'hooks/dex-v2/queries/useTokenPricesQuery'
import BalStack from '../../../common/BalStack'
import { isLessThanOrEqualTo } from 'lib/utils/validations'
import BalBtn from '../../../common/popovers/BalBtn'
import { bnum, isSameAddress, selectByAddress, formatWordListAsSentence } from 'lib/utils'
import TokenPriceInput from './TokenPriceInput'
import { Box, Flex } from 'rebass'
// import BalStack from '@/components/BalStack';
// import BalBtn from '@/components/BalBtn';
// import usePoolCreation from '@/composables/pools/usePoolCreation';
// import { useTokens } from '@/providers/tokens.provider';
// import { useTranslation } from 'react-i18next'; // or your i18n hook
// import {
//   bnum,
//   formatWordListAsSentence,
//   isSameAddress,
//   selectByAddress,
// } from '@/lib/utils';
// import { isLessThanOrEqualTo } from '@/lib/utils/validations';

interface UnknownTokenPriceModalProps {
  visible: boolean
  onClose: () => void
  unknownTokens?: string[]
}

const PRICE_CAP = 100000000 // hundred million max price

const UnknownTokenPriceModal: React.FC<UnknownTokenPriceModalProps> = ({ visible, onClose, unknownTokens = [] }) => {
  // Composables/hooks from your existing code.
  const { seedTokens } = usePoolCreation()
  const { getToken, injectPrices } = useTokens()

  // Local state for the user–defined token prices.
  const [userDefinedTokenPrices, setUserDefinedTokenPrices] = useState<TokenPrices>({})

  // Compute a comma–separated sentence of token symbols.
  const tokenSymbols = unknownTokens.map((tokenAddress) => getToken(tokenAddress)?.symbol)
  const readableUnknownTokenSymbols = formatWordListAsSentence(tokenSymbols)

  // Determine if the submit button should be disabled.
  const noPricesEntered = unknownTokens.some((token) => selectByAddress(userDefinedTokenPrices, token) === undefined)
  const hasLargePrice = unknownTokens.some((token) =>
    bnum(selectByAddress(userDefinedTokenPrices, token) || '0').gt(PRICE_CAP)
  )
  const isSubmitDisabled = noPricesEntered || hasLargePrice

  // Find the index of an unknown token in seedTokens.
  function getIndexOfUnknownToken(address: string): number {
    return seedTokens.findIndex((token) => isSameAddress(address, token.tokenAddress))
  }

  // Handler to update token price in local state.
  const handleTokenPriceChange = (address: string, amount: string) => {
    setUserDefinedTokenPrices((prev: any) => ({
      ...prev,
      [address]: amount,
    }))
  }

  // Inject the unknown prices and close the modal.
  const injectUnknownPrices = () => {
    injectPrices(userDefinedTokenPrices)
    onClose()
  }

  return (
    <Modal noPadding onClose={onClose}>
      <div>
        <Flex
          flexDirection="column"
          alignItems="flex-start"
          padding="32px"
          css={{ gap: '16px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
          alignSelf="stretch"
          backgroundColor="#F3F3FF"
        >
          <Box color="rgba(41, 41, 51, 0.90)" fontSize="20px" fontWeight={600}>
            Unknown token price
          </Box>
          <Box
            color="#666680"
            fontSize="15px"
          >{`Our pricing partner, CoinGecko, does not recognize ${readableUnknownTokenSymbols}. This leaves you vulnerable to losing money to arbitrageurs, if you don’t add pool assets in proportion to their target weights. To be warned of potential losses, enter the current price of this asset.`}</Box>
        </Flex>

        <Flex flexDirection="column" padding="32px" css={{ gap: '16px' }}>
          <Box fontSize="15px" fontWeight={600}>
            Enter the estimated current price
          </Box>
          <BalStack vertical>
            {unknownTokens.map((address, i) => (
              <TokenPriceInput
                key={i}
                amount={userDefinedTokenPrices[address] || ''}
                updateAmount={(value: string) => handleTokenPriceChange(address, value)}
                fixedToken
                placeholder="$0.00"
                address={address}
                name={`initial-token-${seedTokens[getIndexOfUnknownToken(address)]?.tokenAddress}`}
                noMax
                hideFooter
                rules={[isLessThanOrEqualTo(PRICE_CAP, `Must be less than $${PRICE_CAP.toLocaleString()}`)]}
                ignoreWalletBalance
              />
            ))}
          </BalStack>
          <BalBtn disabled={isSubmitDisabled} onClick={injectUnknownPrices}>
            Submit
          </BalBtn>
        </Flex>
      </div>
    </Modal>
  )
}

export default UnknownTokenPriceModal
