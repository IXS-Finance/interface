import styled from 'styled-components'

export const BaseButton = styled.button<{ grow?: number; height?: string; width?: string; padding?: string }>`
  display: flex;
  flex-flow: row nowrap;

  justify-content: center;
  align-items: center;

  gap: 0.5rem;

  padding: ${(props) => props.padding ?? '0 2rem'};
  height: ${(props) => props.height ?? '48px'};

  cursor: pointer;

  border-radius: 6px;

  border: none;
  background: none;

  ${(props) => props.grow && `flex-grow: ${props.grow};`}
  ${(props) => props.width && `width: ${props.width};`}
`

export const FilledButton = styled(BaseButton)<{ background?: string; color?: string }>`
  color: ${(props) => props.color ?? props.theme.launchpad.colors.background};
  background: ${(props) => props.background ?? props.theme.launchpad.colors.primary};
  cursor: pointer;
  ${(props) =>
    props.disabled &&
    `
    background: ${props.theme.launchpad.colors.disabled};
    cursor: not-allowed;
  `}
`

export const OutlineButton = styled(BaseButton)<{
  borderColor?: string
  color?: string
  background?: string
  borderType?: string
}>`
  color: ${(props) => props.color ?? props.theme.launchpad.colors.primary};
  border: 1px solid #6666ff33;
  cursor: pointer;
  font-family: ${(props) => props.theme.launchpad.font};
  ${(props) => props.background && `background: ${props.background}`};
  ${(props) => props.borderType && `padding: 0 0.75rem;`}
  ${(props) =>
    props.disabled &&
    `
    cursor: not-allowed;
    opacity: 0.5;
  `}
`
