import React from 'react'
import styled from 'styled-components'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { StakeAction } from './hooks/useStakePreview'

interface StakeSummaryProps {
  action: StakeAction
  fiatValue: string
  sharePercentage: string
}

// ----- Main Component -----
const StakeSummary: React.FC<StakeSummaryProps> = ({ action, fiatValue, sharePercentage }) => {
  const { fNum } = useNumbers()

  return (
    <DataList>
      <DataListTitle>Summary</DataListTitle>
      <DataListRow>
        <Label>
          Total value to&nbsp;
          <LowercaseSpan>{action === 'stake' ? 'Stake' : 'Unstake'}:</LowercaseSpan>
        </Label>
        <Value>
          <CapitalizeSpan>{fNum(fiatValue, FNumFormats.fiat)}</CapitalizeSpan>
          <Tooltip>
            {action === 'stake'
              ? 'The approximate value of the LP tokens you will stake.'
              : 'The approximate value of the LP tokens you will unstake.'}
          </Tooltip>
        </Value>
      </DataListRow>
      <DataListRow>
        <Label>Your total share</Label>
        <Value>
          <CapitalizeSpan>{fNum(sharePercentage, FNumFormats.percent)}</CapitalizeSpan>
          <Tooltip>Your current total share of LP tokens in the pool</Tooltip>
        </Value>
      </DataListRow>
    </DataList>
  )
}

export default StakeSummary

// Dummy translation function; replace with your i18n solution if needed.
const t = (key: string): string => key

// ----- Styled Components -----
const DataList = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
`

const DataListTitle = styled.h4`
  margin-bottom: 12px;
`

const DataListRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  &:not(:last-child) {
    border-bottom: 1px solid #ccc;
  }
`

const Label = styled.div`
  display: flex;
  align-items: center;
`

const Value = styled.div`
  display: flex;
  align-items: center;
`

const LowercaseSpan = styled.span`
  text-transform: lowercase;
`

const CapitalizeSpan = styled.span`
  text-transform: capitalize;
`

const Tooltip = styled.div`
  margin-left: 8px;
  width: 40px;
  text-align: center;
  background: #eee;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
`
