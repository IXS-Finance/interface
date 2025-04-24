import React, { useMemo } from 'react'
import { Slider } from '@mui/material'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { useParams } from 'react-router-dom'

import { FOUR_YEARS_IN_SECONDS, WEEK } from '../../constants'
import { formatAmount } from 'utils/formatCurrencyAmount'
import { useLockDetail } from '../LockDetailProvider'
import useLockQuery from 'hooks/dex-v2/queries/useLockQuery'

const LockExtendDurationSlider: React.FC = () => {
  const params = useParams<{ id: string }>()
  const lockId = params.id.toLowerCase()
  const { userInput, duration, setDuration } = useLockDetail()
  const { lockDetail } = useLockQuery(lockId)

  const currentTime = Math.floor(Date.now() / 1000)
  const defaultLockTime = lockDetail?.expiresAt ? +lockDetail.expiresAt - currentTime + WEEK : WEEK

  const handleChange = (value?: number) => {
    if (!value) return
    if (value < defaultLockTime) {
      setDuration(defaultLockTime)
      return
    }
    setDuration(value)
  }

  const rangeSelectors = [
    { label: '7 Days', value: WEEK },
    { label: '1 Year', value: 31536000 },
    { label: '2 Years', value: 63072000 },
    { label: '3 Years', value: 94608000 },
    { label: '4 Years', value: 126230400 },
  ]

  const weekToShow = Math.round(duration / WEEK)
  const durationLabel = `${weekToShow} ${weekToShow > 1 ? 'weeks' : 'week'}`
  const votingPower = (+userInput * duration) / FOUR_YEARS_IN_SECONDS

  const [minPercent, maxPercent] = useMemo(() => {
    const range = FOUR_YEARS_IN_SECONDS - WEEK
    const clampedMin = Math.max(defaultLockTime, WEEK)
    const clampedMax = Math.max(duration, clampedMin)
    return [((clampedMin - WEEK) / range) * 100, ((clampedMax - WEEK) / range) * 100]
  }, [defaultLockTime, duration])

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <TYPE.subHeader1 color="blue5">Lock Time</TYPE.subHeader1>
        <TYPE.label>{durationLabel}</TYPE.label>
      </Flex>

      <StyledSlider
        $minPercent={minPercent}
        $maxPercent={maxPercent}
        value={duration}
        onChange={(e) => handleChange(+(e.target as HTMLInputElement)?.value)}
        step={WEEK}
        min={WEEK}
        max={FOUR_YEARS_IN_SECONDS}
      />

      <Flex justifyContent="space-between" mt={2}>
        {rangeSelectors.map((range) => (
          <TYPE.subHeader1
            key={`range-selector-${range.label}`}
            onClick={() => handleChange(range.value)}
            style={{ cursor: 'pointer' }}
            color={duration >= range.value ? 'text1' : 'blue5'}
          >
            {range.label}
          </TYPE.subHeader1>
        ))}
      </Flex>

      <Box mt={4}>
        <TYPE.body3>
          Locking for <strong>{durationLabel}</strong> for {formatAmount(votingPower, 2)} veIXS voting power.
        </TYPE.body3>
      </Box>
    </Box>
  )
}

const StyledSlider = styled(Slider)<{
  $minPercent: number
  $maxPercent: number
}>`
  height: 8px !important;

  .MuiSlider-rail {
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(
      to right,
      #cdcdde 0%,
      #cdcdde ${({ $minPercent }) => $minPercent}%,
      #6666ff ${({ $minPercent }) => $minPercent}%,
      #6666ff ${({ $maxPercent }) => $maxPercent}%,
      #cdcdde ${({ $maxPercent }) => $maxPercent}%,
      #cdcdde 100%
    );
    opacity: 1;
  }

  .MuiSlider-track {
    height: 8px;
    background-color: transparent !important;
    border: none;
  }

  .MuiSlider-thumb {
    width: 16px;
    height: 16px;
    border: 3px solid white;
    background-color: #6666ff;
  }

  .MuiSlider-mark {
    background-color: #cdcdde;
  }
`

export default LockExtendDurationSlider
