import { Slider } from "@mui/material"
import { Box, Button, Flex } from "rebass"
import styled from "styled-components"
import { TYPE } from "theme"
import { useLock } from "../LockProvider"

const WEEK = 604800

const DurationSlider: React.FC = () => {
  const {
    duration,
    setDuration,
  } = useLock()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(e.target?.value));
  };

  const rangeSelectors = [{
    label: '7 Days',
    value: 604800,
  }, {
    label: '1 Year',
    value: 31536000,
  }, {
    label: '2 Years',
    value: 63072000,
  }, {
    label: '3 Years',
    value: 94608000,
  }, {
    label: '4 Years',
    value: 126230400,
  }, ]

  const weekToShow = Math.round(duration / WEEK)

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <TYPE.subHeader1 color='blue5'>Lock Time</TYPE.subHeader1>
        <TYPE.label>{weekToShow} {weekToShow > 1 ? 'weeks' : 'week'}</TYPE.label> 
      </Flex>

      <StyledSlider
        aria-label="Start Weight"
        style={{ color: '#6666FF' }}
        value={duration}
        onChange={e => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
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
