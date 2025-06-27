import { JsonRpcSigner } from '@ethersproject/providers';

import { configService } from 'services/config/config.service';


export async function isBlockedAddress(
  address: string
): Promise<boolean | null> {
  return false;
  // try {
  //   if (!configService.env.WALLET_SCREENING) return false;
  //   trackGoal(Goals.WalletScreenRequest);

  //   const response = await axios.get<WalletScreenResponse>(
  //     `${WALLET_SCREEN_ENDPOINT}?address=${address.toLowerCase()}`
  //   );

  //   trackGoal(Goals.WalletScreened);
  //   return response.data.is_blocked;
  // } catch {
  //   return false;
  // }
}

export async function verifyTransactionSender(signer: JsonRpcSigner) {
  const signerAddress = await signer.getAddress();
  const _isBlockedAddress = await isBlockedAddress(signerAddress);
  // if (_isBlockedAddress) {
  //   isBlocked = true;
  //   throw new Error(
  //     `Rejecting transaction. [${signerAddress}] is a sanctioned wallet.`
  //   );
  // }
}

export async function verifyNetwork(signer: JsonRpcSigner) {
  const userNetwork = await signer.getChainId();
  // if (userNetwork.toString() !== networkId.value.toString()) {
  //   throw new Error('Wallet network does not match app network.');
  // }
}