import { useState, useEffect } from 'react'
import { RuleFunction } from '.'

interface Props {
  rules: RuleFunction[]
  validateOn: string
  modelValue: string | number
  onUpdateIsValid?: (isValid: boolean) => void
}

export default function useInputValidation(props: Props) {
  // STATE
  const [errors, setErrors] = useState<string[]>([])

  // Derived state: isInvalid computed directly (without useMemo)
  const isInvalid = errors.length > 0

  // METHODS
  function validate(val: string | number): void {
    const newErrors: string[] = []
    props.rules.forEach((rule: RuleFunction) => {
      const result = rule(val)
      if (typeof result === 'string') {
        newErrors.push(result)
      }
    })
    setErrors(newErrors)
  }

  // Replicate watchEffect: run validate when validateOn is "input"
  useEffect(() => {
    if (props.validateOn === 'input') {
      validate(props.modelValue)
    }
  }, [props.modelValue, JSON.stringify(props.rules)])

  // Replicate watcher on isInvalid:
  // Call the update callback when isInvalid changes.
  useEffect(() => {
    if (props.onUpdateIsValid) {
      props.onUpdateIsValid(!isInvalid)
    }
  }, [isInvalid])

  return { errors, isInvalid, validate }
}
