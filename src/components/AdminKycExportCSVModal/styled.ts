import styled from 'styled-components'

import { ReactComponent as Close } from '../../assets/images/x.svg'

export const Container = styled.div`
  min-width: 420px;
  min-height: 340px;
  width: 100%;
  border-radius: 16px;
  background: ${({ theme }) => theme.bg25};
  padding: 0;
  text-align: center;

  @media (max-width: 430px) {
    min-width: 350px;
  }

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  > button {
    max-width: 312px;
    width: 100%;
    margin: 0 auto;
    margin-bottom: 32px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 1rem;
  `};
`

export const Title = styled.h1`
  color: #292933;
  text-align: center;
  font-family: Inter;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 130%; /* 23.4px */
  letter-spacing: -0.54px;
`

export const Desc = styled.p`
  color: #666680;
  width: 250px;
  text-align: center;
  font-family: Inter;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 19.5px */
  letter-spacing: -0.26px;
  margin-top: 0px;
`

export const ActionWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 32px;
`

export const CloseIcon = styled.div`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

export const CloseColor = styled(Close)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`
