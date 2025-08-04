import styled from 'styled-components'

import { MEDIA_WIDTHS } from 'theme'

export const Container = styled.div`
  max-width: 779px;
  min-height: 473px;
  width: 100%;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg1};
  padding: 48px;
  text-align: center;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    padding: 16px;
  }
`

export const Title = styled.div`
  font-weight: 700;
  font-size: 18px;
  line-height: 145%;
  background: ${({ theme }) => theme.config.text?.main || theme.bgG1};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  color: #292933;
`

export const Info = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  color: #8f8fb2;
`

export const NetworksRow = styled.div<{ elements: number }>`
  display: grid;
  gap: 34px;
  grid-template-columns: ${({ elements }) => `repeat(${elements}, minmax(auto, 105px))`};
  margin: 48px auto 48px;
  justify-content: center;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    grid-template-columns: ${({ elements }) => `repeat(${elements}, 1fr)`};
    gap: 8px;
  }
`

export const NetworkCard = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 6px;
  border: 1px solid rgba(102, 102, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  padding: 16px;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  position: relative;
  display: flex;
  flex-direction: column;
  row-gap: 12px;
  img {
    height: 32px;
    width: auto;
  }
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    font-size: 13px;
  }
  transform: scale(1);
  transition: transform 250ms ease-in-out;
  :hover {
    transform: scale(1.05);
  }
`

export const InfoRows = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 8px;
  color: #8f8fb2;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%; /* 21px */
  letter-spacing: -0.28px;
`

export const PlaygroundBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -19px;
  background: ${({ theme }) => theme.text1};
  border-radius: 32px;
  padding: 2px 6px;

  > div {
    font-weight: 600;
    font-size: 10px;
    line-height: 15px;
    background: ${({ theme }) => theme.bgG1};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
      font-size: 9px;
    }
  }
`

export const KovanRow = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: center;
`

export const ConnectWalletContainer = styled(Container)<{ hasAnnouncement?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: ${({ hasAnnouncement }) => (hasAnnouncement ? 3 : 1)}rem;

  a {
    color: ${({ theme }) => theme.text1};
  }

  > div:first-child {
    font-weight: 400;
    font-size: 16px;
    line-height: 160%;
    text-align: center;
    color: ${({ theme }) => theme.text2};
    margin-bottom: 14px;
  }

  > div:nth-child(2) {
    text-align: center;
    color: ${({ theme }) => theme.text1};
    margin-bottom: 32px;
    font-size: 32px;
    font-weight: 800;
  }

  > span:last-child {
    font-weight: 400;
    font-size: 13px;
    text-align: center;
    color: ${({ theme }) => theme.text2};
    line-height: 20.8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 1rem;
  `};
`
