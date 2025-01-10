import { Contract } from '@ethersproject/contracts'
import { WETH9 } from '@ixswap1/sdk-core'
import { Web3Provider } from '@ethersproject/providers'
import IIxsV2Pair from '@ixswap1/v2-core/build/IIxsV2Pair.json'
import IIxsWSec from '@ixswap1/v2-core/build/IIxsWSec.json'
import IxsGovernanceToken from '@ixswap1/v2-core/build/IxsGovernanceToken.json'
import IxsReturningStakeBankPostIdoV1 from '@ixswap1/v2-core/build/IxsReturningStakeBankPostIdoV1.json'
import IxsToken from '@ixswap1/v2-core/build/IxsToken.json'
import IIxsVestedDistribution from '@ixswap1/v2-core/build/IXSVestedDistribution.json'
import IIxsV2LiquidityRouter from '@ixswap1/v2-periphery/build/IIxsV2LiquidityRouter.json'

const IIxsV2PairABI = IIxsV2Pair.abi
const IIxsWSecABI = IIxsWSec.abi
const IxsGovernanceTokenABI = IxsGovernanceToken.abi
const IxsReturningStakeBankPostIdoV1ABI = IxsReturningStakeBankPostIdoV1.abi
const IxsTokenABI = IxsToken.abi
const IIxsVestedDistributionABI = IIxsVestedDistribution.abi
const IIxsV2LiquidityRouterABI = IIxsV2LiquidityRouter.abi

import IIxsV2SwapRouter from 'abis/IxsV2SwapRouter.json'
import PAYOUT_ABI from 'abis/payout.json'
import ARGENT_WALLET_DETECTOR_ABI from 'abis/argent-wallet-detector.json'
import EIP_2612 from 'abis/eip_2612.json'
import ENS_PUBLIC_RESOLVER_ABI from 'abis/ens-public-resolver.json'
import ENS_ABI from 'abis/ens-registrar.json'
import ERC20_ABI from 'abis/erc20.json'
import ERC20_BYTES32_ABI from 'abis/erc20_bytes32.json'
import FAUCET_ABI from 'abis/faucet-contract.json'
import IXS_FAUCET_ABI from 'abis/ixs-faucet-abi.json'
import FAUCET_STABLE_ABI from 'abis/faucet-stable-contract.json'
import MULTICALL_ABI from 'abis/multicall2.json'
import NFT_ABI from 'abis/nft-contract.json'
import WETH_ABI from 'abis/weth.json'
import NFT_CREATE_ABI from 'abis/nft-contract-create.json'
import LAUNCHPAD_INVESTMENT_ABI from 'abis/launchpad-investment.json'
import LBP_ABI from 'abis/LiquiidtyBoostrapPool.json'
import LBP_FACTORY_ABI from 'abis/LiquidityBoostrapPoolFactory.json'
import PAYOUT_AIRDROP_ABI from 'abis/payout-airdrop.json'
import VOTING_ESCROW_ABI from 'abis/voting-escrow.json'
import {
  ARGENT_WALLET_DETECTOR_ADDRESS,
  ENS_REGISTRAR_ADDRESSES,
  IXS_ADDRESS,
  IXS_GOVERNANCE_ADDRESS,
  IXS_STAKING_V1_ADDRESS,
  IXS_VESTING_ADDRESS,
  LIQUIDITY_ROUTER_ADDRESS,
  MULTICALL2_ADDRESSES,
  PAYOUT_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  IXSALE_ADDRESS,
  PAYOUT_AIRDROP_PROXY_ADDRESS,
  VOTING_ESCROW_ADDRESS,
} from 'constants/addresses'
import { useMemo } from 'react'
import { getContract } from 'utils'

import { ArgentWalletDetector, EnsPublicResolver, EnsRegistrar, Erc20, Multicall2, Weth } from '../abis/types'
import { useWeb3React } from 'hooks/useWeb3React'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider: library, account, chainId } = useWeb3React()

  return useMemo(
    () => getContractInstance({ addressOrAddressMap, ABI, withSignerIfPossible, library, chainId, account }),
    [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]
  ) as T
}

interface ContractInstanceProps {
  addressOrAddressMap: string | { [chainId: number]: string } | undefined
  ABI: any
  withSignerIfPossible?: boolean
  library?: Web3Provider
  chainId?: number
  account?: string | null
}

export function getContractInstance({
  addressOrAddressMap,
  ABI,
  withSignerIfPossible = true,
  library,
  chainId,
  account,
}: ContractInstanceProps) {
  if (!addressOrAddressMap || !ABI || !library || !chainId) return null
  let address: string | undefined
  if (typeof addressOrAddressMap === 'string') {
    address = addressOrAddressMap
  } else {
    address = addressOrAddressMap[chainId]
  }
  if (!address) return null
  try {
    const contract = getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    return contract
  } catch (error) {
    console.error('Failed to get contract', error)
    return null
  }
}

export function getTokenContract(tokenAddress: string, library: Web3Provider) {
  return getContract(tokenAddress, ERC20_ABI, library)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  // @ts-ignore
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useNftContract(contractAddress?: string) {
  // sample deployed contract '0xadc2e42d74f57028d7be2da41ba9643bdb70d99b'
  return useContract(contractAddress, NFT_CREATE_ABI)
}

// for using the contract immediately after creating it
export function getNftContract({
  addressOrAddressMap,
  library,
  chainId,
  account,
}: Omit<ContractInstanceProps, 'ABI' | 'withSignerIfPossible'>) {
  return getContractInstance({ addressOrAddressMap, library, chainId, account, ABI: NFT_ABI })
}
export function useVestingContract() {
  return useContract(IXS_VESTING_ADDRESS, IIxsVestedDistributionABI, true)
}

export function useIXSStakingContract() {
  return useContract(IXS_STAKING_V1_ADDRESS, IxsReturningStakeBankPostIdoV1ABI, true)
}

export function useIXSTokenContract() {
  return useContract(IXS_ADDRESS, IxsTokenABI, true)
}

export function useIXSGovTokenContract() {
  return useContract(IXS_GOVERNANCE_ADDRESS, IxsGovernanceTokenABI, true)
}

export function useWETHContract(withSignerIfPossible?: boolean) {
  const { chainId } = useWeb3React()
  // @ts-ignore
  return useContract<Weth>(chainId ? WETH9[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract() {
  // @ts-ignore
  return useContract<ArgentWalletDetector>(ARGENT_WALLET_DETECTOR_ADDRESS, ARGENT_WALLET_DETECTOR_ABI, false)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
  // @ts-ignore
  return useContract<EnsRegistrar>(ENS_REGISTRAR_ADDRESSES, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean) {
  // @ts-ignore
  return useContract<EnsPublicResolver>(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IIxsV2PairABI, withSignerIfPossible)
}

export function useSwapRouterContract(): Contract | null {
  return useContract(SWAP_ROUTER_ADDRESS, IIxsV2SwapRouter, true)
}
export function useLiquidityRouterContract(): Contract | null {
  return useContract(LIQUIDITY_ROUTER_ADDRESS, IIxsV2LiquidityRouterABI, true)
}
export function useMulticall2Contract() {
  // @ts-ignore
  return useContract<Multicall2>(MULTICALL2_ADDRESSES, MULTICALL_ABI, false) as Multicall2
}
export function useBurnWSecContract(address: string | undefined) {
  return useContract(address, IIxsWSecABI, true)
}
export function useFaucetContract(tokenAddress: string) {
  return useContract(tokenAddress, FAUCET_ABI, true)
}
export function useStableFaucetContract(tokenAddress: string) {
  return useContract(tokenAddress, FAUCET_STABLE_ABI, true)
}
export function useIXSFaucetContract(tokenAddress: string) {
  return useContract(tokenAddress, IXS_FAUCET_ABI, true)
}

export function usePayoutContract(payoutContractAddress?: string): Contract | null {
  return useContract(payoutContractAddress || PAYOUT_ADDRESS, PAYOUT_ABI, true)
}

export function usePayoutAirdropContract(payoutAirdropContractAddress?: string): Contract | null {
  return useContract(payoutAirdropContractAddress || PAYOUT_AIRDROP_PROXY_ADDRESS, PAYOUT_AIRDROP_ABI, true)
}

export function useLaunchpadInvestmentContract(contractAddress: string) {
  return useContract(contractAddress || IXSALE_ADDRESS, LAUNCHPAD_INVESTMENT_ABI, true)
}

export function useLBPContract(contractAddress: string) {
  return useContract(contractAddress, LBP_ABI, true)
}

export function useLBPFactory(contractAddress: string) {
  return useContract(contractAddress, LBP_FACTORY_ABI, true)
}

export function useVotingEscrowContract() {
  return useContract(VOTING_ESCROW_ADDRESS, VOTING_ESCROW_ABI, true)
}
