import React from "react"
import { Box } from "@mui/material"
import { TYPE } from "theme"
import { ReactComponent as WarningIcon } from "assets/images/dex-v2/warning.svg"
import { Flex } from "rebass"
import { useTheme } from "styled-components"
import { LockedData } from "services/balancer/contracts/ve-sugar"
import { useHistory } from 'react-router-dom'
import { routes } from 'utils/routes'

interface LockIncreaseExplanationProps {
  lockDetail?: LockedData
}

const LockIncreaseExplanation: React.FC<LockIncreaseExplanationProps> = ({ lockDetail }) => {
  const theme = useTheme()
  const color = theme.yellow3

  const history = useHistory()

  const handleClickExtend = () => {
    if (!lockDetail?.id) return

    const searchParams = new URLSearchParams()
    searchParams.set('extend', 'true')
    const path = routes.dexV2LockDetail.replace(':id', lockDetail?.id)
    history.push(`${path}?${searchParams.toString()}`)
  }

  return (
    <Box>
      <Flex alignItems="center" style={{ gap: 4 }}>
        <WarningIcon color={color} />
        <TYPE.subHeader1 color={color}>
          Increase voting power
        </TYPE.subHeader1>
      </Flex>
      <TYPE.body3 color="text2">
        Depositing into the lock will increase your voting power. You can also <span style={{ color: theme.primary1, cursor: 'pointer' }} onClick={handleClickExtend}>extend the lock time</span>.
      </TYPE.body3>
    </Box>
  )
}

export default LockIncreaseExplanation
