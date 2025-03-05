import React, { useState, useEffect } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { bnum } from 'lib/utils'
import BtnGroup from '../BtnGroup'
import useNumbers from 'hooks/dex-v2/useNumbers'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'

const FIXED_OPTIONS = ['0.005', '0.01', '0.02']

const AppSlippageForm: React.FC = () => {
  const { fNum } = useNumbers()
  const { slippage, setSlippage } = useUserSettings()

  const [fixedSlippage, setFixedSlippage] = useState<string>('')
  const [customSlippage, setCustomSlippage] = useState<string>('')
  const [isCustomInput, setIsCustomInput] = useState<boolean>(false)

  const options: any[] = FIXED_OPTIONS.map((option) => ({
    label: fNum(option, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      fixedFormat: true,
    }),
    value: option,
  }))

  // Compute directly without useMemo:
  const isFixedSlippage = FIXED_OPTIONS.includes(slippage)

  // Compute custom input classes inline
  const customInputClasses =
    !isFixedSlippage && isCustomInput
      ? 'border border-blue-500 text-blue-500'
      : isFixedSlippage && !isCustomInput
      ? 'border'
      : 'border'

  // When a fixed option is selected:
  const onFixedInput = (val: string) => {
    setIsCustomInput(false)
    setCustomSlippage('')
    setSlippage(val)
  }

  const onCustomInput = (val: string) => {
    if (!val) {
      setCustomSlippage('')
      return
    }
    const regex = /^-?\d*[.,]?\d*$/
    const value = val.split(',').join('')

    if (regex.test(value)) {
      setIsCustomInput(true)
      const newVal = bnum(val).div(100).toString()
      setSlippage(newVal)
    }
  }

  useEffect(() => {
    if (isFixedSlippage && !isCustomInput) {
      setFixedSlippage(slippage)
      setCustomSlippage('')
    } else {
      setCustomSlippage(bnum(slippage).times(100).toString())
      setFixedSlippage('')
    }
  }, [slippage, isFixedSlippage, isCustomInput])

  return (
    <Container>
      <CustomInputWrapper className={customInputClasses}>
        <Input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          value={customSlippage}
          onChange={(e) => onCustomInput(e.target.value)}
          placeholder={bnum(slippage).times(100).toString()}
        />
        <PercentText>%</PercentText>
      </CustomInputWrapper>

      <BtnGroup value={fixedSlippage} options={options} onChange={onFixedInput} />
    </Container>
  )
}

export default AppSlippageForm

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  .border {
    border: 1px solid #e6e6ff;
  }

  .border-blue-500 {
    border: 1px solid rgba(102, 102, 255, 0.3);
  }

  .text-blue-500 {
    color: rgba(102, 102, 255, 0.9);
  }
`
const CustomInputWrapper = styled.div`
  display: flex;
  height: 50px;
  padding: 24px 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 8px;
  background: #fff;
`

const Input = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const PercentText = styled.div`
  color: #b8b8cc;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`
