import React from 'react'
import { cn } from '../utils/cn'

// Navigation items from the design
const navigationItems = [
  { icon: '💰', label: 'Earn', href: '/earn' },
  { icon: '🚀', label: 'Launchpad', href: '/launchpad' },
  { icon: '💧', label: 'Liquidity Pools', href: '/pools' },
  { icon: '🔄', label: 'Swap', href: '/swap' },
  { icon: '🏢', label: 'RWAs', href: '/rwas' },
  { icon: '📈', label: 'DEX', href: '/dex' },
  { icon: '📊', label: 'Charts', href: '/charts' },
  { icon: '🌉', label: 'Bridge', href: '/bridge' },
]

interface NavItemProps {
  icon: string
  label: string
  href: string
  isActive?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, isActive = false }) => {
  return (
    <a
      href={href}
      className={cn(
        'btn-nav-item',
        isActive && 'active'
      )}
    >
      <span className="text-white text-xl">{icon}</span>
      <span>{label}</span>
    </a>
  )
}

interface WalletButtonProps {
  isConnected?: boolean
  onClick?: () => void
}

const WalletButton: React.FC<WalletButtonProps> = ({ isConnected = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="btn-connect-wallet"
    >
      {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
    </button>
  )
}

/**
 * IXS Welcome Page component matching the Figma design
 * Uses the new design system colors and components
 */
export const IXSWelcomePage: React.FC = () => {
  return (
    <div className="flex h-screen bg-dark-200">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="flex items-center">
          <div className="text-white text-2xl font-bold">
            🔸 IXS
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          {navigationItems.map((item, index) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={index === 0} // First item active for demo
            />
          ))}
        </nav>

        {/* Footer Links */}
        <div className="text-sm text-light-400 space-y-1">
          <div>Privacy Policy</div>
          <div>Terms & Conditions</div>
          <div>Cookie Settings</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header with Wallet Button */}
        <header className="flex justify-end mb-12">
          <WalletButton />
        </header>

        {/* Welcome Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl">
            {/* Subtitle */}
            <p className="text-lg text-muted mb-5 opacity-50">
              Enable full access to all IXS features
            </p>

            {/* Main Heading */}
            <h1 className="heading-hero mb-5">
              To get started, please<br />
              connect your wallet.
            </h1>

            {/* Connect Wallet Button */}
            <div className="mb-20">
              <WalletButton />
            </div>

            {/* Description */}
            <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
              While your wallet is not connected, feel free to explore our{' '}
              <span className="text-white">Staking Program</span>,{' '}
              <span className="text-white">Liquidity Mining on Polygon</span>, and{' '}
              <span className="text-white">Liquidity Mining on Ethereum</span>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
