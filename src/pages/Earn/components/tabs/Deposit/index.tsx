import React, { useMemo, useEffect, useState } from 'react';
import { Trans } from '@lingui/macro';
import {
  FormContentContainer,
  FormSectionTitle,
  InputContainer,
  InputRow,
  AmountInput,
  CurrencySelector,
  CurrencyIcon,
  CurrencyText,
  ConversionText,
  BalanceRow,
  BalanceText,
  BalanceAmount,
  MaxButton,
  ActionRow,
  ExchangeRateInfo,
  ExchangeRateLabel,
  ExchangeRateValue,
  PreviewContainer,
  PreviewSection,
  PreviewTitle,
  AddressBox,
  SummaryTable,
  SummaryRow,
  SummaryLabel,
  SummaryValue,
  TermsContainer,
  Checkbox,
  TermsText,
  TermsLink,
  ButtonsRow,
  BackButton,
  StyledButtonPrimary
} from '../SharedStyles';

import USDCIcon from 'assets/images/usdcNew.svg';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useBalance } from 'wagmi';
import { useAllowanceV2, ApprovalState } from 'hooks/useApproveCallback';
import { ethers, BigNumber } from 'ethers';
import VaultABI from '../../../abis/Vault.json';
import { earn } from 'services/apiUrls';
import apiService from 'services/apiService';

interface EarnV2SignatureData {
  v: number;
  r: string;
  s: string;
}

interface DepositTabProps {
  amount: string;
  setAmount: (amount: string) => void;
  loading: boolean;
  showPreview: boolean;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  handlePreviewDeposit: () => void;
  handleBackFromPreview: () => void;
  handleDeposit: () => void;
  productAsset: string;
  network?: string;
  vaultAddress?: string;
  investingTokenAddress?: string;
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
  handleDeposit,
  productAsset,
  network,
  vaultAddress,
  investingTokenAddress,
}) => {
  const { address } = useAccount();
  
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address,
    token: investingTokenAddress as `0x${string}`,
    query: {
      enabled: !!address && !!investingTokenAddress,
    },
  });

  const result = useReadContract({
    abi: VaultABI.abi,
    address: vaultAddress as `0x${string}`,
    functionName: 'whitelistedUserAddress',
    args: [address],
    query: {
      enabled: !!vaultAddress && !!address,
    },
  })

  const { data: isWhitelisted, isLoading: isCheckingWhitelist, refetch: refetchIsWhitelisted } = result;

  const { data: nonceData, isLoading: isNonceLoading } = useReadContract({
    abi: VaultABI.abi,
    address: vaultAddress as `0x${string}`,
    functionName: 'nonces',
    args: [address],
    query: {
      enabled: !!vaultAddress && !!address && !isWhitelisted,
    },
  });
  const userNonce = nonceData as BigNumber | undefined;

  const [isFetchingSignature, setIsFetchingSignature] = useState(false);
  const [whitelistAttemptError, setWhitelistAttemptError] = useState<string | null>(null);

  const {
    data: whitelistTxHash,
    writeContractAsync: whitelistUserContractAsync,
    isPending: isWhitelistContractCallPending,
    error: whitelistContractWriteError,
  } = useWriteContract();

  const {
    isLoading: isConfirmingWhitelistTx,
    isSuccess: isWhitelistTxConfirmed,
    error: whitelistTxConfirmError,
  } = useWaitForTransactionReceipt({
    hash: whitelistTxHash,
    query: {
      enabled: !!whitelistTxHash,
    },
  });

  useEffect(() => {
    if (isWhitelistTxConfirmed) {
      refetchIsWhitelisted();
      setWhitelistAttemptError(null);
    }
  }, [isWhitelistTxConfirmed, refetchIsWhitelisted]);

  useEffect(() => {
    if (whitelistContractWriteError) {
      setWhitelistAttemptError(whitelistContractWriteError.message || "Failed to send whitelist transaction.");
    } else if (whitelistTxConfirmError) {
      setWhitelistAttemptError(whitelistTxConfirmError.message || "Whitelist transaction failed to confirm.");
    }
  }, [whitelistContractWriteError, whitelistTxConfirmError]);

  const amountInWei = useMemo(() => {
    try {
      return amount ? ethers.utils.parseUnits(amount, 6) : BigNumber.from(0);
    } catch (e) {
      return BigNumber.from(0);
    }
  }, [amount]);

  const [approvalState, approve, refreshAllowance] = useAllowanceV2(
    investingTokenAddress,
    amountInWei,
    vaultAddress
  );

  const isApprovalNeeded = approvalState === ApprovalState.NOT_APPROVED;
  const isApproving = approvalState === ApprovalState.PENDING;
  const isApproved = approvalState === ApprovalState.APPROVED;

  const handleMaxClick = () => {
    if (balanceData) {
      setAmount(balanceData.formatted);
    }
  };

  const handleApproval = async () => {
    try {
      await approve();
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleGetSignatureAndWhitelist = async () => {
    console.log('handleGetSignatureAndWhitelist', { address, vaultAddress, network, userNonce });
    if (!address || !vaultAddress || !network || userNonce === undefined) {
      const errorMsg = "Cannot proceed: Missing address, vault, network, or nonce.";
      console.error(errorMsg, { address, vaultAddress, network, userNonce });
      setWhitelistAttemptError(errorMsg);
      return;
    }

    setIsFetchingSignature(true);
    setWhitelistAttemptError(null);

    try {
      const apiUrl = earn.getEIP712Signature(network);
      const signatureResponse = await apiService.post<EarnV2SignatureData>(
        apiUrl,
        {
          product: 'EARN_V2_TREASURY',
        }
      );

      const { v, r, s } = signatureResponse.data;
      setIsFetchingSignature(false);

      await whitelistUserContractAsync({
        abi: VaultABI.abi,
        address: vaultAddress as `0x${string}`,
        functionName: 'whitelistUser',
        args: [
          userNonce,
          v,
          r as `0x${string}`,
          s as `0x${string}`,
        ],
      });
    } catch (error: any) {
      console.error('Error during whitelist signature or transaction:', error);
      setIsFetchingSignature(false);
      const message = error.response?.data?.message ||
                      error.message ||
                      "An unexpected error occurred during whitelisting.";
      setWhitelistAttemptError(message);
    }
  };

  return (
    <>
      {!showPreview ? (
        <FormContentContainer>
          <FormSectionTitle>
            <Trans>Deposit Amount</Trans>
          </FormSectionTitle>
          
          <InputContainer>
            <InputRow>
              <AmountInput
                placeholder="10,500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <CurrencySelector>
                <CurrencyIcon>
                  <img src={USDCIcon} alt="USDC" />
                </CurrencyIcon>
                <CurrencyText>USDC</CurrencyText>
              </CurrencySelector>
            </InputRow>
            <ConversionText>~$10,449.32</ConversionText>
          </InputContainer>
          
          <BalanceRow>
            <div></div>
            <BalanceText>
              Balance: <BalanceAmount>
                {isBalanceLoading ? 'Loading...' : balanceData?.formatted || '0.00'}
              </BalanceAmount>
              <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
            </BalanceText>
          </BalanceRow>
          
          <ActionRow>
            <ExchangeRateInfo>
              <ExchangeRateLabel>Exchange Rate</ExchangeRateLabel>
              <ExchangeRateValue>$3.87</ExchangeRateValue>
            </ExchangeRateInfo>
            
            {isCheckingWhitelist ? (
              <StyledButtonPrimary disabled={true}>
                <Trans>Checking whitelist...</Trans>
              </StyledButtonPrimary>
            ) : isWhitelisted ? (
              <StyledButtonPrimary 
                onClick={handlePreviewDeposit} 
                disabled={!amount || loading}
              >
                {loading ? <Trans>Processing...</Trans> : <Trans>Preview Deposit</Trans>}
              </StyledButtonPrimary>
            ) : (
              <>
                <StyledButtonPrimary 
                  onClick={handleGetSignatureAndWhitelist}
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
                    if (isCheckingWhitelist || isNonceLoading) return <Trans>Loading data...</Trans>;
                    if (userNonce === undefined && !isWhitelisted) return <Trans>Whitelist Unavailable</Trans>;
                    if (isFetchingSignature) return <Trans>Getting Signature...</Trans>;
                    if (isWhitelistContractCallPending) return <Trans>Whitelisting... Check Wallet</Trans>;
                    if (isConfirmingWhitelistTx) return <Trans>Confirming Whitelist...</Trans>;
                    if (whitelistAttemptError) return <Trans>Whitelist Failed. Retry?</Trans>;
                    return <Trans>Get Whitelisted</Trans>;
                  })()}
                </StyledButtonPrimary>
                {whitelistAttemptError && !isConfirmingWhitelistTx && !isWhitelistContractCallPending && !isFetchingSignature && (
                  <div style={{ color: 'red', marginTop: '10px', fontSize: '0.875em', textAlign: 'right', width: '100%' }}>
                    {whitelistAttemptError}
                  </div>
                )}
              </>
            )}
          </ActionRow>
        </FormContentContainer>
      ) : (
        <PreviewContainer>
          <PreviewSection>
            <PreviewTitle>Request Made To</PreviewTitle>
            <AddressBox>{vaultAddress || '0×510E94...e56370'}</AddressBox>
          </PreviewSection>
          
          <PreviewSection>
            <PreviewTitle>Network</PreviewTitle>
            <AddressBox>{network || 'Polygon'}</AddressBox>
          </PreviewSection>
          
          <PreviewSection>
            <PreviewTitle>Summary</PreviewTitle>
            <SummaryTable>
              <SummaryRow>
                <SummaryLabel>Deposit Amount</SummaryLabel>
                <SummaryValue>USDC {parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Exchange Rate</SummaryLabel>
                <SummaryValue>1.03832404</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Estimated Vault Tokens Received</SummaryLabel>
                <SummaryValue>VT {(parseFloat(amount) / 1.03832404).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</SummaryValue>
              </SummaryRow>
            </SummaryTable>
          </PreviewSection>
          
          <TermsContainer>
            <Checkbox 
              type="checkbox" 
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <TermsText>
              I agree to the <TermsLink>InvestaX Earn Terms and Conditions</TermsLink>.
            </TermsText>
          </TermsContainer>
          
          <ButtonsRow>
            <BackButton onClick={handleBackFromPreview}>
              Back
            </BackButton>
            <StyledButtonPrimary 
              onClick={handleDeposit}
              disabled={!termsAccepted || loading || isApprovalNeeded}
            >
              {loading ? 'Processing...' : isApprovalNeeded ? 'Approve Required' : 'Approve and Deposit'}
            </StyledButtonPrimary>
            {isApprovalNeeded && (
              <StyledButtonPrimary 
                onClick={handleApproval}
                disabled={isApproving}
                style={{ marginTop: '10px' }}
              >
                {isApproving ? 'Approving...' : 'Approve USDC'}
              </StyledButtonPrimary>
            )}
          </ButtonsRow>
        </PreviewContainer>
      )}
    </>
  );
}; 