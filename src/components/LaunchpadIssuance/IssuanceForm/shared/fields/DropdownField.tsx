import React from 'react'
import styled, { useTheme } from 'styled-components'

import { ErrorText } from 'components/LaunchpadMisc/styled'
import { FormFieldWrapper, OptionalLabel } from '../styled'
import { text19, text30 } from 'components/LaunchpadMisc/typography'
import { ReactComponent as Check } from '../../../../../assets/images/dropdownIcon.svg'

interface Option<T> {
  value: T
  label: string
}

interface Props<T> {
  label: string
  placeholder?: string

  options: Option<T>[]

  searchable?: boolean
  disabled?: boolean
  optional?: boolean
  emptyOption?: { label: string; value: any }
  span?: number

  value?: T
  error?: string

  field: string
  setter?: (field: string, value?: T) => void
  touch?: (field: string, touched: boolean) => void
  onChange?: (value?: T) => void
  wrapperStyle?: React.CSSProperties
  containerStyle?: React.CSSProperties
  uncontrolled?: boolean
}

export function DropdownField<T>(props: Props<T>) {
  const { placeholder = 'Select' } = props
  const disabled = props.disabled || !props.options || props.options.length === 0
  const container = React.useRef<HTMLDivElement>(null)

  const [selectedValue, setSelectedValue] = React.useState<Option<T> | undefined>(
    props.options?.find((x) => x.value === props.value)
  )
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [searchActive, setSearchActive] = React.useState(false)

  const [optionSearch, setOptionSearch] = React.useState<string>(
    props.options?.find((x) => x.value === props.value)?.label || ''
  )

  const options = React.useMemo(() => {
    if (!props.searchable) {
      return props.options
    }

    if (!optionSearch || !searchActive) {
      return props.options
    }

    const query = optionSearch.toLowerCase()

    return props.options.filter((x) => x.label.toLowerCase().startsWith(query))
  }, [props.options, optionSearch, searchActive])

  const toggle = React.useCallback(() => {
    if (disabled) {
      return
    }

    setShowDropdown((state) => !state)
  }, [disabled])

  const select = React.useCallback(
    (option: Option<T>) => {
      if (disabled) {
        return
      }
      setSelectedValue(option)
      setOptionSearch(option.label)
      setSearchActive(false)

      if (props.field && props.setter) {
        props.setter(props.field, option.value)
      }
      if (props.onChange) {
        props.onChange(option.value)
      }
      if (props.touch) {
        setTimeout(() => {
          if (props.touch) props.touch(props.field, true)
        })
      }
    },
    [disabled, props.onChange, props.setter]
  )

  const updateSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setOptionSearch(event.target.value)
      setSearchActive(true)
      setShowDropdown(true)

      setSelectedValue(undefined)

      if (props.field && props.setter) {
        props.setter(props.field, undefined)
      }

      if (props.onChange) {
        props.onChange(undefined)
      }
    },
    [props.setter, props.onChange]
  )

  React.useEffect(() => {
    function handleClickOutside(event: Event) {
      const targetNode = event.target as Node | null
      const isCorrectOption = options.find((opt) => opt.label === targetNode?.textContent)
      if (
        !container.current?.contains(targetNode) &&
        (!targetNode || targetNode.nodeValue) !== '' &&
        !isCorrectOption
      ) {
        setShowDropdown(false)
        setOptionSearch('')
      }
    }

    if (showDropdown) {
      document?.addEventListener('click', handleClickOutside)

      return () => {
        document?.removeEventListener('click', handleClickOutside)
      }
    }
  }, [showDropdown, container])
  React.useEffect(() => {
    if (!props.uncontrolled && selectedValue?.value !== props.value) {
      // handle case for select done outside the component
      const newSelectedValue = options.find((opt) => opt.value === props.value)
      if (newSelectedValue) {
        setSelectedValue(newSelectedValue)
        setOptionSearch(newSelectedValue.label)
      } else {
        setSelectedValue(undefined)
        setOptionSearch('')
      }
    }
  }, [props.value, selectedValue, options])

  return (
    <FormFieldWrapper gap="0.5rem" span={props.span} style={props.wrapperStyle}>
      <FieldContainer ref={container} onClick={toggle} disabled={disabled} style={props.containerStyle}>
        <FieldLabel>
          {props.label}
          {props.optional && <OptionalLabel>Optional</OptionalLabel>}
        </FieldLabel>

        {!props.searchable && !selectedValue && <FieldPlaceholder>{placeholder}</FieldPlaceholder>}

        {!props.searchable && selectedValue && (
          <FieldSelectedValue>{selectedValue?.label ?? 'Select'}</FieldSelectedValue>
        )}

        {props.searchable && (
          <OptionSearch
            placeholder={placeholder}
            value={optionSearch}
            onChange={updateSearch}
            isActive={!searchActive}
          />
        )}
        {showDropdown && (
          <FieldOptionList>
            {props.emptyOption && (
              <FieldOption key={props.emptyOption.value} onClick={() => select(props.emptyOption!)}>
                {props.emptyOption.label}
              </FieldOption>
            )}
            {options.map((option, idx) => (
              <FieldOption key={idx} onClick={() => select(option)}>
                {option.label}
              </FieldOption>
            ))}
          </FieldOptionList>
        )}

        <FieldIcon isOpen={showDropdown}>
          <Check />
        </FieldIcon>
      </FieldContainer>

      {props.error && <ErrorText>{props.error}</ErrorText>}
    </FormFieldWrapper>
  )
}

const FieldContainer = styled.div<{ disabled?: boolean }>`
  position: relative;
  display: grid;
  grid-template-rows: repeat(2, auto);
  grid-template-columns: 1fr 10px;
  grid-template-areas:
    'label icon'
    'value icon';

  place-content: start center;
  gap: 0.25rem;
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 6px;

  ${(props) =>
    props.disabled &&
    `
    background: ${props.theme.launchpad.colors.foreground};
  `}
`

const FieldIcon = styled.div<{ isOpen: boolean }>`
  grid-area: icon;

  display: grid;
  place-content: center;

  > svg {
    transition: transofrm 0.4s;
    ${(props) => props.isOpen && 'transform: rotate(180deg);'};
  }
`

const OptionSearch = styled.input<{ isActive?: boolean }>`
  border: none;
  background: none;
  outline: none;

  ${text30}

  color: ${(props) =>
    props.isActive ? props.theme.launchpad.colors.text.title : props.theme.launchpad.colors.text.bodyAlt};
  ::placeholder {
    color: ${(props) => props.theme.launchpad.colors.text.bodyAlt};
  }
`

const FieldLabel = styled.div`
  grid-area: label;
  ${text19}
  color: ${(props) => props.theme.launchpad.colors.text.bodyAlt};
`

const FieldPlaceholder = styled.div`
  grid-area: value;
  ${text30}

  color: ${(props) => props.theme.launchpad.colors.text.bodyAlt};
`

const FieldSelectedValue = styled.div`
  grid-area: value;

  ${text30}

  color: ${(props) => props.theme.launchpad.colors.text.title};
`

const FieldOptionList = styled.div`
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  right: 0;
  transform: translate(0, 100%);
  z-index: 30;
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 6px;
`

const FieldOption = styled.div`
  padding: 0.5rem 1rem;

  ${text30}

  cursor: pointer;
  background: ${(props) => props.theme.launchpad.colors.background};
  color: ${(props) => props.theme.launchpad.colors.text.title};

  :hover {
    background: ${(props) => props.theme.launchpad.colors.foreground};
  }
`
