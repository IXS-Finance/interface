import { WlColors } from 'state/whitelabel/types'
import { FlattenSimpleInterpolation, ThemedCssFunction } from 'styled-components'

export type Color = string
export type Gradient = string
export interface Colors {
  // base
  white: Color
  black: Color

  // text
  text1: Color
  text2: Color
  text3: Color
  text4: Color
  text5: Color
  text6: Color
  text7: Color
  text8: Color
  text9: Color
  text10: Color
  text11: Color
  text12: Color
  text13: Color

  // backgrounds / greys
  bg0: Color
  bg1: Color
  bg2: Color
  bg3: Color
  bg4: Color
  bg5: Color
  bg6: Color
  bg7: Color
  bg8: Color
  bg9: Color
  bg10: Color
  bg11: Color
  bg12: Color
  bg13: Color
  bg14: Color
  bg15: Color
  bg16: Color
  bg17: Color
  bg18: Color
  bg19: Color
  bg20: Color
  bg21: Color
  bg22: Color
  bg23: Color
  bg24: Color
  bg25: Color
  bg26: Color
  bg27: Color
  bgG1: Gradient
  bgG2: Gradient
  bgG3: Gradient
  bgG4: Gradient
  bgG5: Gradient
  bgG6: Gradient
  bgG7: Gradient
  bgG8: Gradient
  bgG9: Gradient
  bgG10: Gradient
  bgG11: Gradient
  bgG12: Gradient
  bgG13: Gradient
  bgG14: Gradient
  bgG15: Gradient
  bgG16: Gradient
  bgG17: Gradient
  bgG18: Gradient
  bgG19: Gradient
  bgG20: Gradient
  bgG21: Gradient
  borderG1: Gradient
  borderG2: Gradient
  borderG3: Gradient
  modalBG: Color
  modalBG1: Color
  advancedBG: Color
  divider: Color

  //blues
  primary1: Color
  primary2: Color
  primary3: Color
  primary4: Color
  primary5: Color

  primaryText1: Color

  // pinks
  secondary1: Color
  secondary2: Color
  secondary3: Color

  // other
  red1: Color
  red2: Color
  red3: Color
  red4: Color
  red41: Color
  red45: Color
  red5: Color
  green1: Color
  green2: Color
  green3: Color
  green4: Color
  yellow1: Color
  yellow2: Color
  yellow3: Color
  yellow4: Color
  yellow5: Color
  orange: Color
  blue1: Color
  blue2: Color
  blue3: Color
  blue4: Color
  blue5: Color

  // orange
  orange1: Color
  orange2: Color
  orange25: Color

  error: Color
  success: Color
  warning: Color
  popUpInputBorder: Color
  config: WlColors
}

export interface Grids {
  sm: number
  md: number
  lg: number
}

export interface LaunchpadTheme {
  font: string

  content: {
    maxWidth: string
  }

  colors: {
    primary: string
    accent: string

    success: string
    error: string
    info: string
    warn: string
    disabled: string
    green: string
    newBackground: string
    background: string
    foreground: string

    border: {
      default: string
      success: string
      error: string
    }

    text: {
      title: string
      body: string
      bodyAlt: string
      caption: string
      success: string
      warning: string
      light: string
      hint: string
      error: string
      green: string
    }
  }
}

export interface LbpTheme {
  colors: {
    status: {
      background: {
        live: string,
        pending: string,
        paused: string,
      },
      border: {
        live: string,
        pending: string,
        paused: string,
      },
      color: {
        live: string,
        pending: string,
        paused: string,
      },
    },
  },
}

declare module 'styled-components' {
  export interface DefaultTheme extends Colors {
    grids: Grids

    // shadows
    shadow1: string

    // media queries
    mediaWidth: {
      upToExtremelySmall: ThemedCssFunction<DefaultTheme>
      upToExtraSmall: ThemedCssFunction<DefaultTheme>
      upToSmall: ThemedCssFunction<DefaultTheme>
      upToMedium: ThemedCssFunction<DefaultTheme>
      upToLarge: ThemedCssFunction<DefaultTheme>
    }

    // css snippets
    flexColumnNoWrap: FlattenSimpleInterpolation
    flexRowNoWrap: FlattenSimpleInterpolation

    launchpad: LaunchpadTheme
    lbp: LbpTheme
  }
}
