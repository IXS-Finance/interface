import React, { useMemo } from 'react';
import styled from 'styled-components';
import { buildNetworkIconURL } from 'lib/utils/urls';
import { configService } from 'services/config/config.service';
import useNetwork from 'hooks/dex-v2/useNetwork';



const BridgeLink: React.FC = () => {
  const { networkId } = useNetwork();

  const bridgeUrl = useMemo((): string => configService.network.bridgeUrl, []);
  const label = useMemo(
    (): string => `Bridge assets to ${configService.network.chainName}`,
    []
  );

  return (
    <LinkContainer href={bridgeUrl} target="_blank" rel="noopener noreferrer">
      <NetworkIcon src={buildNetworkIconURL(networkId)} alt={label} />
      {label}
      <ArrowIcon>↗</ArrowIcon>
    </LinkContainer>
  );
};

export default BridgeLink;

const LinkContainer = styled.a`
  display: flex;
  align-items: center;
  padding: 1rem; /* equivalent to Tailwind's p-4 */
  font-size: 0.875rem; /* Tailwind text-sm */
  border: 1px solid #ccc; /* approximate border style */
  border-radius: 0.5rem; /* Tailwind rounded-lg */
  text-decoration: none;
  color: inherit;
`;

const NetworkIcon = styled.img`
  margin-right: 1rem; /* Tailwind mr-4 */
  width: 1.5rem; /* Tailwind w-6 */
  height: 1.5rem; /* Tailwind h-6 */
`;

const ArrowIcon = styled.span`
  margin-left: 0.5rem; /* Tailwind ml-2 */
  color: #6b7280; /* Tailwind text-gray-500 */
  transition: color 0.3s;
  cursor: pointer;

  &:hover {
    color: #3b82f6; /* Tailwind hover:text-blue-500 */
  }
`;