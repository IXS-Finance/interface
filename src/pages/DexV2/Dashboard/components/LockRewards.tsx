import React, { useMemo, useState } from 'react'
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
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useLocksQuery from 'hooks/dex-v2/queries/useLocksQuery'
import { routes } from 'utils/routes'
import { useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import { useVotingEscrowContract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'
import EmptyList from './EmptyList'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import { formatAmount } from 'utils/formatCurrencyAmount'

const LockRewards: React.FC = () => {
  const { account } = useWeb3()
  const { lockRewards, isLoadingLockRewards, refetch } = useLocksQuery(account)

  return (
    <Box mb={8}>
      <Stack mb={3} direction="row" alignItems="center" gap={1}>
        <TYPE.label>Locks</TYPE.label>
        <Tooltip title="Info">
          <InfoIcon />
        </Tooltip>
      </Stack>
      {isLoadingLockRewards ? (
        <LoadingBlock style={{ height: '132px' }} />
      ) : (
        (!lockRewards || lockRewards?.length === 0) && <EmptyList />
      )}
      {lockRewards?.map((data) => (
        <Box mb={1} key={`lock-${data.id}`}>
          <Card>
            <TableHeader id={Number(data.id)} />
            <Box my={3}>
              <Line />
            </Box>
            <TableBody data={data} refetch={refetch} />
          </Card>
        </Box>
      ))}
    </Box>
  )
}

const TableHeader = ({ id }: { id: number }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <TYPE.subHeader1 color="text6">Lock #{id}</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1 color="text6">Amount</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1 color="text6">Voting Power</TYPE.subHeader1>
      </Grid>
      <Grid item xs={3}>
        <TYPE.subHeader1 color="text6">Unlock At</TYPE.subHeader1>
      </Grid>
    </Grid>
  )
}

const TableBody = ({ data, refetch }: { data: LockItem; refetch: () => void }) => {
  const theme = useTheme()
  const currency = useCurrency(data.token)
  const history = useHistory()
  const votingEscrowContract = useVotingEscrowContract()
  const addTransaction = useTransactionAdder()
  const [withdrawing, setWithdrawing] = useState(false)

  const isNotExpired = useMemo(() => {
    const currentTime = Math.floor(Date.now() / 1000)
    return Number(data.expiresAt) > currentTime
  }, [data.expiresAt])

  const unlockAtLabel = useMemo(() => {
    const date = dayjs(Number(data.expiresAt) * 1000)
    return date.format('ddd MMM DD YYYY HH:mm:ss')
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

  const handleWithdraw = async (tokenId: string) => {
    if (withdrawing) return
    if (!tokenId) return
    try {
      setWithdrawing(true)
      const tx = await votingEscrowContract?.withdraw(tokenId)
      await tx.wait()

      if (!tx.hash) {
        setWithdrawing(false)
        return
      }
      addTransaction(tx, {
        summary: `Withdraw ${tokenId}`,
      })

      refetch()

      setTimeout(() => {
        setWithdrawing(false)
      }, 3000)
    } catch (error) {
      console.error(error)
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          <CurrencyLogo currency={currency} size="32px" />
          <TYPE.subHeader1 fontSize={16}>veIXS</TYPE.subHeader1>
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <TYPE.label fontSize={16}>{data.amount}</TYPE.label>
      </Grid>
      <Grid item xs={2}>
        <TYPE.label fontSize={16}>{formatAmount(+data.votingAmount, 4)} veIXS</TYPE.label>
      </Grid>
      <Grid item xs={3}>
        <TYPE.label fontSize={16}>{unlockAtLabel}</TYPE.label>
      </Grid>
      <Grid item xs={3}>
        {isNotExpired ? (
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
        ) : (
          <PinnedContentButton
            style={{
              width: 'auto',
              paddingTop: 12,
              paddingBottom: 12,
            }}
            onClick={() => handleWithdraw(data.id)}
            disabled={withdrawing}
          >
            Withdraw
          </PinnedContentButton>
        )}
      </Grid>
    </Grid>
  )
}

export default LockRewards
