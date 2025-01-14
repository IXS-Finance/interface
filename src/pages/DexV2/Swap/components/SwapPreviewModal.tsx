import React, { useEffect, useMemo, useState } from 'react'
import Portal from '@reach/portal'
import styled from 'styled-components'

import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ReactComponent as CloseIcon } from 'assets/images/dex-v2/close.svg'
import useTokenApprovalActions, { ApprovalAction } from 'state/dexV2/tokens/hooks/useTokenApprovalActions'
import { UseSwapping } from 'state/dexV2/swap/useSwapping'
import { configService } from 'services/config/config.service'
import { TransactionActionInfo, TransactionActionState } from 'pages/DexV2/types/transactions'
import Loader from 'components/Loader'
import { useErrorMsg } from 'lib/utils/errors'
import { toast } from 'react-toastify'

interface SwapSettingsModalProps {
  swapping: UseSwapping
  onClose: () => void
}

const SwapPreviewModal: React.FC<SwapSettingsModalProps> = (props) => {
  const { onClose } = props
  const { getTokenApprovalActions } = useTokenApprovalActions()
  const { formatErrorMsg } = useErrorMsg()

  const [loadingApprovals, setLoadingApprovals] = useState(true)
  const [currentActionIndex, setCurrentActionIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  const labels = useMemo(() => {
    if (props.swapping.isWrap) {
      return {
        modalTitle: `Preview ${props.swapping.tokenIn.symbol} Wrap`,
        confirmSwap: `Confirm ${props.swapping.tokenIn.symbol} wrap`,
      }
    } else if (props.swapping.isUnwrap) {
      return {
        modalTitle: `Preview ${props.swapping.tokenOut.symbol} Unwrap`,
        confirmSwap: `Preview ${props.swapping.tokenOut.symbol} Unwrap`,
      }
    } else if (props.swapping.exactIn) {
      return {
        modalTitle: 'Preview swap',
        confirmSwap: 'Confirm swap',
      }
    }
    // exact out
    return {
      modalTitle: 'Preview swap',
      confirmSwap: 'Confirm swap',
    }
  }, [props.swapping])

  async function swap() {
    return props.swapping.swap(() => {
      props.swapping.resetAmounts()
      onClose()
    })
  }

  const initActions: any[] = [
    {
      label: labels.confirmSwap,
      loadingLabel: 'Confirm swap in wallet',
      confirmingLabel: 'Confirming...',
      action: swap as () => Promise<any>,
    },
  ]
  const [actions, setActions] = useState<any[]>(initActions)
  const currentAction: any = actions[currentActionIndex]

  async function submit(actionInfo: TransactionActionInfo): Promise<void> {
    const { action, postActionValidation } = actionInfo
    try {
      setLoading(true)
      await action()
      await postActionValidation?.()
      setCurrentActionIndex(currentActionIndex + 1)
    } catch (error: any) {
      console.error('Error submitting action', error?.message)
      const errorMsg = formatErrorMsg(error?.message)
      if (errorMsg) {
        toast.error(errorMsg.title)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const amountsToApprove: any = [
      {
        address: props.swapping.tokenIn.address,
        amount: props.swapping.tokenInAmountInput,
      },
    ]

    const getActions = async () => {
      const approvalActions = await getTokenApprovalActions({
        amountsToApprove,
        spender: configService.network.addresses.vault,
        actionType: ApprovalAction.Swapping,
      })

      setActions([...approvalActions, ...initActions])
      setLoadingApprovals(false)
    }

    getActions()
  }, [])

  console.log('props.swapping', props.swapping)

  return (
    <Portal>
      <CenteredFixed width="100vw" height="100vh">
        <ModalContent>
          <HeaderModal>
            <TitleWrapper>
              <Title>Transaction settings</Title>
              <CloseButton onClick={onClose}>
                <CloseIcon />
              </CloseButton>
            </TitleWrapper>
          </HeaderModal>

          <BodyModal>
            <Button onClick={() => submit(currentAction)} disabled={loading}>
              {loading ? <Loader /> : null}
              {currentAction?.label}
            </Button>
          </BodyModal>
        </ModalContent>
      </CenteredFixed>
    </Portal>
  )
}

export default SwapPreviewModal

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 480px;
`

const HeaderModal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  padding-top: 32px;
  padding-left: 32px;
  padding-right: 32px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`

const BodyModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: 32px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`

const CloseButton = styled.div`
  cursor: pointer;
  color: rgba(41, 41, 51, 0.5);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

export const Button = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  border-radius: 8px;
  background: #66f;
  font-family: Inter;
  color: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  cursor: pointer;
  border: none;

  &:hover {
    transform: scale(0.99);
  }

  &:disabled {
    background: #ececfb;
  }
`
