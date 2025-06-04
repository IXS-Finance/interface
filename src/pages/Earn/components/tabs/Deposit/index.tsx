/* eslint-disable indent */
import React, { useMemo, useEffect, useState } from 'react'
import { Trans } from '@lingui/macro'
import { Box, Flex } from 'rebass'
import { formatUnits } from 'viem'
import { parseUnits } from 'viem'
import { toast } from 'react-toastify'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { BigNumber } from 'ethers'
import { createUseWriteContract, createUseWatchContractEvent } from 'wagmi/codegen'

import {
  FormContentContainer,
  ExchangeRateInfo,
  ExchangeRateLabel,
  ExchangeRateValue,
  StyledButtonPrimary,
} from '../SharedStyles'
import VaultABI from '../../../abis/Vault.json'
import { earn } from 'services/apiUrls'
import apiService from 'services/apiService'
import erc20Abi from 'abis/erc20.json'
import { SuccessPopup } from './SuccessPopup'
import ErrorContent from '../../ToastContent/Error'
import SuccessContent from '../../ToastContent/Success'
import AmountInput from '../../AmountInput'
import { isGreaterThanOrEqualTo } from '../../AmountInput/validations'
import { KYCPrompt } from 'components/Launchpad/KYCPrompt'
import { useKyc } from 'state/user/hooks'
import { DepositPreview } from './DepositPreview'

const useWatchTokenApprovalEvent = createUseWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Approval',
})

interface EarnV2SignatureData {
  v: number
  r: string
  s: string
}

interface DepositTabProps {
  amount: string
  setAmount: (amount: string) => void
  loading: boolean
  showPreview: boolean
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
  handlePreviewDeposit: () => void
  handleBackFromPreview: () => void
  productAsset?: string
  network?: string
  vaultAddress?: string
  investingTokenAddress?: string
  exchangeRate?: string
  investingTokenDecimals?: number
  chainId?: number
  type: 'EARN_V2_TREASURY' | 'EARN_V2_HYCB'
}

export const DepositTab: React.FC<DepositTabProps> = ({
  amount,
  setAmount,
  loading,
  showPreview,
  termsAccepted,
  setTermsAccepted,
  handlePreviewDeposit,
  handleBackFromPreview,
  network,
  vaultAddress,
  investingTokenAddress,
  exchangeRate,
  investingTokenDecimals,
  chainId,
  type
}) => {
  const [isApproving, setIsApproving] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [isFetchingSignature, setIsFetchingSignature] = useState(false)
  const [whitelistAttemptError, setWhitelistAttemptError] = useState<string | null>(null)
  const [depositError, setDepositError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)
  const [showRequireKyc, setShowRequireKyc] = useState<boolean>(false)

  const { address } = useAccount()
  const { isChangeRequested, isPending, isDraft, isRejected, isNotSubmitted } = useKyc()

  const handlePrimaryAction = () => {
    if (isChangeRequested || isPending || isDraft || isRejected || isNotSubmitted) {
      setShowRequireKyc(true)
    } else {
      handleGetSignatureAndWhitelist()
    }
  }

  const useWriteInvestingTokeApprove = createUseWriteContract({
    abi: erc20Abi,
    address: investingTokenAddress as `0x${string}`,
    functionName: 'approve',
  })

  const { writeContract: approve, data: approveTxHash } = useWriteInvestingTokeApprove()

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalanceData,
  } = useBalance({
    address: address,
    token: investingTokenAddress as `0x${string}`,
    query: {
      enabled: !!address && !!investingTokenAddress,
    },
  })

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: investingTokenAddress as `0x${string}`,
    functionName: 'allowance',
    args: [address, vaultAddress],
    query: {
      enabled: !!address && !!investingTokenAddress && !!vaultAddress,
    },
  })

  const balanceRaw = useMemo(() => {
    if (!balanceData?.value) return 0

    try {
      const formatted = formatUnits(balanceData.value, balanceData.decimals ?? 6)
      const num = Number(formatted)

      if (isNaN(num)) return 0

      return num
    } catch {
      return 0
    }
  }, [balanceData?.value, balanceData?.decimals])

  const amountRaw = useMemo(() => {
    try {
      return amount ? parseUnits(amount, investingTokenDecimals || 6) : BigNumber.from(0)
    } catch (e) {
      return 0
    }
  }, [amount])

  const isApprovalNeeded = useMemo(() => {
    if (!allowanceData) {
      return true
    }

    if (!amountRaw) {
      return false
    }

    const currentAllowance = BigNumber.from(allowanceData.toString())
    return currentAllowance.lt(amountRaw)
  }, [allowanceData, amountRaw, isApproving])

  const approveResult = useWaitForTransactionReceipt({
    // wait for tx confirmation
    hash: approveTxHash,
    query: {
      enabled: !!approveTxHash,
    },
  })

  const result = useReadContract({
    abi: VaultABI.abi,
    address: vaultAddress as `0x${string}`,
    functionName: 'whitelistedUserAddress',
    args: [address],
    query: {
      enabled: !!vaultAddress && !!address,
    },
  })

  const { data: isWhitelisted, isLoading: isCheckingWhitelist, refetch: refetchIsWhitelisted } = result

  const { data: nonceData, isLoading: isNonceLoading } = useReadContract({
    abi: VaultABI.abi,
    address: vaultAddress as `0x${string}`,
    functionName: 'nonces',
    args: [address],
    query: {
      enabled: !!vaultAddress && !!address && !isWhitelisted,
    },
  })

  const userNonce = nonceData as BigNumber | undefined

  const {
    data: whitelistTxHash,
    writeContractAsync: whitelistUserContractAsync,
    isPending: isWhitelistContractCallPending,
    error: whitelistContractWriteError,
  } = useWriteContract()

  const {
    isLoading: isConfirmingWhitelistTx,
    isSuccess: isWhitelistTxConfirmed,
    error: whitelistTxConfirmError,
  } = useWaitForTransactionReceipt({
    hash: whitelistTxHash,
    query: {
      enabled: !!whitelistTxHash,
    },
  })

  const {
    data: depositTxHash,
    writeContractAsync: depositContractAsync,
    isPending: isDepositContractCallPending,
    error: depositContractWriteError,
    reset: resetDepositContract,
  } = useWriteContract()

  const {
    isLoading: isConfirmingDepositTx,
    isSuccess: isDepositTxConfirmed,
    error: depositTxConfirmError,
  } = useWaitForTransactionReceipt({
    hash: depositTxHash,
    query: {
      enabled: !!depositTxHash,
    },
  })

  useWatchTokenApprovalEvent({
    address: investingTokenAddress as `0x${string}`,
    onLogs(log) {
      setIsApproving(false)
      refetchAllowance()
    },
  })

  const handleApproval = async () => {
    try {
      setIsApproving(true)
      approve(
        {
          args: [vaultAddress, parseUnits(amount, investingTokenDecimals || 6)],
        },
        {
          onError(error) {
            setIsApproving(false)
          },
        }
      )
    } catch (error) {
      console.error('Approval failed:', error)
      setIsApproving(false)
    }
  }

  const handleGetSignatureAndWhitelist = async () => {
    if (!address || !vaultAddress || !network || userNonce === undefined) {
      const errorMsg = 'Cannot proceed: Missing address, vault, network, or nonce.'
      console.error(errorMsg, { address, vaultAddress, network, userNonce })
      setWhitelistAttemptError(errorMsg)
      return
    }

    setIsFetchingSignature(true)
    setWhitelistAttemptError(null)

    try {
      const mappingNetwork = {
        ethereum: 'ethereum',
        avalanche: 'avax',
      }
      const mappedNetwork = mappingNetwork[network as keyof typeof mappingNetwork]
      if (!mappedNetwork) {
        throw new Error(`Unsupported network: ${network}`)
      }
      const apiUrl = earn.getEIP712Signature(mappedNetwork)
      const signatureResponse = await apiService.post<EarnV2SignatureData>(apiUrl, {
        product: type,
      })

      const { v, r, s } = signatureResponse.data
      setIsFetchingSignature(false)

      await whitelistUserContractAsync({
        abi: VaultABI.abi,
        address: vaultAddress as `0x${string}`,
        functionName: 'whitelistUser',
        args: [userNonce, v, r as `0x${string}`, s as `0x${string}`],
      })
    } catch (error: any) {
      console.error('Error during whitelist signature or transaction:', error)
      setIsFetchingSignature(false)
      const message =
        error.response?.data?.message || error.message || 'An unexpected error occurred during whitelisting.'
      setWhitelistAttemptError(message)
    }
  }

  const handleDeposit = async () => {
    if (!vaultAddress || !amountRaw) {
      const errorMsg = 'Vault address or amount is invalid for deposit.'
      setDepositError(errorMsg)
      console.error(errorMsg, { vaultAddress, amount: amount.toString() })
      return
    }

    setDepositError(null) // Clear previous deposit errors

    try {
      await depositContractAsync({
        abi: VaultABI.abi,
        address: vaultAddress as `0x${string}`,
        functionName: 'deposit',
        args: [amountRaw],
      })
    } catch (error: any) {
      // This catch might not be strictly necessary if using the error from useWriteContract,
      // but can catch synchronous errors during the call setup.
      console.error('Error initiating deposit transaction:', error)
      const message = error.shortMessage || error.message || 'An unexpected error occurred during deposit initiation.'
      setDepositError(message)
    }
  }

  const handleClosePopup = () => {
    setShowSuccessPopup(false)
    handleBackFromPreview()
    setAmount('')
  }

  const isDepositing = isDepositContractCallPending || isConfirmingDepositTx

  useEffect(() => {
    if (approveResult.isSuccess) {
      refetchAllowance()
      setIsApproving(false)
      toast.success(
        <SuccessContent
          title="Successful!"
          message="Approval successful! Your funds have been approved for deposit."
        />,
        {
          style: {
            background: '#fff',
            border: '1px solid rgba(40, 194, 92, 0.5)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        }
      )
    }
  }, [approveResult?.isSuccess])

  useEffect(() => {
    if (isWhitelistTxConfirmed) {
      toast.success(
        <SuccessContent title="Successful!" message="Whitelisting successful! You are now eligible to deposit." />,
        {
          style: {
            background: '#fff',
            border: '1px solid rgba(40, 194, 92, 0.5)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        }
      )
      refetchIsWhitelisted()
      setWhitelistAttemptError(null)
    }
  }, [isWhitelistTxConfirmed])

  useEffect(() => {
    if (isWhitelistTxConfirmed) {
      refetchIsWhitelisted()
      setWhitelistAttemptError(null)
    }
  }, [isWhitelistTxConfirmed])

  useEffect(() => {
    if (whitelistContractWriteError) {
      setWhitelistAttemptError(whitelistContractWriteError.message || 'Failed to send whitelist transaction.')
    } else if (whitelistTxConfirmError) {
      setWhitelistAttemptError(whitelistTxConfirmError.message || 'Whitelist transaction failed to confirm.')
    }
  }, [whitelistContractWriteError?.message, whitelistTxConfirmError?.message])

  useEffect(() => {
    if (isDepositTxConfirmed) {
      refetchAllowance()
      setDepositError(null)
      if (refetchBalanceData) {
        refetchBalanceData()
      }
      resetDepositContract()
      setShowSuccessPopup(true)
    }
  }, [isDepositTxConfirmed])

  useEffect(() => {
    let message: string | null = null
    if (depositContractWriteError) {
      message =
        depositContractWriteError.message || depositContractWriteError.message || 'Failed to send deposit transaction.'
      console.error('Deposit contract write error:', depositContractWriteError)
      resetDepositContract() // Reset to allow retry
    } else if (depositTxConfirmError) {
      message =
        depositTxConfirmError.message || depositTxConfirmError.message || 'Deposit transaction failed to confirm.'
      console.error('Deposit transaction confirm error:', depositTxConfirmError)
      resetDepositContract() // Reset to allow retry if confirmation fails
    }
    // Set error if a new message is generated
    if (message) {
      if (message.includes('User rejected the request')) {
        toast.error(<ErrorContent title="Error" message="Transaction rejected by user." />, {
          style: {
            background: '#fff',
            border: '1px solid rgba(255, 101, 101, 0.50)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        })
      } else {
        toast.error(<ErrorContent title="Error" message={message} />, {
          style: {
            background: '#fff',
            border: '1px solid rgba(255, 101, 101, 0.50)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        })
      }
      setDepositError(message)
    }
  }, [depositContractWriteError?.message, depositTxConfirmError?.message])

  useEffect(() => {
    if (whitelistAttemptError) {
      let message: string | null = null
      const toastId = 'whitelist-error-toast'
      if (whitelistAttemptError.includes('User rejected the request')) {
        message = 'Transaction rejected by user.'
        toast.error(<ErrorContent title="Error" message={message} />, {
          toastId,
          style: {
            background: '#fff',
            border: '1px solid rgba(255, 101, 101, 0.50)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        })
      } else {
        message = whitelistAttemptError || 'Failed to send whitelist transaction.'
        toast.error(<ErrorContent title="Error" message={message} />, {
          toastId,
          style: {
            background: '#fff',
            border: '1px solid rgba(255, 101, 101, 0.50)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        })
      }
      setWhitelistAttemptError(message)
    }
  }, [whitelistAttemptError])

  return (
    <>
      {showRequireKyc ? <KYCPrompt onClose={() => setShowRequireKyc(false)} /> : null}

      {!showPreview ? (
        <FormContentContainer>
          <AmountInput
            label="Deposit Amount"
            name="depositAmount"
            amount={amount.toString()}
            rules={[isGreaterThanOrEqualTo(100, 'Does not meet minimum amount (100 USDC)')]}
            customBalance={balanceRaw.toString()}
            balanceLoading={isBalanceLoading}
            updateAmount={(value: any) => setAmount(value)}
            updateIsValid={(valid: boolean) => setIsValid(valid)}
          />

          <Flex
            justifyContent="space-between"
            alignItems="center"
            mt="32px"
            flexDirection={['column', 'row']}
            width={'100%'}
          >
            <Box width={['100%', 'auto']} mb={['16px', '0']}>
              {exchangeRate ? (
                <ExchangeRateInfo>
                  <ExchangeRateValue>{exchangeRate}</ExchangeRateValue>
                  <ExchangeRateLabel>Exchange Rate</ExchangeRateLabel>
                </ExchangeRateInfo>
              ) : null}
            </Box>

            {isCheckingWhitelist ? (
              <StyledButtonPrimary disabled={true}>
                <Trans>Checking whitelist...</Trans>
              </StyledButtonPrimary>
            ) : isWhitelisted ? (
              <StyledButtonPrimary onClick={handlePreviewDeposit} disabled={!amount || loading || !isValid}>
                {loading ? <Trans>Processing...</Trans> : <Trans>Preview Deposit</Trans>}
              </StyledButtonPrimary>
            ) : (
              <>
                <StyledButtonPrimary
                  onClick={handlePrimaryAction}
                  disabled={
                    loading ||
                    isCheckingWhitelist ||
                    isNonceLoading ||
                    (userNonce === undefined && !isWhitelisted) ||
                    isFetchingSignature ||
                    isWhitelistContractCallPending ||
                    isConfirmingWhitelistTx
                  }
                >
                  {(() => {
                    if (isCheckingWhitelist || isNonceLoading) return <Trans>Loading data...</Trans>
                    if (userNonce === undefined && !isWhitelisted) return <Trans>Whitelist Unavailable</Trans>
                    if (isFetchingSignature) return <Trans>Getting Signature...</Trans>
                    if (isWhitelistContractCallPending) return <Trans>Whitelisting... Check Wallet</Trans>
                    if (isConfirmingWhitelistTx) return <Trans>Confirming Whitelist...</Trans>
                    if (whitelistAttemptError) return <Trans>Whitelist Failed. Retry?</Trans>
                    return <Trans>Get Whitelisted</Trans>
                  })()}
                </StyledButtonPrimary>
              </>
            )}
          </Flex>
        </FormContentContainer>
      ) : (
        <DepositPreview
          vaultAddress={vaultAddress}
          network={network}
          amount={amount}
          exchangeRate={exchangeRate}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          handleBackFromPreview={handleBackFromPreview}
          isApprovalNeeded={isApprovalNeeded}
          isApproving={isApproving}
          loading={loading}
          handleApproval={handleApproval}
          handleDeposit={handleDeposit}
          isDepositing={isDepositing}
          depositError={!!depositError}
          amountRaw={amountRaw.toString()}
        />
      )}

      {showSuccessPopup && <SuccessPopup onClose={handleClosePopup} txHash={depositTxHash} chainId={chainId ?? 0} />}
    </>
  )
}
