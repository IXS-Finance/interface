/* eslint-disable indent */
import { Web3Provider } from '@ethersproject/providers'
import { useMemo } from 'react'
import type { Account, Chain, Client, Transport } from 'viem'
import { useClient, useWalletClient } from 'wagmi'
import { Config, getConnectorClient } from '@wagmi/core'
import { providers } from 'ethers'

const providersMap = new WeakMap<Client, Web3Provider>()

function clientToProvider(client?: Client<Transport, any>, chainId?: number) {
  if (!client) {
    return undefined
  }
  const { chain, transport } = client

  const ensAddress = chain?.contracts?.ensRegistry?.address
  const network = chain
    ? {
        chainId: chain?.id,
        name: chain?.name,
        ensAddress,
      }
    : chainId
    ? { chainId, name: 'Unsupported' }
    : undefined
  if (!network) {
    return undefined
  }

  if (providersMap?.has(client)) {
    return providersMap.get(client)
  } else {
    const provider = new Web3Provider(transport, network)
    providersMap.set(client, provider)
    return provider
  }
}

/** Hook to convert a viem Client to an ethers.js Provider with a default disconnected Network fallback. */
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useWalletClient({ chainId })
  const disconnectedClient = useClient({ chainId })
  return useMemo(() => clientToProvider(client ?? disconnectedClient, chainId), [chainId, client, disconnectedClient])
}

/** Hook to convert a connected viem Client to an ethers.js Provider. */
export function useEthersWeb3Provider({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useWalletClient({ chainId })
  return useMemo(() => clientToProvider(client, chainId), [chainId, client])
}

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

/** Action to convert a Viem Client to an ethers.js Signer. */
export async function getEthersSigner(
  config: Config,
  { chainId }: { chainId?: number } = {},
) {
  const client = await getConnectorClient(config, { chainId })
  return clientToSigner(client)
}

export async function getEthersProvider(
  config: Config,
  { chainId }: { chainId?: number } = {},
) {
  const client = await getConnectorClient(config, { chainId })
  return clientToProvider(client, chainId)
}