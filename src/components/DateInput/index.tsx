import React, { useState } from 'react'
import { MobileDatePicker } from '@material-ui/pickers'
import styled from 'styled-components'
import { Input } from 'components/Input'
import { ReactComponent as CalendarIcon } from 'assets/images/newCalendar.svg'
import { Props as LabelProps } from 'components/Label'
import dayjs from 'dayjs'
import Row from 'components/Row'
import { KycInputLabel } from 'pages/KYC/common'
import { TYPE } from 'theme'

interface Props {
  value?: any
  onChange: (value: any) => void
  name?: string
  error?: any | JSX.Element
  openTo?: 'date' | 'year' | 'month'
  maxHeight?: number
  maxDate?: any
  minDate?: any
  placeholder?: string
  isDisabled?: boolean
  format?: string
  id?: any
  isDelayed?: boolean
}

export const DateInput = ({
  id,
  value,
  openTo,
  onChange,
  label = 'Date of Birth',
  error,
  maxDate,
  tooltipText,
  placeholder,
  isDisabled = false,
  format,
  isDelayed,
  ...props
}: Props & Partial<LabelProps>) => {
  const [isDatePickerOpen, setDatePickerOpen] = useState(false)
  const handleIconClick = () => {
    setDatePickerOpen(true)
  }
  const handleCloseDatePicker = () => {
    setDatePickerOpen(false)
  }
  const handleInputClick = () => {
    setDatePickerOpen(true)
  }
  return (
    <Container>
      <KycInputLabel label={`${label}`} error={error} tooltipText={tooltipText} />
      {(isDisabled && value) || isDelayed ? (
        <Row>
          {dayjs(value).format(format || 'MMM DD, YYYY')} <CalendarIcon style={{ marginLeft: 9 }} />
        </Row>
      ) : (
        <MobileDatePicker
          open={isDatePickerOpen}
          onClose={handleCloseDatePicker}
          value={value}
          onChange={onChange}
          openTo={openTo ?? 'year'}
          views={['year', 'month', 'date']}
          inputFormat="DD/MM/YYYY"
          disableCloseOnSelect={false}
          renderInput={({ inputProps }: Record<string, any>) => (
            <TextFieldContainer className="dateInput">
              <TextField
                {...inputProps}
                data-testid={id}
                placeholder={placeholder}
                disabled={isDisabled}
                error={error}
                onClick={handleInputClick}
              />
              <StyledCalendarIcon onClick={handleIconClick} />
            </TextFieldContainer>
          )}
          disabled={isDisabled}
          maxDate={maxDate}
          {...props}
        />
      )}
      {error && (
        <TYPE.small marginTop="4px" color={'red1'}>
          {error}
        </TYPE.small>
      )}
    </Container>
  )
}

const TextFieldContainer = styled.div`
  position: relative;
`

const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  right: 26px;
  top: 19px;
  z-index: 1;
  cursor: pointer;
`

const TextField = styled(Input)<{ maxHeight?: number; error?: any }>`
  border-radius: 6px;
  height: 60px;
  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : 'auto')};
  padding: 11px 66px 9px 21px;
  font-weight: normal;
  font-size: 16px;
  border: ${({ error, theme }) => (error ? 'solid 1px' + theme.error : '1px solid #353840')};
  background-color: ${({ theme: { bg0 } }) => bg0};
  cursor: pointer;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
`
