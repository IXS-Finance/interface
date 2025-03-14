import { Box, Grid, Stack, Tooltip } from '@mui/material'
import { TYPE } from 'theme'
import { useTheme } from 'styled-components'
import { Card } from './Card'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import { useCurrency } from 'hooks/Tokens'
import { Line } from 'components/Line'
import CurrencyLogo from 'components/CurrencyLogo'
import { NewApproveButton, PinnedContentButton } from 'components/Button'
import useLockReward from '../hooks/useLockReward'
import { VeNFT } from '../graphql/dashboard'
import { formatDate } from 'utils/time'
import { safeTokenFormat } from 'lib/balancer/utils/numbers'
import { WEEK } from 'pages/DexV2/Lock/constants'

const LockRewards = () => {
  const { lockData } = useLockReward()

  const filteredLockData = (lockData?.data as { result: VeNFT[] }[])
    ?.filter((data) => Number(data.result[0]?.expires_at) > 0)
    .map((data) => data.result[0])

  return (
    <Box mb={8}>
      <Stack mb={3} direction="row" alignItems="center" gap={1}>
        <TYPE.label>Locks</TYPE.label>
        <Tooltip title="Info">
          <InfoIcon />
        </Tooltip>
      </Stack>
      {filteredLockData?.map((data) => (
        <Box mb={1} key={`lock-${data.id}`}>
          <Card>
            <TableHeader id={Number(data.id)} />
            <Box my={3}>
              <Line />
            </Box>
            <TableBody data={data} />
          </Card>
        </Box>
      ))}
    </Box>
  )
}

const TableHeader = ({ id }: { id: number }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TYPE.subHeader1 color="text6">Lock #{id}</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1 color="text6">Lock Date</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1 color="text6">Amount</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1 color="text6">Lock Time</TYPE.subHeader1>
      </Grid>
    </Grid>
  )
}

const TableBody = ({ data }: { data: VeNFT }) => {
  const theme = useTheme()
  const currency = useCurrency(data.token)

  const lockDuration = Number(data.expires_at) - Number(data.voted_at)
  const weekToShow = Math.round(lockDuration / WEEK)
  const durationLabel = `${weekToShow} ${weekToShow > 1 ? 'weeks' : 'week'}`

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={3}>
        <Stack direction="row" alignItems="center" gap={1}>
          <CurrencyLogo currency={currency} size="20px" />
          <TYPE.subHeader1>veIXS</TYPE.subHeader1>
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1>{formatDate(Number(data.voted_at))}</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.label fontSize={16}>{safeTokenFormat(data.amount, Number(data.decimals))}</TYPE.label>
      </Grid>
      <Grid item xs={2}>
        <TYPE.label fontSize={16}>{durationLabel}</TYPE.label>
      </Grid>
      <Grid item xs={3}>
        <Stack direction="row" gap={2}>
          <NewApproveButton
            style={{
              color: theme.primary1,
              border: `1px solid ${theme.bg24}`,
              width: 'auto',
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            Increase
          </NewApproveButton>
          <PinnedContentButton
            style={{
              width: 'auto',
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            Extend
          </PinnedContentButton>
        </Stack>
      </Grid>
    </Grid>
  )
}

export default LockRewards
