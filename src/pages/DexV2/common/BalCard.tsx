// BalCard.tsx
import React from 'react'
import styled, { css } from 'styled-components'

interface BalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  titleTag?: keyof JSX.IntrinsicElements
  square?: boolean
  noPad?: boolean
  noContentPad?: boolean
  noBorder?: boolean
  imgSrc?: string
  hFull?: boolean
  growContent?: boolean
  rightAlignHeader?: boolean
  exposeOverflow?: boolean
  overflowYScroll?: boolean
  shadow?: '' | 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  header?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
}

// Shadow mapping similar to Tailwind's shadow classes.
const shadowMapping: Record<string, string> = {
  '': 'none',
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
  '3xl': '0 35px 60px rgba(0, 0, 0, 0.3)',
  '4xl': '0 40px 70px rgba(0, 0, 0, 0.35)',
}

// Outer card wrapper.
const CardWrapper = styled.div<Pick<BalCardProps, 'square' | 'exposeOverflow' | 'hFull' | 'shadow' | 'noBorder'>>`
  display: flex;
  flex-direction: column;
  background: white;
  ${({ square }) => !square && 'border-radius: 0.5rem;'}
  ${({ exposeOverflow }) => !exposeOverflow && 'overflow: hidden;'}
  ${({ hFull }) => hFull && 'height: 100%;'}
  ${({ shadow = '' }) =>
    shadow !== '' &&
    shadow !== 'none' &&
    css`
      box-shadow: ${shadowMapping[shadow]};
    `}
  ${({ shadow }) => (!shadow || shadow === 'none') && 'box-shadow: none;'}
  ${({ noBorder }) => (noBorder ? '' : 'border: 1px solid #e5e7eb;')}
`

// Card container.
const CardContainer = styled.div<Pick<BalCardProps, 'overflowYScroll'>>`
  display: flex;
  flex-direction: column;
  ${({ overflowYScroll }) =>
    overflowYScroll &&
    css`
      overflow-y: scroll;
      max-height: 100vh;
    `}
`

// Feature image.
const Feature = styled.div`
  width: 100%;
  height: 10rem; /* h-40 (40 * 0.25rem = 10rem) */
  background-position: center;
  background-size: cover;
`

// Header section.
const Header = styled.div<Pick<BalCardProps, 'noPad'>>`
  display: flex;
  align-items: center;
  ${({ noPad }) => !noPad && 'padding: 1rem; padding-bottom: 0;'}
`

// Header content container.
const HeaderContent = styled.div<Pick<BalCardProps, 'rightAlignHeader'>>`
  flex: 1;
  display: flex;
  align-items: center;
  ${({ rightAlignHeader }) => rightAlignHeader && 'justify-content: flex-end;'}
`

// Content section.
const Content = styled.div<Pick<BalCardProps, 'noPad' | 'noContentPad' | 'growContent'>>`
  ${({ noPad, noContentPad }) => !noPad && !noContentPad && 'padding: 1rem;'}
  ${({ growContent }) => growContent && 'flex-grow: 1;'}
`

// Footer section.
const Footer = styled.div<Pick<BalCardProps, 'square' | 'noPad'>>`
  ${({ square }) => !square && 'border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem;'}
  ${({ noPad }) => !noPad && 'padding: 1rem; padding-top: 0;'}
`

const BalCard: React.FC<BalCardProps> = ({
  title = '',
  titleTag = 'h4',
  square = false,
  noPad = false,
  noContentPad = false,
  noBorder = false,
  imgSrc = '',
  hFull = false,
  growContent = false,
  rightAlignHeader = false,
  exposeOverflow = false,
  overflowYScroll = false,
  shadow = '',
  header,
  footer,
  children,
}) => {
  // Determine the feature image style.
  const featureStyle = imgSrc ? { backgroundImage: `url('${imgSrc}')` } : undefined

  // Header: if header prop exists, use it; else if title exists, render title element.
  const HeaderContentNode = header ? (
    <HeaderContent rightAlignHeader={rightAlignHeader}>{header}</HeaderContent>
  ) : title ? (
    React.createElement(titleTag, null, title)
  ) : null

  return (
    <CardWrapper square={square} exposeOverflow={exposeOverflow} hFull={hFull} shadow={shadow} noBorder={noBorder}>
      <CardContainer overflowYScroll={overflowYScroll}>
        {imgSrc && <Feature style={featureStyle} />}
        {(title || header) && <Header noPad={noPad}>{HeaderContentNode}</Header>}
        <Content noPad={noPad} noContentPad={noContentPad} growContent={growContent}>
          {children}
        </Content>
        {footer && (
          <Footer square={square} noPad={noPad}>
            {footer}
          </Footer>
        )}
      </CardContainer>
    </CardWrapper>
  )
}

export default BalCard
