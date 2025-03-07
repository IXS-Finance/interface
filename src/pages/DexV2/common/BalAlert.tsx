// BalAlert.tsx
import React from 'react';
import styled from 'styled-components';
import { AlertCircle, Sun } from 'react-feather';

// Define the allowed types and sizes.
export type AlertType = 'warning' | 'error' | 'info' | 'tip';
export type SizeType = 'sm' | 'md' | 'lg';

interface BalAlertProps {
  className?: string;
  type?: AlertType;
  size?: SizeType;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actionLabel?: string;
  raised?: boolean;
  block?: boolean;
  contentClass?: string;
  square?: boolean;
  noBorder?: boolean;
  dismissable?: boolean;
  onActionClick?: () => void;
  onClose?: () => void;
  children?: React.ReactNode; // used as default slot content
}

// ----- Styled Components ----- //

interface AlertContainerProps {
  alertType: AlertType;
  size: SizeType;
  raised: boolean;
  block: boolean;
  square: boolean;
  noBorder: boolean;
}

const AlertContainer = styled.div<AlertContainerProps>`
  position: relative;
  background-color: ${({ alertType }) => {
    switch (alertType) {
      case 'tip':
        return '#eff6ff';
      case 'warning':
        return '#fffaf0';
      case 'error':
        return '#fff5f5';
      default:
        return '#f7fafc';
    }
  }};
  border: ${({ noBorder, alertType }) =>
    noBorder
      ? 'none'
      : `1px solid ${
          alertType === 'tip'
            ? '#bfdbfe'
            : alertType === 'warning'
            ? '#fed7aa'
            : alertType === 'error'
            ? '#feb2b2'
            : '#edf2f7'
        }`};
  color: black;
  padding: ${({ size }) => (size === 'sm' ? '4px' : '8px')};
  box-shadow: ${({ raised }) =>
    raised ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'};
  width: ${({ block }) => (block ? '100%' : 'auto')};
  border-radius: ${({ square }) => (square ? '0' : '8px')};
`;

interface InnerContainerProps {
  centerContent: boolean;
}

const InnerContainer = styled.div<InnerContainerProps>`
  display: flex;
  flex-grow: 1;
  align-items: ${({ centerContent }) => (centerContent ? 'center' : 'flex-start')};
`;

interface IconContainerProps {
  size: SizeType;
  alertType: AlertType;
}

const getIconColors = (alertType: AlertType) => {
  switch (alertType) {
    case 'tip':
      return { color: '#2b6cb0', backgroundColor: 'transparent' };
    case 'warning':
      return { color: '#dd6b20', backgroundColor: 'rgba(234, 88, 12, 0.1)' };
    case 'error':
      return { color: '#f56565', backgroundColor: 'rgba(245, 101, 101, 0.1)' };
    default:
      return { color: '#718096', backgroundColor: 'rgba(0, 0, 0, 0.1)' };
  }
};

const IconContainer = styled.div<IconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  border-radius: 9999px;
  width: ${({ size }) =>
    size === 'sm' ? '20px' : size === 'lg' ? '28px' : '24px'};
  height: ${({ size }) =>
    size === 'sm' ? '20px' : size === 'lg' ? '28px' : '24px'};
  color: ${({ alertType }) => getIconColors(alertType).color};
  background-color: ${({ alertType }) => getIconColors(alertType).backgroundColor};
`;

interface ContentContainerProps {
  centerContent: boolean;
  flexCol: boolean;
}

const ContentContainer = styled.div<ContentContainerProps>`
  display: flex;
  flex-grow: 1;
  min-width: 0;
  align-items: ${({ centerContent }) => (centerContent ? 'center' : 'flex-start')};
  flex-direction: ${({ flexCol }) => (flexCol ? 'column' : 'row')};
`;

interface TitleProps {
  size: SizeType;
  hasDescription: boolean;
}

const Title = styled.h5<TitleProps>`
  margin: 0;
  font-size: ${({ size }) =>
    size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem'};
  font-weight: ${({ hasDescription }) => (hasDescription ? 600 : 400)};
`;

interface DescriptionProps {
  size: SizeType;
  alertType: AlertType;
}

const Description = styled.div<DescriptionProps>`
  margin: 0;
  font-size: ${({ size }) =>
    size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem'};
  font-weight: 400;
  color: ${({ alertType }) =>
    alertType === 'tip' ? 'black' : 'rgba(0, 0, 0, 0.7)'};
  white-space: pre-wrap;
  overflow: hidden;
  word-break: break-word;
`;

interface ActionContainerProps {
  hasDescription: boolean;
}

const ActionContainer = styled.div<ActionContainerProps>`
  ${({ hasDescription }) =>
    hasDescription ? 'margin-top: 4px;' : 'padding-left: 16px;'}
`;

interface ActionButtonProps {
  btnColor: 'yellow' | 'red' | 'gray';
}

const ActionButton = styled.button<ActionButtonProps>`
  padding: 4px 8px;
  font-size: 0.75rem;
  border: none;
  background-color: ${({ btnColor }) => {
    switch (btnColor) {
      case 'yellow':
        return '#f6e05e';
      case 'red':
        return '#fc8181';
      default:
        return '#e2e8f0';
    }
  }};
  color: black;
  border-radius: 4px;
  cursor: pointer;
`;

const DismissButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
`;

// ----- The BalAlert Component ----- //

export const BalAlert: React.FC<BalAlertProps> = ({
  type = 'info',
  size = 'md',
  title = 'A title message',
  description = '',
  actionLabel = '',
  raised = false,
  block = false,
  contentClass = '',
  square = false,
  noBorder = false,
  dismissable = false,
  onActionClick,
  onClose,
  className,
  children,
}) => {
  // Determine if there is any extra content (description or children)
  const hasContent = Boolean(description || children);
  // Center the container when no extra content exists.
  const centerContainer = !hasContent;
  // Use a column layout if extra content exists.
  const flexCol = hasContent;

  // Determine button color based on type.
  let btnColor: 'yellow' | 'red' | 'gray';
  if (type === 'warning') {
    btnColor = 'yellow';
  } else if (type === 'error') {
    btnColor = 'red';
  } else {
    btnColor = 'gray';
  }

  // Compute icon size (matching the IconContainer dimensions).
  const computedIconSize = size === 'sm' ? 20 : size === 'lg' ? 28 : 24;

  return (
    <AlertContainer
      alertType={type}
      size={size}
      raised={raised}
      block={block}
      square={square}
      noBorder={noBorder}
      className={className}
    >
      <InnerContainer centerContent={centerContainer}>
        <IconContainer size={size} alertType={type}>
          {type === 'tip' ? (
            <Sun size={computedIconSize} />
          ) : (
            <AlertCircle size={computedIconSize} />
          )}
        </IconContainer>
        <ContentContainer centerContent={centerContainer} flexCol={flexCol} className={contentClass}>
          <div>
            <Title size={size} hasDescription={hasContent}>
              {title}
            </Title>
            {hasContent && (
              <Description size={size} alertType={type}>
                {children || description}
              </Description>
            )}
          </div>
          {actionLabel && (
            <ActionContainer hasDescription={hasContent}>
              <ActionButton btnColor={btnColor} onClick={onActionClick}>
                {actionLabel}
              </ActionButton>
            </ActionContainer>
          )}
        </ContentContainer>
      </InnerContainer>
      {dismissable && (
        <DismissButton onClick={onClose}>
          ×
        </DismissButton>
      )}
    </AlertContainer>
  );
};
