import React from 'react'
import styled, { css } from 'styled-components'

//
// Helper: returns a box-shadow value based on the shadow prop.
// These values are approximate Tailwind shadows.
//
const getBoxShadow = (shadow?: string) => {
  switch (shadow) {
    case 'none':
      return 'none'
    case 'sm':
      return '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    case 'md':
      return '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
    case 'lg':
      return '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
    case 'xl':
      return '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
    case '2xl':
      return '0 25px 50px -12px rgba(0,0,0,0.25)'
    case '3xl':
      return '0 35px 60px -15px rgba(0,0,0,0.3)'
    case '4xl':
      return '0 40px 80px -20px rgba(0,0,0,0.3)'
    default:
      // default shadow (when shadow is an empty string or not provided)
      return '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)'
  }
}

//
// Styled components
//

interface CardProps {
  square?: boolean
  exposeOverflow?: boolean
  noBorder?: boolean
  hFull?: boolean
  shadow?: string
  darkBgColor?: string
}

const Card = styled.div<CardProps>`
  display: flex;
  flex-direction: column;
  background-color: white;
  /* In a real app you might integrate a theme or media query for dark mode.
     Here we simply always use white as the base. */
  ${(props) =>
    !props.square &&
    css`
      border-radius: 0.5rem;
    `}
  ${(props) =>
    !props.exposeOverflow &&
    css`
      overflow: hidden;
    `}
  ${(props) =>
    !props.noBorder &&
    css`
      border: 1px solid #e5e7eb;
    `}
  ${(props) =>
    props.hFull &&
    css`
      height: 100%;
    `}
  box-shadow: ${(props) => getBoxShadow(props.shadow)};
`

interface CardContainerProps {
  overflowYScroll?: boolean
}

const CardContainer = styled.div<CardContainerProps>`
  display: flex;
  flex-direction: column;
  ${(props) =>
    props.overflowYScroll &&
    css`
      overflow-y: scroll;
      max-height: 100vh;
    `}
  /* Hide scrollbar for WebKit browsers */
  &::-webkit-scrollbar {
    width: 0;
  }
`

interface FeatureProps {
  imgSrc: string
}

const Feature = styled.div<FeatureProps>`
  width: 100%;
  height: 10rem; /* Tailwind's h-40 is 10rem */
  background-position: center;
  background-size: cover;
  background-image: url(${(props) => props.imgSrc});
`

interface HeaderProps {
  noPad?: boolean
}

const Header = styled.div<HeaderProps>`
  display: flex;
  align-items: center;
  ${(props) =>
    !props.noPad &&
    css`
      padding: 1rem;
      padding-bottom: 0;
    `}
`

interface HeaderContentProps {
  rightAlignHeader?: boolean
}

const HeaderContent = styled.div<HeaderContentProps>`
  flex: 1;
  display: flex;
  align-items: center;
  ${(props) =>
    props.rightAlignHeader &&
    css`
      justify-content: flex-end;
    `}
`

interface ContentProps {
  noPad?: boolean
  noContentPad?: boolean
  growContent?: boolean
}

const Content = styled.div<ContentProps>`
  ${(props) =>
    !props.noPad &&
    !props.noContentPad &&
    css`
      padding: 1rem;
    `}
  ${(props) =>
    props.growContent &&
    css`
      flex-grow: 1;
    `}
`

interface FooterProps {
  square?: boolean
  noPad?: boolean
}

const Footer = styled.div<FooterProps>`
  display: flex;
  align-items: center;
  ${(props) =>
    !props.square &&
    css`
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    `}
  ${(props) =>
    !props.noPad &&
    css`
      padding: 1rem;
      padding-top: 0;
    `}
`

//
// BalCard component props
//
export interface BalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  /** HTML tag to use for the title, e.g. "h4" (default) */
  titleTag?: keyof JSX.IntrinsicElements
  square?: boolean
  noPad?: boolean
  noContentPad?: boolean
  noBorder?: boolean
  /** This prop is used for dark mode. In Tailwind it would be "dark:bg-gray-{value}" */
  darkBgColor?: string
  imgSrc?: string
  hFull?: boolean
  growContent?: boolean
  rightAlignHeader?: boolean
  exposeOverflow?: boolean
  overflowYScroll?: boolean
  /** Acceptable values: '', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl' */
  shadow?: '' | 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  /** Optional content to be rendered in the header (in addition to the title) */
  header?: React.ReactNode
  /** Optional content to be rendered in the footer */
  footer?: React.ReactNode
  children?: React.ReactNode
}

const BalCard: React.FC<BalCardProps> = ({
  title = '',
  titleTag = 'h4',
  square = false,
  noPad = false,
  noContentPad = false,
  noBorder = false,
  darkBgColor = '850',
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
  ...rest
}) => {
  // Dynamically determine the element to render for the title
  const TitleElement = titleTag as keyof JSX.IntrinsicElements

  return (
    <Card
      square={square}
      exposeOverflow={exposeOverflow}
      noBorder={noBorder}
      hFull={hFull}
      shadow={shadow}
      darkBgColor={darkBgColor}
      {...rest}
    >
      <CardContainer overflowYScroll={overflowYScroll}>
        {imgSrc && <Feature imgSrc={imgSrc} />}
        {(title || header) && (
          <Header noPad={noPad}>
            {title && <TitleElement>{title}</TitleElement>}
            {header && <HeaderContent rightAlignHeader={rightAlignHeader}>{header}</HeaderContent>}
          </Header>
        )}
        <Content noPad={noPad} noContentPad={noContentPad} growContent={growContent}>
          {children}
        </Content>
        {footer && (
          <Footer square={square} noPad={noPad}>
            {footer}
          </Footer>
        )}
      </CardContainer>
    </Card>
  )
}

export default BalCard
