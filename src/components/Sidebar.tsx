import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronRight } from 'react-feather'
import logoIcon from 'assets/images/new-dark-ui/layout/logo.svg'
import earnIcon from 'assets/images/new-dark-ui/layout/earn.svg'
import launchpadIcon from 'assets/images/new-dark-ui/layout/launchpad.svg'
import liquidityIcon from 'assets/images/new-dark-ui/layout/liquidity.svg'
import swapIcon from 'assets/images/new-dark-ui/layout/swap.svg'
import rwaIcon from 'assets/images/new-dark-ui/layout/rwa.svg'
import dexIcon from 'assets/images/new-dark-ui/layout/dex.svg'
import chartsIcon from 'assets/images/new-dark-ui/layout/charts.svg'
import bridgeIcon from 'assets/images/new-dark-ui/layout/bridge.svg'
import stakingIcon from 'assets/images/new-dark-ui/layout/staking.svg'

interface SidebarProps {
  className?: string
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isStakingExpanded, setIsStakingExpanded] = useState(false)

  const navigationItems = [
    { icon: earnIcon, label: 'Earn', path: '/earn' },
    { icon: launchpadIcon, label: 'Launchpad', path: '/launchpad' },
    { icon: liquidityIcon, label: 'Liquidity Pools', path: '/liquidity' },
    { icon: swapIcon, label: 'Swap', path: '/swap' },
    { icon: rwaIcon, label: 'RWAs', path: '/rwa' },
    { icon: dexIcon, label: 'DEX', path: '/dex' },
    { icon: chartsIcon, label: 'Charts', path: '/charts' },
    { icon: bridgeIcon, label: 'Bridge', path: '/bridge' },
  ]

  const handleStakingClick = () => {
    setIsStakingExpanded(!isStakingExpanded)
  }

  return (
    <div className={`bg-[#141419] border-r border-[#222328] rounded-l-[32px] p-8 flex flex-col h-screen w-[280px] fixed left-0 top-0 z-[1000] ${className || ''}`}>
      {/* Logo Container */}
      <div className="h-7 w-[83.828px] mb-10">
        <img src={logoIcon} alt="IXS Logo" className="w-full h-full object-contain" />
      </div>

      {/* Navigation Container */}
      <div className="flex flex-col gap-2 flex-1">
        {navigationItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className="flex items-center gap-2.5 px-4 py-3 rounded-[100px] no-underline opacity-50 transition-all duration-200 w-full hover:opacity-80 hover:bg-white/5 [&.active]:opacity-100 [&.active]:bg-[#6666FF]/10"
          >
            <div className="w-5 h-5 flex-shrink-0">
              <img src={item.icon} alt={item.label} className="w-full h-full object-contain" />
            </div>
            <span className="font-inter font-medium text-lg text-white whitespace-nowrap">
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* Staking Item with Expandable Arrow */}
        <div
          onClick={handleStakingClick}
          className="flex items-center justify-between px-4 py-3 rounded-[100px] cursor-pointer opacity-50 transition-all duration-200 w-full hover:opacity-80 hover:bg-white/5"
        >
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 flex-shrink-0">
                <img src={stakingIcon} alt="Staking" className="w-full h-full object-contain" />
              </div>
              <span className="font-inter font-medium text-lg text-white whitespace-nowrap">
                Staking
              </span>
            </div>
            <div className={`w-5 h-5 transition-transform duration-200 ${isStakingExpanded ? 'rotate-90' : 'rotate-0'}`}>
              <ChevronRight size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Container */}
      <div className="flex flex-col gap-1 mt-auto">
        <div className="font-inter font-medium text-sm text-white/30 cursor-pointer leading-8 transition-colors duration-200 hover:text-white/50">
          Privacy Policy
        </div>
        <div className="font-inter font-medium text-sm text-white/30 cursor-pointer leading-8 transition-colors duration-200 hover:text-white/50">
          Terms & Conditions
        </div>
        <div className="font-inter font-medium text-sm text-white/30 cursor-pointer leading-8 transition-colors duration-200 hover:text-white/50">
          Cookie Settings
        </div>
      </div>
    </div>
  )
}

export default Sidebar
