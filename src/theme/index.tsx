import React, { useMemo } from 'react'
import { Text, TextProps as TextPropsOriginal } from 'rebass'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import { Whitelabel, WlColors } from 'state/whitelabel/types'
import styled, {
  createGlobalStyle,
  css,
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components'
import { useIsDarkMode } from '../state/user/hooks'
import { Colors } from './styled'
import { background } from 'styled-system'

export * from './components'

type TextProps = Omit<TextPropsOriginal, 'css'>

export const MEDIA_WIDTHS = {
  upToExtremelySmall: 370,
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const white = '#FFFFFF'
const black = '#000000'

export function colors(configColors?: WlColors): Colors {
  const wlColors = configColors || ({} as WlColors)

  return {
    config: wlColors,
    // base
    white,
    black,

    // text
    text1: wlColors.text?.main || white,
    text2: wlColors.text?.additional1 || '#666680',
    text3: wlColors.text?.main || '#6C7284',
    text4: wlColors.text?.main || '#6666FF33',
    text5: wlColors.text?.main || white,
    text6: wlColors.text?.main || '#8F8FB2',
    text7: wlColors.text?.main || '#9184C4',
    text8: wlColors.text?.main || '#9184C3',
    text9: wlColors.text?.main || '#6b6b6b',
    text10: wlColors.text?.main || '#EDCEFF0D',
    text11: wlColors.text?.main || 'rgba(255, 255, 255, 0.5)',
    text12: wlColors.text?.main || '#292933',
    text13: wlColors.text?.main || '#666680',

    // rgba(237, 206, 255, 0.05)
    // backgrounds / greys
    bg0: wlColors.background?.main || '#1B1C21',
    bg1: wlColors.background?.secondary || '#16171C',
    bg2: '#F6F6FB',
    bg3: '#6666ff33',
    bg4: '#565A69',
    bg5: '#6C7284',
    bg6: '#1A2028',
    bg7: wlColors.background?.main || '#F7F7FA',
    bg8: wlColors.background?.secondary || '#0F0518',
    bg9: wlColors.background?.main || '#372E5D',
    bg10: '#EDCEFF',
    bg11: wlColors.background?.secondary || '#272046',
    bg12: wlColors.background?.secondary || '#271F4A',
    bg13: wlColors.background?.secondary || '#2F254E',
    bg14: '#FF6161',
    bg15: '#2C254A',
    bg16: wlColors.background?.secondary || '#170626',
    bg17: '#1C112D',
    bg18: wlColors.background?.main || '#27204666',
    bg19: wlColors.background?.secondary || '#271F4A66',
    bg20: wlColors.background?.secondary || '#7B42A9',
    bg21: wlColors.background?.secondary || '#FFFFFF',
    bg22: wlColors.background?.secondary || '#2C254A80',
    bg23: '#F7F7FA',
    bg24: '#E6E6FF',
    bg25: '#FFFFFF',
    bg26: '#6666FF',
    bg27: '#e8e8ff',
    bgG1:
      wlColors.background?.main ||
      'radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.33) 0%, rgba(26, 18, 58, 0) 100%), #2C254A;',
    bgG2:
      wlColors.background?.main ||
      'radial-gradient(93.65% 93.65% at 58.57% 22.42%,rgba(206,20,132,0.1) 0%,rgba(26,18,58,0.4) 100%),rgb(44,37,74,0.6);',
    bgG3: wlColors.background?.secondary || 'linear-gradient(116.36deg, #7B42A9 33.43%, #ED0376 95.41%), #0C469C;',
    bgG4:
      wlColors.background?.main ||
      'radial-gradient(53.24% 225.7% at 49.91% 82.11%, rgba(123, 66, 169, 0.04) 0%, rgba(237, 3, 118, 0.02) 100%), #0F0518;',
    bgG5:
      wlColors.background?.secondary ||
      'radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.099) 0%, rgba(26, 18, 58, 0) 100%), rgba(44, 37, 74, 0.2);',
    bgG6: '#6666FF',
    bgG7: wlColors.background?.main || 'linear-gradient(0deg, #272046, #272046), #170E20;',
    bgG8: wlColors.background?.main || 'linear-gradient(0deg, #1A123A, #1A123A), #170E20;',
    bgG9: wlColors.background?.main || 'linear-gradient(0deg, #14051B 0%, rgba(20, 5, 27, 0) 82.89%);',
    bgG10:
      wlColors.background?.main ||
      'radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.231) 0%, rgba(26, 18, 58, 0) 100%), rgba(44, 37, 74, 0.1);',
    bgG11:
      wlColors.background?.main ||
      'radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.099) 0%, rgba(26, 18, 58, 0) 100%), rgba(44, 37, 74, 0.5);',
    bgG12:
      wlColors.background?.main ||
      'radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.099) 0%, rgba(26, 18, 58, 0) 100%), rgba(44, 37, 74, 0.3)',
    bgG13:
      wlColors.background?.main ||
      'radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.099) 0%, rgba(26, 18, 58, 0) 100%), rgba(44, 37, 74, 0.3);',
    bgG14:
      wlColors.background?.main ||
      'radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.033) 0%, rgba(26, 18, 58, 0) 100%), rgba(44, 37, 74, 0.5);',
    bgG15:
      wlColors.background?.main ||
      'radial-gradient(76.91% 60% at 2.38% 3.84%, rgba(123, 66, 169, 0.195) 0%, rgba(26, 18, 58, 0) 100%), radial-gradient(79.76% 116.06% at 44.22% 136.36%, rgba(102, 20, 206, 0.132) 0%, rgba(26, 18, 58, 0) 100%), radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.132) 0%, rgba(26, 18, 58, 0) 100%), rgba(44, 37, 74, 0.3)',
    bgG16:
      wlColors.background?.main ||
      'linear-gradient(0deg, rgba(13, 4, 21, 0.7), rgba(13, 4, 21, 0.7)), radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.099) 0%, rgba(26, 18, 58, 0) 100%), rgba(44, 37, 74, 0.2);',
    bgG17:
      wlColors.background?.secondary ||
      'radial-gradient(53.24% 225.7% at 49.91% 82.11%, rgba(123, 66, 169, 0.028) 0%, rgba(237, 3, 118, 0.014) 100%), rgba(15, 5, 24, 0.7);',
    bgG18:
      wlColors.background?.main ||
      'radial-gradient(83.59% 55.66% at 2.38% 3.84%, rgba(123, 66, 169, 0.39) 0%, rgba(26, 18, 58, 0) 100%), radial-gradient(50.28% 108.33% at 73.7% 9%, rgba(102, 20, 206, 0.165) 1.94%, rgba(26, 18, 58, 0) 100%), radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.33) 0%, rgba(26, 18, 58, 0) 100%), rgba(44, 37, 74, 0.3);',

    bgG19:
      wlColors.background?.secondary ||
      'radial-gradient(39.01% 78.49% at 10.99% 63.28%, rgba(138, 54, 152, 0.18) 18.75%, rgba(0, 0, 0, 0) 100%),radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(154, 55, 114, 0.33) 0%, rgba(26, 18, 58, 0) 100%) #29113d',
    //specialty colors

    bgG20:
      wlColors.background?.main ||
      'radial-gradient(93.65% 93.65% at 58.57% 22.42%, rgba(206, 20, 132, 0.33) 0%, rgba(26, 18, 58, 0) 100%), #2C254A80;',
    bgG21: wlColors.background?.main || 'radial-gradient(24.62% 985% at 50% 50%, #9191FE 0%, #6666FF 100%);',
    borderG1: wlColors.background?.main || 'linear-gradient(116.36deg, #7b42a9 33.43%, #ed0376 95.41%);',
    borderG2:
      wlColors.text?.main ||
      'linear-gradient(116.36deg, rgb(123, 66, 169) 33.43%, rgb(237, 3, 118) 95.41%), rgb(12, 70, 156);',
    borderG3:
      wlColors.background?.main ||
      'linear-gradient(90deg, rgba(237, 206, 255, 0) 0%, #edceff 4.92%, #edceff 94.53%, rgba(237, 206, 255, 0) 98.88%);',

    modalBG: 'rgba(0,0,0,0.9)',
    modalBG1: 'rgba(233,233,245,0.8)',
    advancedBG: wlColors.background?.main || 'rgba(0,0,0,0.1)',
    divider: wlColors.background?.main || 'rgba(43, 43, 43, 0.435)',

    //primary colors
    primary1: wlColors.primary?.main || '#6666FF',
    primary2: wlColors.primary?.additional1 || '#3680E7',
    primary3: wlColors.primary?.additional2 || '#4D8FEA',
    primary4: wlColors.primary?.additional3 || '#376bad70',
    primary5: '#153d6f70',

    // color text
    primaryText1: '#6da8ff',

    // secondary colors
    secondary1: '#2172E5',
    secondary2: '#17000b26',
    secondary3: '#17000b26',

    // other
    red1: '#FD4040',
    red2: '#F82D3A',
    red3: '#D60000',
    red4: '#FF9999',
    red41: 'rgba(255, 153, 153, 0.1)',
    red45: 'rgba(255, 153, 153, 0.5)',
    green1: wlColors.status?.success || '#0ECC88',
    green2: '#9DF9B1B2',
    green3: '#9DF9B1B3',
    green4: '#24E49F',
    yellow1: '#e3a507',
    yellow2: '#ff8f00',
    yellow3: '#F3B71E',
    yellow4: wlColors.status?.warning || '#D1BF1E',
    yellow5: '#FFD056',
    orange: '#FF6D41',
    blue1: '#2172E5',
    blue2: '#5199FF',
    blue3: '#5B7BCF',
    blue4: '#48A1F3',

    orange1: '#FF6D41',
    orange2: '#FFAD31',
    orange25: 'rgba(255, 173, 49, 0.1)',

    error: wlColors.status?.error || '#FF9999',
    success: wlColors.status?.success || '#27AE60',
    warning: wlColors.status?.warning || '#ff8f00',
    popUpInputBorder: '#7A02E0',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
  }
}

export function theme(darkMode: boolean, config: Whitelabel | null): DefaultTheme {
  return {
    ...colors(config?.colors),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,

    launchpad: launchpadTheme(config?.colors),
    lbp: lbpTheme(),
  }
}

export function lbpTheme() {
  return {
    colors: {
      status: {
        background: {
          live: 'rgba(31, 186, 102, 0.05)',
          pending: 'rgba(102, 102, 255, 0.05)',
          paused: 'rgba(255, 168, 0, 0.05)',
        },
        border: {
          live: '1px solid rgba(31, 186, 102, 0.2)',
          pending: '1px solid rgba(102, 102, 255, 0.2)',
          paused: '1px solid rgba(255, 168, 0, 0.2)',
        },
        color: {
          live: 'rgba(31, 186, 102, 1)',
          pending: 'rgba(102, 102, 255, 1)',
          paused: 'rgba(255, 168, 0, 1)',
        },
      },
    },
  }
}

export function launchpadTheme(colors?: WlColors) {
  return {
    font: 'Inter',

    content: {
      maxWidth: '1180px',
    },

    colors: {
      primary: colors?.button?.primary ?? '#6666FF',
      accent: '#E6E6FF',

      success: '#1DC78A',
      error: '#FF8282',
      info: '#FFC93F',
      warn: '#FFC632',
      disabled: '#DCDCF0',

      background: '#FFFFFF',
      foreground: '#F7F7FF',
      newBackground: '#F8F8F8',
      green: 'rgba(25, 37, 33, 0.5)',

      border: {
        default: '#E6E6FF',
        success: '#0EC080',
        error: '#FF8282',
      },

      text: {
        title: '#292933',
        body: '#666680',
        bodyAlt: '#8F8FB2',
        caption: '#B8B8CC',
        success: '#0EC080',
        warning: '#FF8282',
        light: '#FFFFFF',
        hint: '#8d8da3',
        error: '#ff6060',
        green: '#09CD87',
      },
    },
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  const { config } = useWhitelabelState()

  const themeObject = useMemo(() => theme(darkMode, config), [darkMode, config])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  main0(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={52} lineHeight={'56px'} color={'text1'} {...props} />
  },
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text2'} {...props} />
  },
  main1(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={13} lineHeight={'30px'} color={'text1'} {...props} />
  },
  main2(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={13} lineHeight={'15px'} color={'text11'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  label(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={20} color={'text1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  body1(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text2'} lineHeight={'24px'} {...props} />
  },
  body2(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={17} color={'text1'} lineHeight={'24px'} {...props} />
  },
  body3(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} lineHeight={'21px'} color={'text2'} {...props} />
  },
  body4(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={18} lineHeight={'34px'} color={'text1'} {...props} />
  },
  body5(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={20} lineHeight={'33px'} color={'text2'} {...props} />
  },
  body6(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={17} color={'text1'} lineHeight={'40px'} {...props} />
  },
  popOver(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} color={'text2'} lineHeight={'17px'} {...props} />
  },
  status(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} color={'text2'} lineHeight={'32px'} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  subHeader1(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={14} lineHeight={'21px'} {...props} />
  },
  buttonMuted(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={13} color={'#555566'} lineHeight={'16px'} {...props} />
  },
  titleBig(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={36} lineHeight={'56px'} {...props} />
  },
  titleSmall(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={18} lineHeight={'27px'} color={'text1'} {...props} />
  },
  title3(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={28} lineHeight={'56px'} color={'text1'} {...props} />
  },
  title4(props: TextProps) {
    return <TextWrapper fontWeight={800} fontSize={40} lineHeight={'56px'} color={'text1'} {...props} />
  },
  title5(props: TextProps) {
    return <TextWrapper fontWeight={700} fontSize={20} lineHeight={'33px'} color={'text1'} {...props} />
  },
  title6(props: TextProps) {
    return <TextWrapper fontWeight={800} fontSize={32} lineHeight={'38px'} color={'text1'} {...props} />
  },
  title7(props: TextProps) {
    return <TextWrapper fontWeight={700} fontSize={18} lineHeight={'40px'} color={'text1'} {...props} />
  },
  title8(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={28} lineHeight={'42px'} color={'text2'} {...props} />
  },
  title9(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={18} lineHeight={'40px'} color={'text1'} {...props} />
  },
  title10(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} lineHeight={'18px'} color={'text1'} {...props} />
  },
  title11(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={13} lineHeight={'16px'} color={'text5'} {...props} />
  },
  descriptionThin(props: TextProps) {
    return <TextWrapper fontWeight={300} fontSize={16} lineHeight={'24px'} color={'text2'} {...props} />
  },
  description2(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={13} lineHeight={'18px'} color={'#86869D'} {...props} />
  },
  description3(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={13} lineHeight={'21px'} color={'text2'} {...props} />
  },
  description4(props: TextProps) {
    return <TextWrapper fontWeight={300} fontSize={18} lineHeight={'29px'} color={'text2'} {...props} />
  },
  description5(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={22} lineHeight={'33px'} color={'text2'} {...props} />
  },
  description6(props: TextProps) {
    return <TextWrapper fontWeight={300} fontSize={28} lineHeight={'56px'} color={'text1'} {...props} />
  },
  description7(props: TextProps) {
    return <TextWrapper fontWeight={700} fontSize={24} lineHeight={'45px'} color={'text2'} {...props} />
  },
  description8(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={13} lineHeight={'30px'} color={'text2'} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={13} color={'text11'} {...props} />
  },
  smallError(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={10} lineHeight={'15px'} color={'error'} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow3'} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'error' : 'text2'} {...props} />
  },
}

export const ThemedGlobalStyle = createGlobalStyle`
  html {
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg0} !important;
  }

  a {
    color: ${({ theme }) => theme.blue1};
  }

  ${({ theme }) =>
    theme.config.elements &&
    css`
      path {
        fill: ${theme.config.elements.main};
      }
      line {
        stroke: ${theme.config.elements.main};
      }
    `};


  /* svg{
    ${({ theme }) =>
      theme.config.elements &&
      css`
        stroke: ${({ theme }) => theme.config.elements.main};
      `};
  } */
`
