import React from 'react'

import { ReactComponent as telegramImg } from 'assets/launchpad/svg/social/telegram.svg'
import { ReactComponent as xImg } from 'assets/launchpad/svg/social/twitter.svg'
import { ReactComponent as linkedinImg } from 'assets/launchpad/svg/social/linkedin.svg'
import { ReactComponent as youtubeImg } from 'assets/launchpad/svg/social/youtube.svg'
import { ReactComponent as coingekoImg } from 'assets/launchpad/svg/social/coingecko.svg'
import { ReactComponent as discordImg } from 'assets/launchpad/svg/social/discord.svg'
import { ReactComponent as coinmarketcapImg } from 'assets/launchpad/svg/social/m.svg'
import { ReactComponent as redditImg } from 'assets/launchpad/svg/social/reddit.svg'
import { ExternalLink } from 'theme'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import { SocialBlockContainer } from './styleds'

const data = [
  { href: 'https://t.me/ixsfinance', Icon: telegramImg, name: 'telegram' },
  { href: 'https://x.com/IxSwap', Icon: xImg, name: 'twitter' },
  { href: 'https://www.linkedin.com/company/ixswap', Icon: linkedinImg, name: 'linkedin' },
  { href: 'https://www.youtube.com/channel/UCaYPNR-eLs9iuB5ZVKRx-fw', Icon: youtubeImg, name: 'youtube' },
  { href: 'https://www.coingecko.com/en/coins/ix-swap', Icon: coingekoImg, name: 'coingeko' },
  { href: 'https://discord.gg/uHyFMyXjl', Icon: discordImg, name: 'discor' },
  { href: 'https://coinmarketcap.com/currencies/ix-swap/', Icon: coinmarketcapImg, name: 'coinmarket' },
  { href: 'https://www.reddit.com/r/IXSwapOfficial/', Icon: redditImg, name: 'reddit' },
]

export const SocialBlock = () => {
  const { config } = useWhitelabelState()

  return (
    <SocialBlockContainer>
      <div>
        {data.map(({ href, Icon, name }) => {
          const link = config?.footerConfig?.socialLinks?.[name]
          const shouldShow = config?.footerConfig?.socialLinks ? link : true

          if (!shouldShow) return null

          return (
            <ExternalLink href={link || href} key={link || href}>
              <Icon />
            </ExternalLink>
          )
        })}
      </div>
    </SocialBlockContainer>
  )
}