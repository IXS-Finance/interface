import React from 'react';
import styled from 'styled-components';
import { Trans } from '@lingui/macro';

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  max-width: 480px;
  width: 90%;
  text-align: center;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const SuccessIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #E8F5E9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    width: 32px;
    height: 32px;
    color: #4CAF50;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const ViewButton = styled.button`
  background: #1976D2;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #1565C0;
  }
`;

interface SuccessPopupProps {
  onClose: () => void;
  txHash?: string;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({ onClose, txHash }) => {
  const handleViewOnBlockchain = () => {
    if (txHash) {
      // Adjust the URL based on your network (e.g., Ethereum, Polygon)
      window.open(`https://polygonscan.com/tx/${txHash}`, '_blank');
    }
  };

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        
        <SuccessIcon>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </SuccessIcon>
        
        <Title><Trans>Transaction Successful</Trans></Title>
        
        <Message>
          <Trans>
            Your withdrawal request has been submitted.
            Please wait one (1) working day to claim.
          </Trans>
        </Message>
        
        {txHash && (
          <ViewButton onClick={handleViewOnBlockchain}>
            <Trans>View on Blockchain</Trans>
          </ViewButton>
        )}
      </PopupContent>
    </PopupOverlay>
  );
};