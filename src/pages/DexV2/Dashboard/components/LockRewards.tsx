import { Box, Grid, Stack, Tooltip } from "@mui/material"
import { TYPE } from "theme"
import { useTheme } from "styled-components"
import { Card } from "./Card"
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import { useCurrency } from "hooks/Tokens"
import { Line } from "components/Line"
import CurrencyLogo from 'components/CurrencyLogo'
import { NewApproveButton, PinnedContentButton } from "components/Button"

const LockRewards = () => {
  return (
    <Box mb={8}>
      <Stack mb={3} direction='row' alignItems='center' gap={1}>
        <TYPE.label>Locks</TYPE.label> 
        <Tooltip title="Info">
          <InfoIcon />
        </Tooltip>
      </Stack>
      <Box mb={1}>
        <Card>
          <TableHeader />
          <Box my={3}>
            <Line />
          </Box>
          <TableBody />
        </Card>
      </Box>
      <Box mb={1}>
        <Card>
          <TableHeader />
          <Box my={3}>
            <Line />
          </Box>
          <TableBody />
        </Card>
      </Box>
    </Box>
  )
}

const TableHeader = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TYPE.subHeader1 color='text6'>Lock #124</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1 color='text6'>Lock Date</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1 color='text6'>Amount</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1 color='text6'>Lock Time</TYPE.subHeader1>
      </Grid>
    </Grid>
  )
}

const TableBody = () => {
  const theme = useTheme()
  const currency0 = useCurrency('0x949546713004ee02537292b1F41046f705909191')

  return (
    <Grid container spacing={2} alignItems='center'>
      <Grid item xs={3}>
        <Stack direction='row' alignItems='center' gap={1}>
          <CurrencyLogo currency={currency0} size='20px' />
          <TYPE.subHeader1>veIXS</TYPE.subHeader1>
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1>Sep 12, 2024</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.label fontSize={16}>1,000.00</TYPE.label>
      </Grid>
      <Grid item xs={2}>
        <TYPE.label fontSize={16}>30 Days</TYPE.label>
      </Grid>
      <Grid item xs={3}>
        <Stack direction='row' gap={2}>
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
