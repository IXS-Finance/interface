import React from 'react';
import styled from 'styled-components';

export interface BalToggleProps {
  name: string;
  modelValue?: boolean;
  label?: string;
  disabled?: boolean;
  color?: string; // currently only "green" is allowed
  onChange?: (checked: boolean) => void;
  onToggle?: (checked: boolean) => void;
}

const Container = styled.div`
  position: relative;
  display: inline-block;
  width: 2.5rem; /* w-10 = 2.5rem */
  vertical-align: middle;
  user-select: none;
  transition: all 200ms ease-out;

  /* When the checkbox is checked, target the adjacent label */
  input:checked + label {
    background-color: #10b981; /* bg-green-400 */
  }
`;

const ToggleCheckbox = styled.input.attrs({ type: 'checkbox' })<{ name: string }>`
  position: absolute;
  display: block;
  width: 1.5rem; /* w-6 */
  height: 1.5rem; /* h-6 */
  border-radius: 9999px;
  background-color: white;
  border: 4px solid #e5e7eb; /* border-gray-200 */
  cursor: pointer;
  appearance: none;
  transition: all 200ms ease-out;
  left: 0;

  &:hover {
    border-color: #d1d5db; /* group-hover:border-gray-300 */
  }

  &:checked {
    left: auto;
    right: 0;
    border-color: #10b981; /* border-green-400 */
  }

  &:checked:hover {
    border-color: #3b82f6; /* group-hover:border-green-500 */
  }

  &:disabled {
    border-color: #d1d5db;
    cursor: not-allowed;
  }

  /* Special styling for "swapGasless" */
  ${(props) =>
    props.name === 'swapGasless' &&
    `
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    &::before {
      content: '⛽';
    }
    &:checked::before {
      content: '✍️';
    }
  `}
`;

const ToggleTrack = styled.label`
  display: block;
  overflow: hidden;
  height: 1.5rem; /* h-6 */
  border-radius: 9999px;
  background-color: #e5e7eb; /* bg-gray-200 */
  cursor: pointer;
  transition: background-color 200ms ease-out;
`;

const ToggleLabel = styled.label`
  margin-left: 0.5rem; /* ml-2 */
  font-size: 0.75rem; /* text-xs */
  color: #4b5563;     /* text-gray-600 */
`;

const BalToggle: React.FC<BalToggleProps> = ({
  name,
  modelValue = false,
  label = '',
  disabled = false,
  color = 'green',
  onChange,
  onToggle,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      const checked = e.target.checked;
      onChange && onChange(checked);
      onToggle && onToggle(checked);
    }
  };

  return (
    <>
      <Container {...rest}>
        <ToggleCheckbox
          name={name}
          checked={modelValue}
          disabled={disabled}
          onChange={handleChange}
        />
        <ToggleTrack htmlFor={name} />
      </Container>
      {label && <ToggleLabel htmlFor={name}>{label}</ToggleLabel>}
    </>
  );
};

export default BalToggle;
