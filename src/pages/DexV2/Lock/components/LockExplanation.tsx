import { Box } from "@mui/material"
import { TYPE } from "theme"
import { ReactComponent as WarningIcon } from 'assets/images/dex-v2/warning.svg'
import { Flex } from "rebass"
import { useTheme } from "styled-components"

const LockExplanation: React.FC = () => {
  const theme = useTheme()
  const color = theme.yellow3

  return (
    <Box>
      <Flex alignItems='center' style={{ gap: 4 }}>
        <WarningIcon color={color} />
        <TYPE.subHeader1 color={color}>
          Locking will give you veIXS
        </TYPE.subHeader1>
      </Flex>
      <TYPE.body3 color='text2'>
        Locking will give you an NFT, referred to as a veIXS. You can increase the Lock amount or extend the Lock time at any point after.
      </TYPE.body3>
    </Box>
  )
}

export default LockExplanation
