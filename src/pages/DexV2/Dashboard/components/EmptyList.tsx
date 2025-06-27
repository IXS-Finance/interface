import React from 'react'
import { Box } from '@mui/material'
import { TYPE } from 'theme'
import styled from 'styled-components'
import { ReactComponent as ListIcon } from 'assets/images/list.svg'

const EmptyList = () => {
  return (
    <Card>
      <IconList mb={1}>
        <ListIcon />
      </IconList>
      <TYPE.body3 className="title">Empty List</TYPE.body3>
      <TYPE.body3 className="description">You have no items at the moment</TYPE.body3>
    </Card>
  )
}

export default EmptyList

export const IconList = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  border: 1px solid #cfcfe6;
`

export const Card = styled(Box)`
  border-radius: 16px;
  background: #fff;
  padding: 36px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  user-select: none;

  .title {
    font-weight: 500;
  }

  .description {
    color: ${(props) => props.theme.launchpad.colors.text.bodyAlt};
    font-weight: 400;
    letter-spacing: -0.03em;
  }
`