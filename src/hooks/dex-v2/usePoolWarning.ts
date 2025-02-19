import { configService } from 'services/config/config.service'
import { PoolWarning } from 'types/pools'

const issues: any = configService.network.pools.Issues || {}

const poolWarnings: any = {
  bugWarning20220513: {
    title:
      'This pool contains double-entrypoint tokens, which have been found to be incompatible with Balancer. It is currently not possible to withdraw all assets from the pool proportionally. While it is possible to withdraw in a single asset, liquidity providers are advised to wait. A mechanism is being implemented to allow for proportional withdrawals. <a href="https://forum.balancer.fi/t/medium-severity-bug-found/3161" target="blank" rel="noreferrer" class="underline">Learn more </a>',
  },
  poolOwnerVulnWarningGovernance: {
    title:
      'This pool is affected by a vulnerability disclosed <a href="https://forum.balancer.fi/t/vulnerability-disclosure/3179" target="blank" rel="noreferrer" class="underline">here</a>. Reach out on Discord if you need help creating a new pool with the same composition.',
    description: '',
  },
  poolOwnerVulnWarningGovernanceMigrate: {
    title:
      'This pool is affected by a vulnerability disclosed <a href="https://forum.balancer.fi/t/vulnerability-disclosure/3179" target="blank" rel="noreferrer" class="underline">here</a>. You\'re advised to migrate your liquidity.',
    description: '',
  },
  poolOwnerVulnWarningGovernanceWithdraw: {
    title:
      'This pool was deprecated due to a <a href="https://forum.balancer.fi/t/vulnerability-disclosure/3179" target="blank" rel="noreferrer" class="underline">vulnerability</a>. You\'re advised to withdraw your liquidity asap. Add it to the <a href="https://app.balancer.fi/#/ethereum/pool/0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d" target="blank" rel="noreferrer" class="underline">upgraded pool</a> to participate in liquidity incentives.',
    description: '',
  },
  poolOwnerVulnWarningEcosystem: {
    title:
      'This pool is affected by a vulnerability disclosed <a href="https://forum.balancer.fi/t/vulnerability-disclosure/3179" target="blank" rel="noreferrer" class="underline">here</a>. Reach out on Discord if you need help creating a new pool with the same composition.',
  },
  poolOwnerVulnWarningEcosystemMigrate: {
    title:
      'This pool is affected by a vulnerability disclosed <a href="https://forum.balancer.fi/t/vulnerability-disclosure/3179" target="blank" rel="noreferrer" class="underline">here</a>. You\'re advised to migrate your liquidity.',
  },
  renBTCWarning: {
    title:
      'You are strongly advised to withdraw any liquidity from this pool ASAP to avoid losses! Ideally you should withdraw in a proportional fashion to reduce price impact. The Ren 1.0 network is expected to be <a href="https://medium.com/renproject/moving-on-from-alameda-da62a823ce93" target="blank" rel="noreferrer" class="underline">sunset</a> in December 2022. This will render this version of the renBTC token as valueless, which will trend the overall pool value towards zero. Ren Protocol also strongly advises to <a href="https://twitter.com/renprotocol/status/1595807696296751104" target="blank" rel="noreferrer" class="underline">bridge all ren assets</a> back to their native chain ASAP to avoid being left holding a valueless token which can no longer be redeemed for the native asset.',
  },
  eulerBoostedWarning: {
    title:
      'Due to an exploit on Euler, this pool has been set to recovery mode by the <a href="https://docs.balancer.fi/concepts/governance/emergency.html" target="blank" rel="noreferrer" class="underline">Emergency multisig</a>. Euler has disabled the transferability of eTokens so withdrawals from this pool are not possible until that functionality is restored.',
  },
  eulerRecoveryModeWarning: {
    title:
      'Due to an exploit on Euler this pool has been set to recovery mode by the <a href="https://docs.balancer.fi/concepts/governance/emergency.html" target="blank" rel="noreferrer" class="underline">Emergency multisig</a>. Proportional withdrawals are enabled in the UI and you are encouraged to withdraw as soon as possible.',
  },
  poolProtocolFeeVulnWarning: {
    title:
      'A vulnerability has been discovered that affects this pool. Existing liquidity providers should remove liquidity immediately. <a href="https://twitter.com/Balancer/status/1611363559685898247" target="blank" rel="noreferrer" class="underline">Read more</a>',
    tooltip:
      'A vulnerability has been discovered that affects this pool. Existing liquidity providers should remove liquidity immediately.',
  },
  cspPoolVulnWarning: {
    title:
      'A vulnerability has been discovered that affects this pool. Existing liquidity providers should remove liquidity immediately. <a href="https://forum.balancer.fi/t/vulnerability-found-in-some-pools/5102/1" target="blank" rel="noreferrer" class="underline">Read more</a>',
    tooltip:
      'A vulnerability has been discovered that affects this pool. Existing liquidity providers should remove liquidity immediately.',
    generalTitle:
      'A vulnerability has been discovered that affects a number of pools. Existing liquidity providers should remove liquidity immediately.',
  },
  fxPoolVulnWarning: {
    title:
      'Xave\'s FXPools are potentially affected by a bug. Xave recommends that LPs temporarily remove liquidity from this pool. <a href="https://twitter.com/XaveFinance/status/1725089131330756628" target="blank" rel="noreferrer" class="underline">Read more</a>',
    tooltip:
      'Xave\'s FXPools are potentially affected by a bug. Xave recommends that LPs tA vulnerability has been discovered that affects this pool. Existing liquidity providers should remove liquidity immediately. <a href="https://twitter.com/Balancer/status/1611363559685898247" target="blank" rel="noreferrer" class="underline">Read more</a>emporarily remove liquidity from this pool',
  },
  rateProviderWarning: {
    title:
      'A low severity rate provider issue has been discovered that affects this pool. Existing liquidity providers should remove liquidity as soon as possible.',
    tooltip:
      'A low severity rate provider issue has been discovered that affects this pool. Existing liquidity providers should remove liquidity as soon as possible.',
  },
}

export function usePoolWarning(poolId: string) {
  // Compute the array of issue keys that affect this pool.
  const issueKeys: PoolWarning[] = Object.keys(issues)
    .map((issueKey) => (issues[issueKey].includes(poolId) ? issueKey : null))
    .filter((key): key is PoolWarning => !!key)

  // Determine whether the pool is affected by any issues.
  const isAffected = issueKeys.length > 0

  // Create an array of warning objects with translated title and description.
  const warnings = issueKeys.map((issueKey) => ({
    title: poolWarnings[issueKey].title,
    description: poolWarnings[issueKey]?.description,
  }))

  // Helper function to check if the pool is affected by a specific issue.
  function isAffectedBy(issueKey: PoolWarning): boolean {
    return issueKeys.includes(issueKey)
  }

  return {
    isAffected,
    warnings,
    isAffectedBy,
  }
}
