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
      : ''

  // When a fixed option is selected:
  const onFixedInput = (val: string) => {
    setIsCustomInput(false)
    setCustomSlippage('')
    setSlippage(val)
  }

  // When a custom value is entered:
  const onCustomInput = (val: string) => {
    if (!val) return
    setIsCustomInput(true)
    const newVal = bnum(val).div(100).toString()
    setSlippage(newVal)
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
    <Flex css={{ gap: '0.5rem' }}>
      <BtnGroup value={fixedSlippage} options={options} onChange={onFixedInput} />
      <CustomInputWrapper className={customInputClasses}>
        <Input
          value={customSlippage}
          onChange={(e) => onCustomInput(e.target.value)}
          placeholder="0.1"
          type="number"
          step="any"
          min="0"
        />
        <div className="px-2">%</div>
      </CustomInputWrapper>
    </Flex>
  )
}

export default AppSlippageForm

const CustomInputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0.25rem;
  border-radius: 0.375rem;
  border: 1px solid #e6e6ff;

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

const Input = styled.input`
  width: 3rem;
  text-align: right;
  background: transparent;
  border: none;
  outline: none;
`
