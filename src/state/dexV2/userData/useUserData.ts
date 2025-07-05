
/**
 * Provides user data on wallet connection or change.
 *
 * Fetch any user data that needs to be generally accessible here.
 */
// import useStakedSharesQuery from '@/composables/queries/useStakedSharesQuery';
// import useUserBoostsQuery from '@/composables/queries/useUserBoostsQuery';
// import useUserGaugeSharesQuery from '@/composables/queries/useUserGaugeSharesQuery';
// import useUserPoolSharesQuery from '@/composables/queries/useUserPoolSharesQuery';
// import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';

export const userDataProvider = () => {
  // /**
  //  * COMPOSABLES
  //  */
  // // Fetch all user's pool shares.
  // const userPoolSharesQuery = useUserPoolSharesQuery();

  // // Fetches all user's gaugeShares.
  // const userGaugeSharesQuery = useUserGaugeSharesQuery();
  // const { data: userGaugeShares } = userGaugeSharesQuery;

  // // Fetch all user's staked share balances via onchain multicall.
  // const stakedSharesQuery = useStakedSharesQuery(userGaugeShares);

  // // Fetches map of boost values for user's staked shares.
  // const userBoostsQuery = useUserBoostsQuery(userGaugeShares);

  // const lockQuery = useVeBalLockInfoQuery();

  return {
    // userPoolSharesQuery,
    // userGaugeSharesQuery,
    // stakedSharesQuery,
    // userBoostsQuery,
    // lockQuery,
  };
};