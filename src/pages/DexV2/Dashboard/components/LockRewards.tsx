import React, { useMemo } from 'react'
import { Box, Grid, Stack, Tooltip } from '@mui/material'
import { TYPE } from 'theme'
import { useTheme } from 'styled-components'
import { Card } from './Card'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import { useCurrency } from 'hooks/Tokens'
import { Line } from 'components/Line'
import CurrencyLogo from 'components/CurrencyLogo'
import { NewApproveButton, PinnedContentButton } from 'components/Button'
import { LockItem } from '../graphql/dashboard'
import { formatDate } from 'utils/time'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useLocksQuery from 'hooks/dex-v2/queries/useLocksQuery'
import { routes } from 'utils/routes'
import { useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const LockRewards: React.FC = () => {
  const { account } = useWeb3()
  const { lockRewards } = useLocksQuery(account)

  return (
    <Box mb={8}>
      <Stack mb={3} direction="row" alignItems="center" gap={1}>
        <TYPE.label>Locks</TYPE.label>
        <Tooltip title="Info">
          <InfoIcon />
        </Tooltip>
      </Stack>
      {lockRewards?.map((data) => (
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

const TableBody = ({ data }: { data: LockItem }) => {
  const theme = useTheme()
  const currency = useCurrency(data.token)
  const history = useHistory()

  const durationLabel = useMemo(() => {
    const durationMs = dayjs(+data.expiresAt * 1000).diff(dayjs())
    return dayjs.duration(durationMs, 'milliseconds').humanize()
  }, [data.expiresAt])

  const handleIncrease = () => {
    const searchParams = new URLSearchParams()
    searchParams.set('increase', 'true')

    const path = routes.dexV2LockDetail.replace(':id', data.id)
    history.push(`${path}?${searchParams.toString()}`)
  }

  const handleExtend = () => {
    const searchParams = new URLSearchParams()
    searchParams.set('extend', 'true')

    const path = routes.dexV2LockDetail.replace(':id', data.id)
    history.push(`${path}?${searchParams.toString()}`)
  }

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={3}>
        <Stack direction="row" alignItems="center" gap={1}>
          <CurrencyLogo currency={currency} size="32px" />
          <TYPE.subHeader1 fontSize={16}>veIXS</TYPE.subHeader1>
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1>{data.votedAt === '0' ? 'N/A' : formatDate(Number(data.votedAt))}</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.label fontSize={16}>{data.amount}</TYPE.label>
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
            onClick={handleIncrease}
          >
            Increase
          </NewApproveButton>
          <PinnedContentButton
            style={{
              width: 'auto',
              paddingTop: 12,
              paddingBottom: 12,
            }}
            onClick={handleExtend}
          >
            Extend
          </PinnedContentButton>
        </Stack>
      </Grid>
    </Grid>
  )
}

export default LockRewards
