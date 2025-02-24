import config from 'lib/config';
import { Network } from 'lib/config/types';

function getNetworkIconName(network: Network) {
  return config[Number(network)].slug;
}

export function buildNetworkIconURL(network: Network | string): string {
  const networkName =
    typeof network === 'string' ? network : getNetworkIconName(network);

  // Assumes your icons are in public/assets/images/icons/networks/
  return `/images/icons/networks/${networkName}.svg`;
}

export function buildServiceIconURL(service: string): string {
  // Assumes your service icons are in public/assets/images/services/
  return `/images/services/${service}.svg`;
}

export function buildConnectorIconURL(wallet: any): string {
  // Assumes your connector icons are in public/assets/images/connectors/
  return `/images/connectors/${wallet}.svg`;
}

export function buildProtocolIconURL(protocol: string): string {
  // Assumes your protocol icons are in public/assets/images/icons/protocols/
  return `/images/icons/protocols/${protocol}.svg`;
}
