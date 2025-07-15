import React from "react"
import { Box } from "@mui/material"
import { TYPE } from "theme"
import { ReactComponent as WarningIcon } from "assets/images/dex-v2/warning.svg"
import { Flex } from "rebass"
import { useTheme } from "styled-components"

interface LockExtendExplanationProps {}

const LockExtendExplanation: React.FC<LockExtendExplanationProps> = () => {
  const theme = useTheme()
  const color = theme.yellow3

  return (
    <Box>
      <Flex alignItems="center" style={{ gap: 4 }}>
        <WarningIcon color={color} />
        <TYPE.subHeader1 color={color}>
          Maximum lock time is 4 years
        </TYPE.subHeader1>
      </Flex>
      <TYPE.body3 color="text2">
      You can extend the lock or increase the lock amount. These actions will increase your voting power. The maximum lock time is 4 years.
      </TYPE.body3>
    </Box>
  )
}

export default LockExtendExplanation
