import React, { useMemo } from "react"
import dayjs from "dayjs"
import { Box, Stack } from "@mui/material"
import { TYPE } from "theme"

import CurrencyLogo from "components/CurrencyLogo"
import { Line } from "components/Line"
import { formatNumberWithDecimals } from "state/lbp/hooks"
import { Currency } from '@ixswap1/sdk-core'
import { LockedData } from 'services/balancer/contracts/ve-sugar'

interface LockInfoProps {
  lockDetail: LockedData
  currency?: (Currency & { tokenInfo?: { decimals?: number } }) | null
}

const LockInfo: React.FC<LockInfoProps> = ({ lockDetail, currency }) => {
  const lockDuration = useMemo(() => {
    return dayjs(Number(lockDetail?.expiresAt) * 1000).diff(dayjs(), "days")
  }, [lockDetail?.expiresAt])

  return (
    <Box>
      <Line style={{ margin: 0 }} />
      <Box marginTop={2} marginBottom={2}>
        <Stack direction="row" alignItems="center" gap={1} marginBottom={0.5}>
          <CurrencyLogo currency={currency} size="20px" />
          <TYPE.subHeader1 fontSize={16} color="text6">{currency?.symbol}</TYPE.subHeader1>
          <TYPE.subHeader1 fontSize={16}>{formatNumberWithDecimals(Number(lockDetail?.amount), 4, true)}</TYPE.subHeader1>
          <TYPE.subHeader1 fontSize={16} color="text6">Locked for {lockDuration} days</TYPE.subHeader1>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <CurrencyLogo currency={currency} size="20px" />
          <TYPE.subHeader1 fontSize={16} color="text6">veIXS</TYPE.subHeader1>
          <TYPE.subHeader1 fontSize={16}>{formatNumberWithDecimals(Number(lockDetail?.votingAmount), 4, true)}</TYPE.subHeader1>
          <TYPE.subHeader1 fontSize={16} color="text6">Voting Power Granted</TYPE.subHeader1>
        </Stack>
      </Box>
      <Line style={{ margin: 0 }} />
    </Box>
  )
}

export default LockInfo
