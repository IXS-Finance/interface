import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Check } from 'react-feather'

import { ErrorText } from 'components/LaunchpadMisc/styled'
import { FormFieldWrapper, OptionalLabel } from '../styled'
import { text19, text30 } from 'components/LaunchpadMisc/typography'
import { ReactComponent as DropdownIcon } from '../../../../../assets/images/dropdownIcon.svg'

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
  value?: T[]
  error?: string
  field: string
  setter?: (field: string, value?: T[]) => void
  touch?: (field: string, touched: boolean) => void
  onChange?: (value?: T[]) => void
  wrapperStyle?: React.CSSProperties
  containerStyle?: React.CSSProperties
}

export function MultipleDropdownField<T>(props: Props<T>) {
  const { placeholder = 'Select…' } = props
  const disabled = props.disabled || props.options.length === 0
  const container = React.useRef<HTMLDivElement>(null)
  const theme = useTheme()

  // 1. Store an array of selected options
  const [selectedOptions, setSelectedOptions] = React.useState<Option<T>[]>(
    props.options.filter((opt) => props.value?.includes(opt.value))
  )
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [searchActive, setSearchActive] = React.useState(false)
  const [searchText, setSearchText] = React.useState<string>('')

  // 2. Filter options if searchable
  const filtered = React.useMemo(() => {
    if (!props.searchable || (!searchText && !searchActive)) return props.options
    const q = searchText.toLowerCase()
    return props.options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [props.options, props.searchable, searchText, searchActive])

  // 3. Toggle dropdown open/close
  const toggle = React.useCallback(() => {
    if (disabled) return
    setShowDropdown((v) => !v)
  }, [disabled])

  // 4. Select or deselect one option
  const toggleOption = React.useCallback(
    (opt: Option<T>) => {
      if (disabled) return
      const already = selectedOptions.find((o) => o.value === opt.value)
      let next: Option<T>[]
      if (already) {
        next = selectedOptions.filter((o) => o.value !== opt.value)
      } else {
        next = [...selectedOptions, opt]
      }
      setSelectedOptions(next)
      // emit only the values
      const nextValues = next.map((o) => o.value)
      props.setter?.(props.field, nextValues)
      props.onChange?.(nextValues)
      // mark touched
      props.touch && setTimeout(() => props.touch!(props.field, true))
    },
    [disabled, selectedOptions, props]
  )

  // 5. Update search input
  const onSearch = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setSearchActive(true)
    setShowDropdown(true)
  }, [])

  // 6. Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: Event) {
      if (!container.current?.contains(e.target as Node)) {
        setShowDropdown(false)
        setSearchText('')
        setSearchActive(false)
      }
    }
    if (showDropdown) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showDropdown])

  // 7. Sync if value prop changes externally
  React.useEffect(() => {
    const synced = props.options.filter((opt) => props.value?.includes(opt.value))
    setSelectedOptions(synced)
  }, [props.value, props.options])

  return (
    <FormFieldWrapper gap="0.5rem" span={props.span} style={props.wrapperStyle}>
      <FieldContainer ref={container} onClick={toggle} disabled={disabled} style={props.containerStyle}>
        <FieldLabel>
          {props.label}
          {props.optional && <OptionalLabel>Optional</OptionalLabel>}
        </FieldLabel>

        {/* Show pills of selected items, or placeholder */}
        <SelectionsArea>
          {/* render all the pills, if any */}
          {selectedOptions.map((opt) => (
            <Pill
              key={String(opt.value)}
              onClick={(e) => {
                e.stopPropagation()
                toggleOption(opt)
              }}
            >
              {opt.label}
              <Remove>×</Remove>
            </Pill>
          ))}

          {/* now decide what to render when nothing is selected */}
          {props.searchable ? (
            <SearchInput
              value={searchText}
              onChange={onSearch}
              placeholder={selectedOptions.length === 0 ? placeholder : ''}
            />
          ) : (
            selectedOptions.length === 0 && <Placeholder>{placeholder}</Placeholder>
          )}
        </SelectionsArea>

        <IconContainer isOpen={showDropdown}>
          <DropdownIcon />
        </IconContainer>

        {showDropdown && (
          <OptionsList>
            {props.emptyOption && (
              <OptionRow onClick={() => toggleOption(props.emptyOption!)}>
                {props.emptyOption.label}
                {selectedOptions.some((o) => o.value === props.emptyOption!.value) && <Check />}
              </OptionRow>
            )}
            {filtered.map((opt, i) => (
              <OptionRow key={i} onClick={() => toggleOption(opt)}>
                {opt.label}
                {selectedOptions.some((o) => o.value === opt.value) && <Check size="16px" color="green" />}
              </OptionRow>
            ))}
          </OptionsList>
        )}
      </FieldContainer>

      {props.error && <ErrorText>{props.error}</ErrorText>}
    </FormFieldWrapper>
  )
}

/** Styled components **/

const FieldContainer = styled.div<{ disabled?: boolean }>`
  min-height: 75px;
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 24px;
  grid-template-areas:
    'label icon'
    'body  icon';
  padding: 0.75rem;
  border: 1px solid ${(p) => p.theme.launchpad.colors.border.default};
  border-radius: 6px;
  background: ${(p) => (p.disabled ? p.theme.launchpad.colors.foreground : 'transparent')};
`

const FieldLabel = styled.div`
  grid-area: label;
  ${text19}
  color: ${(p) => p.theme.launchpad.colors.text.bodyAlt};
`

const SelectionsArea = styled.div`
  grid-area: body;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
`

const Placeholder = styled.div`
  ${text30}
  color: #8F8FB2;
`

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: ${(p) => p.theme.launchpad.colors.foreground};
  border-radius: 4px;
  ${text30}
  cursor: default;

  &:hover {
    opacity: 0.8;
  }
`

const Remove = styled.span`
  margin-left: 0.5em;
  cursor: pointer;
`

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  min-width: 4rem;
  ${text30}
  color: ${(p) => p.theme.launchpad.colors.text.title};
  background: none;

  &::placeholder {
    color: #8f8fb2;
  }
`

const IconContainer = styled.div<{ isOpen: boolean }>`
  grid-area: icon;
  display: flex;
  align-items: center;
  justify-content: center;

  > svg {
    transition: transform 0.2s;
    ${(p) => p.isOpen && 'transform: rotate(180deg);'}
  }
`

const OptionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  max-height: 240px;
  overflow-y: auto;
  background: ${(p) => p.theme.launchpad.colors.background};
  border: 1px solid ${(p) => p.theme.launchpad.colors.border.default};
  border-radius: 6px;
  z-index: 50;
`

const OptionRow = styled.div`
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  ${text30}
  cursor: pointer;

  &:hover {
    background: ${(p) => p.theme.launchpad.colors.foreground};
  }
`
