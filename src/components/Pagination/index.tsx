import React from 'react'
import styled, { css } from 'styled-components'
import { MEDIA_WIDTHS, TYPE } from 'theme'
import { ReactComponent as ArrowIcon } from '../../assets/images/newArrow.svg'
import { adminOffset } from 'state/admin/constants'

interface Props {
  page: number
  totalPages: number | null
  onPageChange: (page: number) => void
  totalItems?: number
  hidePaginationLabel?: boolean
}

export const Pagination = ({ page, onPageChange, totalPages, totalItems, hidePaginationLabel }: Props) => {
  const itemsPerPage = adminOffset <= (totalItems ?? 0) ? adminOffset : (totalItems ?? 0);
  const startItem = (page - 1) * itemsPerPage + 1
  const endItem = totalPages ? Math.min(page * itemsPerPage, totalPages * itemsPerPage) : '...'

  return (
    <Container>
      <InfoContainer>
        {!hidePaginationLabel ? (
          <TYPE.small>
            {startItem} - {endItem} of {totalItems}
          </TYPE.small>
        ) : null}
        <NavButton onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <PrevIcon />
        </NavButton>
        <NavButton onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
          <NextIcon />
        </NavButton>
      </InfoContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    flex-direction: column;
  }
`

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`

const NavButton = styled.button<{ disabled?: boolean }>`
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.text10};
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    `}
`

const NextIcon = styled(ArrowIcon)``

const PrevIcon = styled(ArrowIcon)`
  transform: rotate(-180deg);
`
