import { Box, Button, Grid, Stack, Tooltip } from "@mui/material"
import { TYPE } from "theme"
import styled, { useTheme } from "styled-components"
import { Card } from "./Card"
import { ReactComponent as AddIcon } from 'assets/images/plus-blue.svg'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import DoubleCurrencyLogo from "components/DoubleLogo"
import { useCurrency } from "hooks/Tokens"
import { Line } from "components/Line"
import CurrencyLogo from 'components/CurrencyLogo'
import { Currency } from "@ixswap1/sdk-core"
import { NewApproveButton, PinnedContentButton } from "components/Button"

const LiquidityRewards = () => {
  return (
    <Box mb={8}>
      <Stack mb={3} direction='row' alignItems='center' justifyContent='space-between'>
        <Stack direction='row' alignItems='center' gap={1}>
          <TYPE.label>Deposited and Staked Liquidity</TYPE.label> 
          <Tooltip title="Info">
            <InfoIcon />
          </Tooltip>
        </Stack>
        <StyledButton startIcon={<AddIcon />}>
          New Deposit
        </StyledButton>
      </Stack>
      <Card>
        <TableHeader />
        <Box my={3}>
          <Line />
        </Box>
        <TableBody />
      </Card>
    </Box>
  )
}

const TableHeader = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TYPE.subHeader1>Deposit #124</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1>Pool Total</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1>Staked</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1>Unstaked</TYPE.subHeader1>
      </Grid>
    </Grid>
  )
}

const TableBody = () => {
  const theme = useTheme()
  const currency0 = useCurrency('0x949546713004ee02537292b1F41046f705909191')
  const currency1 = useCurrency('0xA9c2c7D5E9bdA19bF9728384FFD3cF71Ada5dfcB')

  return (
    <Grid container spacing={2} alignItems='center'>
      <Grid item xs={3}>
        <Box width={40}>
          {currency0 && currency1 ? <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={32} /> : null}
        </Box>
        <Box my={1}>
          <TYPE.label fontSize={16}>veIXS/USDT</TYPE.label>
        </Box>
        <Stack direction='row' alignItems='center' gap={1}>
          <TYPE.subHeader1 color='yellow69'>Weighted</TYPE.subHeader1>
          <Dot />
          <TYPE.subHeader1 color='text6'>50/50</TYPE.subHeader1>
          <Tooltip title="Info">
            <InfoIcon width={12} />
          </Tooltip>
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <Stack gap={1}>
          {currency0 ? <StyledLiquidItem currency={currency0} />: null}
          {currency1 ? <StyledLiquidItem currency={currency1} />: null}
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <Stack gap={1}>
          {currency0 ? <StyledLiquidItem currency={currency0} />: null}
          {currency1 ? <StyledLiquidItem currency={currency1} />: null}
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <Stack gap={1}>
          {currency0 ? <StyledLiquidItem currency={currency0} />: null}
          {currency1 ? <StyledLiquidItem currency={currency1} />: null}
        </Stack>
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
          Withdraw
        </NewApproveButton>
        <PinnedContentButton
          style={{
            width: 'auto',
            paddingTop: 12,
            paddingBottom: 12,
          }}
        >
          Stake
        </PinnedContentButton>
        </Stack>
      </Grid>
    </Grid>
  )
}

const StyledLiquidItem = ({ currency }: { currency: Currency }) => {
  return (
    <Stack direction='row' alignItems='center' gap={1}>
      <CurrencyLogo currency={currency} size='20px' />
      <TYPE.subHeader1 color='text6'>veIXS</TYPE.subHeader1>
      <TYPE.subHeader1>4,592.00</TYPE.subHeader1>
    </Stack>
  )
}

export default LiquidityRewards

const StyledButton = styled(Button)`
  &.MuiButton-root {
    background: ${({ theme }) => theme.white};
    text-transform: unset;
    padding: 12px 32px;
  }

  &.MuiButton-root:hover {
    background: ${({ theme }) => theme.white};
  }
`

const Dot = styled.div`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text6};
`
