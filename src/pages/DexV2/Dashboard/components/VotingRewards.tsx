import { Box, Button, Chip, Grid, Stack, Tooltip } from "@mui/material"
import { TYPE } from "theme"
import styled, { useTheme } from "styled-components"
import { Card } from "./Card"
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import { ReactComponent as UnlockIcon } from 'assets/images/dex-v2/unlock.svg'
import { useCurrency } from "hooks/Tokens"
import DoubleCurrencyLogo from "components/DoubleLogo"
import CurrencyLogo from "components/CurrencyLogo"

const VotingRewards = () => {
  return (
    <Box>
      <Stack mb={3} direction='row' alignItems='center' gap={1}>
        <TYPE.label>Voting Rewards</TYPE.label> 
        <Tooltip title="Info">
          <InfoIcon />
        </Tooltip>
      </Stack>
      <Box mb={1}>
        <Card>
          <TableBody />
        </Card>
      </Box>
    </Box>
  )
}

const TableBody = () => {
  const theme = useTheme()
  const currency0 = useCurrency('0x949546713004ee02537292b1F41046f705909191')
  const currency1 = useCurrency('0xA9c2c7D5E9bdA19bF9728384FFD3cF71Ada5dfcB')

  return (
    <Grid container spacing={1}>
      <Grid item xs={3} style={{ borderRight: `1px solid ${theme.launchpad.colors.border.default}` }}>
        <Stack direction='row' gap={4}>
          <Box width={40}>
            {currency0 && currency1 ? <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={32} /> : null}
          </Box>
          <Box>
            <TYPE.label fontSize={16}>veIXS/USDT</TYPE.label>
            <Stack direction='row' alignItems='center' gap={1}>
              <TYPE.subHeader1 color='yellow69'>Basic Volatile</TYPE.subHeader1>
              <Dot />
              <Tooltip title="Info">
                <InfoIcon width={12} />
              </Tooltip>
            </Stack>
          </Box>
        </Stack>
        <TYPE.subHeader1>on OP Mainnet</TYPE.subHeader1>
      </Grid>
      <Grid item xs={6}>
        <Stack direction='row' gap={1} mb={1}>
          <TYPE.label fontSize={16}>Lock #27216</TYPE.label>
          <UnlockIcon />
        </Stack>
        <TYPE.label fontSize={14} color='text6'>1.55718 IXS locked</TYPE.label>
      </Grid>
      <Grid item xs={3}>
        <Stack gap={0.5}>
          <Stack direction='row' alignItems='center' justifyContent='flex-end' gap={1}>
            <CurrencyLogo currency={currency0} size='16px' />
            <TYPE.black fontSize={14}>0.00013 IXS</TYPE.black>
            <Chip size='small' label="Fee" />
          </Stack>
          <Stack direction='row' alignItems='center' justifyContent='flex-end' gap={1}>
            <CurrencyLogo currency={currency1} size='16px' />
            <TYPE.black fontSize={14}>0.00002 USDC</TYPE.black>
            <Chip size='small' label="Fee" />
          </Stack>
          <Stack direction='row' alignItems='center' justifyContent='flex-end' gap={1}>
            <CurrencyLogo currency={currency0} size='16px' />
            <TYPE.black fontSize={14}>0.00006 IXS</TYPE.black>
            <Chip size='small' label="Incentive" />
          </Stack>
          <Stack direction='row' alignItems='center' justifyContent='flex-end' gap={1}>
            <CurrencyLogo currency={currency1} size='16px' />
            <TYPE.black fontSize={14}>0.0 USDC</TYPE.black>
            <Chip size='small' label="Incentive" />
          </Stack>
          <Stack direction='row' justifyContent='flex-end'>
            <Button style={{ textTransform: 'none' }}>
              Claim
            </Button>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  )
}

const Dot = styled.div`
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text6};
`

export default VotingRewards
