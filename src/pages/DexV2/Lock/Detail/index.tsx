import React from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'

import LockDetailContent from './components/LockDetailContent'
import { LockDetailProvider } from './LockDetailProvider'
import useLockQuery from 'hooks/dex-v2/queries/useLockQuery'

const LockDetail: React.FC = () => {
  const params = useParams<{ id: string }>()
  const lockId = params.id.toLowerCase()
  const { lockDetail } = useLockQuery(lockId)

  return (
    <LockDetailProvider>
      <WidthFull>
        <LayoutContainer>
          <LeftContent>&nbsp;</LeftContent>
          <CenterContent>
            <LockDetailContent lockDetail={lockDetail} />
          </CenterContent>
          <RightContent>&nbsp;</RightContent>
        </LayoutContainer>
      </WidthFull>
    </LockDetailProvider>
  )
}

export default LockDetail

const WidthFull = styled.div`
  width: 100%;
`

const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  row-gap: 2rem;
  column-gap: 0px;
  margin-left: auto;
  margin-right: auto;
  max-width: 80rem;
  padding-left: 0px;
  padding-right: 0px;

  @media (min-width: 640px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    column-gap: 2rem;
    margin-top: 146px;
  }
`

const LeftContent = styled.div`
  grid-column: span 2 / span 2;
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }
`

const CenterContent = styled.div`
  grid-column: span 3 / span 3;
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  @media (min-width: 640px) {
    max-width: 36rem;
  }

  @media (min-width: 1024px) {
    margin-left: 0px;
    margin-right: 0px;
  }
`

const RightContent = styled.div`
  grid-column: span 2 / span 2;
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }
`
