import { isLocal } from 'utils/isEnvMode'

export const API_URL =
  isLocal && process.env.REACT_APP_USE_LOCAL_BACKEND === 'true'
    ? process.env.REACT_APP_API_URL_LOCAL
    : process.env.REACT_APP_API_URL
export const SECURITY_TOKENS = process.env.REACT_APP_SECURITY_TOKENS === 'true'
export const STAKING_CONTRACT_KOVAN =
  process.env.REACT_APP_STAKING_CONTRACT_KOVAN || '0xf49A087aA48C0A4f0dEa6428F1175e1bB45CDAa2'
export const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY
export const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY
export const PRODUCTION_APP_URL = process.env.REACT_APP_PRODUCTION_APP_URL || 'app.ixs.finance'
export const BRIDGE_ADMIN_URL = process.env.REACT_APP_BRIDGE_ADMIN_URL || 'https://bridge-admin.ixs.finance'
export const BRIDGE_URL = process.env.REACT_APP_BRIDGE_URL || 'https://bridge.ixs.finance'
export const ALCHEMY_KEY = process.env.REACT_APP_ALCHEMY_KEY || ''
export const ENV = process.env.REACT_APP_ENV || 'development'
export const TELEGRAM_VERIFICATION_BOT = process.env.REACT_APP_TELEGRAM_VERIFICATION_BOT || ''
export const IXSALE_ADDRESS_BASE = process.env.REACT_APP_IXSALE_ADDRESS_BASE || ''
export const IXSALE_ADDRESS_BASE_SEPOLIA = process.env.REACT_APP_IXSALE_ADDRESS_BASE_SEPOLIA || ''
export const IXSALE_ADDRESS_POLYGON = process.env.REACT_APP_IXSALE_ADDRESS_POLYGON || ''
export const IXSALE_ADDRESS_AMOY = process.env.REACT_APP_IXSALE_ADDRESS_AMOY || ''
export const IXSALE_ADDRESS_MUMBAI = process.env.REACT_APP_IXSALE_ADDRESS_MUMBAI || ''
export const SUPPORTED_TGE_CHAINS = process.env.REACT_APP_SUPPORTED_TGE_CHAINS || [84532, 80002]
export const JUMPTASK_SECURITY_TOKENS = process.env.REACT_APP_JUMPTASK_SECURITY_TOKENS || '';
export const DEFAULT_CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID || SUPPORTED_TGE_CHAINS[0]
export const GAS_PRICE = process.env.REACT_APP_GAS_PRICE || '100000000000'
export const MAX_POOLS = process.env.REACT_APP_MAX_POOLS || '4'
