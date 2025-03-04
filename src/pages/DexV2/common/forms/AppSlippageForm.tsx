// AppSlippageForm.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { bnum } from 'lib/utils'
import BtnGroup from '../BtnGroup'
import useNumbers from 'hooks/dex-v2/useNumbers'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'

// Fixed options (as strings)
const FIXED_OPTIONS = ['0.005', '0.01', '0.02']

const AppSlippageForm: React.FC = () => {
  // Custom hooks
  const { fNum } = useNumbers()
  const { slippage, setSlippage } = useUserSettings() // assume `slippage` is a string

  // Local state equivalent to Vue's reactive state:
  const [fixedSlippage, setFixedSlippage] = useState<string>('')
  const [customSlippage, setCustomSlippage] = useState<string>('')
  const [isCustomInput, setIsCustomInput] = useState<boolean>(false)

  // Build options using fNum to format each fixed option
  const options: any[] = FIXED_OPTIONS.map((option) => ({
    label: fNum(option, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      fixedFormat: true,
    }),
    value: option,
  }))

  // Computed: determine if the current slippage is one of the fixed options
  const isFixedSlippage = useMemo(() => FIXED_OPTIONS.includes(slippage), [slippage])

  // Compute custom input classes (using a simple string; you may use a library like 'classnames' if desired)
  const customInputClasses = useMemo(() => {
    if (!isFixedSlippage && isCustomInput) {
      return 'border border-blue-500 text-blue-500'
    } else if (isFixedSlippage && !isCustomInput) {
      return 'border dark:border-gray-900'
    }
    return ''
  }, [isFixedSlippage, isCustomInput])

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

  // Watch for changes in the slippage value (similar to a Vue watcher)
  useEffect(() => {
    if (isFixedSlippage && !isCustomInput) {
      setFixedSlippage(slippage)
      setCustomSlippage('')
    } else {
      setCustomSlippage(bnum(slippage).times(100).toString())
      setFixedSlippage('')
    }
  }, [slippage, isFixedSlippage, isCustomInput])

  // Watch for changes in customSlippage and trigger custom input logic.
  // (This mimics Vue's watcher on state.customSlippage with immediate: true.)
  useEffect(() => {
    if (customSlippage) {
      onCustomInput(customSlippage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customSlippage])

  return (
    <Flex>
      {/* BalBtnGroup acts as the fixed options selector */}
      <BtnGroup value={fixedSlippage} options={options} onChange={onFixedInput} />
      {/* Custom input container */}
      <CustomInputWrapper className={customInputClasses}>
        <input
          value={customSlippage}
          onChange={(e) => setCustomSlippage(e.target.value)}
          className="w-12 text-right bg-transparent"
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

// Styled container for the custom input
const CustomInputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0.25rem; /* equivalent to Tailwind's px-1 */
  border-radius: 0.375rem; /* rounded-lg */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06); /* approximate for shadow-inner */

  .w-12 {
    width: 3rem; /* equivalent to Tailwind's w-12 */
  }
`
