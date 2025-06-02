import React, { useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as MenuIcon } from '../../assets/images/newMmobileIcon.svg'
import { Menu } from './Menu'

export const MobileMenu = (props: any) => {
  const [open, handleIsOpen] = useState(false)

  const toggle = () => handleIsOpen((state) => !state)
  const close = () => handleIsOpen(false)

  return (
    <>
      <IconContainer>
        <StyledMenuIcon onClick={toggle} />
      </IconContainer>
      {open && <Menu isAdminMenu={props.isAdmin} close={close} />}
    </>
  )
}

const IconContainer = styled.div`
  text-align: right;
  width: fit-content;
  display: none;

  @media (max-width: 1400px) {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  } ;
`

const StyledMenuIcon = styled(MenuIcon)`
  cursor: pointer;
`
