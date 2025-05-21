import { Slider } from '@mui/material'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { useLock } from '../LockProvider'
import { FOUR_YEARS_IN_SECONDS, WEEK } from '../constants'
import { formatAmount } from 'utils/formatCurrencyAmount'

const DurationSlider: React.FC = () => {
  const { userInput, duration, setDuration } = useLock()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(e.target?.value))
  }

  const rangeSelectors = [
    {
      label: '7 Days',
      value: 604800,
    },
    {
      label: '1 Year',
      value: 31536000,
    },
    {
      label: '2 Years',
      value: 63072000,
    },
    {
      label: '3 Years',
      value: 94608000,
    },
    {
      label: '4 Years',
      value: 126230400,
    },
  ]

  const weekToShow = Math.round(duration / WEEK)
  const durationLabel = `${weekToShow} ${weekToShow > 1 ? 'weeks' : 'week'}`
  const votingPower = (+userInput * weekToShow * WEEK) / FOUR_YEARS_IN_SECONDS

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <TYPE.subHeader1 color="blue5">Lock Time</TYPE.subHeader1>
        <TYPE.label>{durationLabel}</TYPE.label>
      </Flex>

      <StyledSlider
        aria-label="Start Weight"
        style={{ color: '#6666FF' }}
        value={duration}
        onChange={(e) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
        step={604800} // 7 days
        min={604800} // 7 days
        max={126230400} // 4 years
      />

      <Flex justifyContent="space-between" mt={2}>
        {rangeSelectors.map((range) => (
          <TYPE.subHeader1
            key={`range-selector-${range.label}`}
            onClick={() => setDuration(range.value)}
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

const StyledSlider = styled(Slider)`
  height: 8px !important;

  .MuiSlider-thumb {
    width: 16px;
    height: 16px;
    border: 3px solid white;
  }
`

export default DurationSlider
