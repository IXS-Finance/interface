import React from "react"
import { Box, Switch } from "@mui/material"
import { ReactComponent as SyncIcon } from 'assets/images/sync.svg'
import { TYPE } from "theme"
import { Flex } from "rebass"
import styled from "styled-components"

interface LockExtendAutoMaxLockModeProps {
  openMaxLockMode: boolean
  setOpenMaxLockMode: (openMaxLockMode: boolean) => void
}

const LockExtendAutoMaxLockMode: React.FC<LockExtendAutoMaxLockModeProps> = ({ openMaxLockMode, setOpenMaxLockMode }) => {

  return (
    <Box>
      <Flex alignItems="center" justifyContent="space-between" marginBottom="6px" style={{ gap: 4 }}>
        <Flex alignItems="center" style={{ gap: 4 }}>
          <SyncIcon />
          <TYPE.subHeader1 color="#292933E5">
            Auto Max-Lock Mode
          </TYPE.subHeader1>
        </Flex>
        <SwitchCustom
          name="maxLockMode"
          checked={openMaxLockMode}
          onChange={() => setOpenMaxLockMode(!openMaxLockMode)}
        />
      </Flex>
      <TYPE.body3 color="text2">
      When activated, it sets the lock to maximum unlock time, until disabled. Once disabled, the regular vesting unlock time will apply. Maximum unlock time gives a 1-to-1 voting power to the amount of locked tokens.
      </TYPE.body3>
    </Box>
  )
}

export default LockExtendAutoMaxLockMode


const SwitchCustom = styled(Switch)`
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &.MuiSwitch-root {
    margin: 0;
    padding: 0;
    height: 24px;
    justify-content: flex-end;
  }
  & .MuiSwitch-track {
    width: 24px;
    height: 20px;
    border-radius: 10px;
    background-color:#cdcdde;
  }
  & .MuiSwitch-switchBase {
    display: flex;
    align-items: center;
    position: relative;
    left: 15px;
    padding: 0;
    width: 12px;
    height: 12px;
    transform: translateX(0px);
    &.Mui-checked {
      transform: translateX(6px);
    }
  }
  & .MuiSwitch-thumb {
    width: 12px;
    height: 12px;
    padding: 0;
  }

  & .MuiTouchRipple-root {
    width: 24px;
    height: 24px;
  }


`
