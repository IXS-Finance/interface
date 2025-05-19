/* eslint-disable indent */
import React from 'react'
import styled, { useTheme } from 'styled-components'
import { capitalize } from '@material-ui/core'
import { Copy, Info } from 'react-feather'
import _get from 'lodash/get'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import { Offer, OfferNetwork, OfferStatus, WhitelistStatus } from 'state/launchpad/types'
import MetamaskIcon from 'assets/images/metamask.png'
import { useCheckKYC, useFormatOfferValue, useGetWhitelistStatus, useInvestedData } from 'state/launchpad/hooks'
import { InvestmentSaleStatusInfo } from 'components/Launchpad/InvestmentCard/InvestmentSaleStatusInfo'
import { Tooltip } from 'components/Launchpad/InvestmentCard/Tooltip'
import { InfoList } from 'components/LaunchpadOffer/util/InfoList'
import { OfferInvestmentIndicator } from './OfferInvestmentIndicator'
import { OfferFundRaiseIndicator } from './OfferFundRaiseIndicator'
import { Column, Row, Separator } from '../../LaunchpadMisc/styled'
import { InvestDialog } from '../InvestDialog'
import PlainCopy from 'components/PlainCopy/PlainCopy'
import useAddTokenByDetailsToMetamask from 'hooks/useAddTokenByDetailsToMetamask'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { getChainFromName } from 'constants/chains'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'
import { text10, text33, text6, text9 } from 'components/LaunchpadMisc/typography'
import { InvestSuccessModal } from '../InvestDialog/utils/InvestSuccessModal'
import { InvestFailedModal } from '../InvestDialog/utils/InvestFailedModal'
import { INVESTING_TOKEN_SYMBOL } from 'state/launchpad/constants'
import { isTestnet } from 'utils/isEnvMode'
import { KYCPrompt } from 'components/Launchpad/KYCPrompt'
import { Flex } from 'rebass'

interface Props {
  offer: Offer
}

export enum OfferStageStatus {
  disabled,
  notStarted,
  active,
  closed,
  checkStatus,
}

export const OfferDetails: React.FC<Props> = (props) => {
  const theme = useTheme()
  const investedData = useInvestedData(props.offer.id)
  const { address: account } = useAccount()
  const { openConnectModal } = useConnectModal()
  const checkKYC = useCheckKYC()

  const data = _get(props, 'offer', null)
  const { amount: amountToClaim } = investedData
  const { status: whitelistedStatus, isInterested } = useGetWhitelistStatus(props.offer.id)
  const nameChainMapNetwork = getChainFromName(props?.offer?.network, isTestnet)
  let type = ExplorerDataType.TOKEN
  if (['ozean'].includes(props?.offer?.network)) {
    type = ExplorerDataType.ADDRESS
  }
  const explorerLink = getExplorerLink(nameChainMapNetwork, props.offer.tokenAddress, type)
  const { addToken } = useAddTokenByDetailsToMetamask()
  const addToMetamask = () => {
    addToken({
      symbol: props.offer.tokenSymbol,
      address: props?.offer?.tokenAddress,
      decimals: props.offer.decimals,
    })
  }
  const formatter = React.useMemo(() => new Intl.NumberFormat('en-US', { currency: 'USD' }), [])

  const stageStatus = React.useMemo(() => {
    switch (props.offer.status) {
      case OfferStatus.preSale: {
        if (!whitelistedStatus) {
          return OfferStageStatus.disabled
        }

        return whitelistedStatus && whitelistedStatus === WhitelistStatus.accepted
          ? OfferStageStatus.active
          : OfferStageStatus.checkStatus
      }

      case OfferStatus.sale:
        return OfferStageStatus.active

      case OfferStatus.closed:
      case OfferStatus.claim:
        return amountToClaim && amountToClaim > 0 ? OfferStageStatus.closed : OfferStageStatus.disabled

      case OfferStatus.approved:
        return OfferStageStatus.disabled

      default:
        return OfferStageStatus.notStarted
    }
  }, [whitelistedStatus, amountToClaim, props.offer.status])

  const [showInvestDialog, setShowInvestDialog] = React.useState(false)
  const [showRequireKyc, setShowRequireKyc] = React.useState<boolean>(false)

  const closeInvestDialog = React.useCallback(() => setShowInvestDialog(false), [])

  const daysTillClosed = props.offer.daysTillClosed ?? 0

  const [showSuccess, setShowSuccess] = React.useState(false)
  const [showFailed, setShowFailed] = React.useState(false)

  const openInvestDialog = () => {
    let isAllow = false

    if (data) {
      if (data.ethAddress) {
        isAllow =
          checkKYC(data.allowOnlyAccredited, [OfferStatus.closed, OfferStatus.claim].includes(data?.status)) ||
          account?.toLowerCase() === data?.ethAddress?.toLowerCase()
      } else {
        isAllow = checkKYC(data.allowOnlyAccredited, [OfferStatus.closed, OfferStatus.claim].includes(data?.status))
      }
    }

    if (!isAllow) {
      setShowRequireKyc(true)
    } else {
      setShowInvestDialog(true)
    }
  }

  const shouldShowInvestButton = (
    stageStatus: OfferStageStatus,
    offerStatus: OfferStatus,
    isInterested: number | undefined
  ) => {
    if (stageStatus === OfferStageStatus.disabled) {
      return false
    }
    if (offerStatus === OfferStatus.preSale && isInterested === 0) {
      return false
    }
    return true
  }

  const isShowInvestButton = shouldShowInvestButton(stageStatus, props?.offer?.status, isInterested)
  const isShowWarning = (!whitelistedStatus || isInterested === 0) && props?.offer?.status === OfferStatus.preSale

  return (
    <Container>
      <OfferSidebarSummary>
        <Column margin="0 0 1rem 0">
          {stageStatus === OfferStageStatus.closed && (
            <InvestmentSaleStatusInfo
              isClosed
              isSuccesfull={props.offer.softCapReached}
              daysTillClosed={props.offer.daysTillSale}
              allowOnlyAccredited={props.offer.allowOnlyAccredited}
              margin="0 0 1.5rem 0"
            />
          )}

          {stageStatus === OfferStageStatus.notStarted && <OfferNotStartedLabel>Not Started</OfferNotStartedLabel>}
          {stageStatus !== OfferStageStatus.notStarted && (
            <>
              <OfferInvestmentAmount>
                {getTokenSymbol(props?.offer?.network, props?.offer?.investingTokenSymbol)}
                &nbsp;{formatter.format(props.offer.totalInvestment)}
              </OfferInvestmentAmount>

              <Row alignItems="center" gap="1rem">
                <OfferFundRaiseIndicator offer={props.offer} size={32} />
                <OfferFundRaiseLabel>Raised</OfferFundRaiseLabel>
              </Row>
            </>
          )}
        </Column>

        <OfferInvestmentIndicator offer={props.offer} />

        <Separator marginTop="1rem" marginBottom="1rem" />

        <OfferStats>
          <Participants>
            <header>
              Participants
              <Tooltip title="Participants" body="Number of investors that has participated in this deal">
                <Info size="12" />
              </Tooltip>
            </header>

            <main>{props.offer.countParticipants ?? 0}</main>
          </Participants>

          <DayCount>
            <header>The deal closes in</header>
            <main>
              {daysTillClosed} {daysTillClosed === 1 ? 'Day' : 'Days'}
            </main>
          </DayCount>
        </OfferStats>

        <InvestButtonContainer>
          {!account ? (
            <InvestButton
              onClick={() => {
                openConnectModal && openConnectModal()
              }}
            >
              Connect Wallet
            </InvestButton>
          ) : (
            <>
              {isShowInvestButton ? (
                <InvestButton onClick={openInvestDialog}>
                  {stageStatus === OfferStageStatus.checkStatus && 'Check Status'}
                  {stageStatus === OfferStageStatus.notStarted && 'Register To Invest'}
                  {stageStatus === OfferStageStatus.active && 'Invest'}
                  {stageStatus === OfferStageStatus.closed && 'Open Dashboard '}
                </InvestButton>
              ) : (
                <>
                  {isShowWarning ? (
                    <Flex
                      justifyContent="center"
                      alignItems="center"
                      css={{
                        border: '1px solid rgba(255, 168, 0, 0.50)',
                        borderRadius: '8px',
                        background: 'rgba(255, 168, 0, 0.10)',
                        padding: '24px',
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '13px',
                        lineHeight: '18px',
                      }}
                    >
                      You are not eligible to participate in Pre-sale. <br />
                      Please wait for the Public Sale Phase.
                    </Flex>
                  ) : null}
                </>
              )}
            </>
          )}
        </InvestButtonContainer>

        {showSuccess && <InvestSuccessModal show={showSuccess} onClose={() => setShowSuccess(false)} />}
        {showFailed && <InvestFailedModal show={showFailed} onClose={() => setShowFailed(false)} />}
        {showInvestDialog && (
          <InvestDialog
            offer={props.offer}
            onClose={closeInvestDialog}
            investedData={investedData}
            openSuccess={() => {
              closeInvestDialog()
              setShowSuccess(true)
            }}
            openFailed={() => setShowFailed(false)}
          />
        )}
      </OfferSidebarSummary>

      <TokenInfo>
        <TokenInfoCard>
          <span className="label">Token Network: </span>
          {capitalize(props.offer.network)}
        </TokenInfoCard>
        <TokenInfoCard>
          <AdjustedExternalLink href={explorerLink} style={{ fontSize: '14px' }}>
            Explorer
          </AdjustedExternalLink>
        </TokenInfoCard>
        <TokenInfoCard>
          <TokenInfoButton>
            <PlainCopy toCopy={props?.offer?.tokenAddress}>
              <Row>
                <span>{shortenAddress(props?.offer?.tokenAddress ?? '', 5)}</span>
                <Copy stroke={theme.launchpad.colors.text.body} size="18" />
              </Row>
            </PlainCopy>
          </TokenInfoButton>
        </TokenInfoCard>

        <TokenInfoCard>
          <TokenInfoButton onClick={addToMetamask}>
            Add to Metamask
            <img src={MetamaskIcon} width="20" />
          </TokenInfoButton>
        </TokenInfoCard>
      </TokenInfo>

      <OfferGeneralInfo {...props.offer} />

      {showRequireKyc && data ? (
        <KYCPrompt
          offerId={data.id}
          allowOnlyAccredited={data.allowOnlyAccredited}
          onClose={() => setShowRequireKyc(false)}
        />
      ) : null}
    </Container>
  )
}

type GeneralInfoFields =
  | 'issuerName'
  | 'country'
  | 'maxInvestment'
  | 'minInvestment'
  | 'investmentType'
  | 'investingTokenSymbol'
  | 'tokenPrice'
  | 'tokenSymbol'
  | 'network'

type GeneralInfoProps = Partial<Pick<Offer, GeneralInfoFields>>

export function getTokenSymbol(network: any, investingTokenSymbol: any) {
  if (network === OfferNetwork.polygon && investingTokenSymbol === INVESTING_TOKEN_SYMBOL.USDC) {
    return INVESTING_TOKEN_SYMBOL['USDC.e']
  }
  return investingTokenSymbol
}

export const OfferGeneralInfo: React.FC<GeneralInfoProps> = (props) => {
  const formatedValue = useFormatOfferValue()

  const minTokenInvestment = React.useMemo(() => {
    return formatedValue(`${(Number(props.minInvestment) / Number(props.tokenPrice)).toFixed(2)}`) ?? 'N/A'
  }, [props.minInvestment, props.tokenPrice])
  const maxTokenInvestment = React.useMemo(
    () => formatedValue(`${(Number(props.maxInvestment) / Number(props.tokenPrice)).toFixed(2)}`) ?? 'N/A',
    [props.maxInvestment, props.tokenPrice]
  )

  return (
    <InfoList
      entries={[
        { label: 'Issuer', value: props.issuerName || 'N/A' },
        { label: 'Country', value: props.country || 'N/A' },
        {
          label: 'Investment Type',
          value: props.investmentType?.replace(/\b\w/g, (match) => match.toUpperCase()) ?? 'N/A',
        },
        {
          label: 'Public sale Price',
          value: `${getTokenSymbol(props?.network, props?.investingTokenSymbol)}  ${
            formatedValue(props.tokenPrice) ?? 'N/A'
          } / 1 ${props.tokenSymbol}`,
        },
        {
          label: 'Max. Investment Size',
          value: `${getTokenSymbol(props?.network, props?.investingTokenSymbol)} ${
            formatedValue(props.maxInvestment) ?? 'N/A'
          } / ${maxTokenInvestment} ${props.tokenSymbol}`,
        },
        {
          label: 'Min. Investment Size',
          value: `${getTokenSymbol(props?.network, props?.investingTokenSymbol)} ${
            formatedValue(props.minInvestment) ?? 'N/A'
          } / ${minTokenInvestment} ${props.tokenSymbol}`,
        },
      ]}
    />
  )
}

const Container = styled.div`
  display: flex;

  flex-flow: column nowrap;

  justify-content: flex-start;
  align-items: stretch;

  gap: 2rem;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    padding: 20px;
  }
`

const OfferSidebarSummary = styled.div`
  display: flex;

  flex-flow: column nowrap;
  align-items: stretch;
  gap: 1rem;
`

const OfferFundRaiseLabel = styled.div`
  ${text33}
  color: ${(props) => props.theme.launchpad.colors.text.body};
`

const OfferInvestmentAmount = styled.div`
  font-style: normal;
  font-weight: 800;
  font-size: 48px;
  line-height: 120%;
  letter-spacing: -0.03em;

  color: ${(props) => props.theme.launchpad.colors.primary};
`

const OfferNotStartedLabel = styled(OfferInvestmentAmount)`
  color: ${(props) => props.theme.launchpad.colors.text.caption};
`

const OfferStats = styled.div`
  display: flex;

  flex-flow: row nowrap;
  justify-content: space-between;
`

const Participants = styled.div`
  text-align: left;
  font-style: normal;

  header {
    display: flex;
    align-items: center;
    gap: 1rem;

    ${text6}
    color: ${(props) => props.theme.launchpad.colors.text.caption};
  }

  main {
    font-weight: 800;
    font-size: 32px;
    line-height: 120%;
    letter-spacing: -0.03em;

    color: ${(props) => props.theme.launchpad.colors.text.title};
  }
`

const DayCount = styled(Participants)`
  text-align: right;
`

const InvestButtonContainer = styled.div`
  display: flex;

  flex-flow: column nowrap;
  align-items: center;
`

const InvestButton = styled.button`
  height: 60px;
  width: 100%;

  color: ${(props) => props.theme.launchpad.colors.text.light};
  background: ${(props) => props.theme.launchpad.colors.primary};

  cursor: pointer;
  border: none;
  border-radius: 6px;
  ${text9}
`

const TokenInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
`

const TokenInfoCard = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  height: 36px;

  ${text10}
  color: ${(props) => props.theme.launchpad.colors.text.title};

  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 6px;

  .label {
    color: ${(props) => props.theme.launchpad.colors.text.caption};
    margin-right: 0.5rem;
  }

  svg,
  img {
    margin-left: 0.5rem;
  }
`

const TokenInfoButton = styled.button`
  background: none;
  border: 0;
  color: ${(props) => props.theme.launchpad.colors.text.title};
  font-weight: 450;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

const AdjustedExternalLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.launchpad.colors.text.title};
`
