import React from 'react'
import styled from 'styled-components'
import { MEDIA_WIDTHS, TYPE } from 'theme'
import checkIcon from 'assets/images/new-dark-ui/kyc/checked.svg'

const VerificationConfirmation = () => {
  return (
    <Container>
      <CenteredDiv>
        <TYPE.title9 lineHeight={'30px'} fontSize={'20px'}>
          Verification code has been <br /> confirmed successfully.
        </TYPE.title9>
        <div className="flex justify-center mt-3">
          <button className="bg-[#36b24a] flex flex-row gap-2 items-center justify-center px-8 py-3 rounded-[50px] mt-5 pointer-events-none">
            <span className="font-inter font-medium text-white text-base leading-[1.4] whitespace-nowrap">
              Confirmed
            </span>
            <div>
              <img src={checkIcon} alt="Confirmed" className="w-full h-full object-contain" />
            </div>
          </button>
        </div>
      </CenteredDiv>
    </Container>
  )
}

export default VerificationConfirmation

const Container = styled.div`
  margin-top: 28px;
  height: 252px;
  padding: 64px;

  @media (max-width: ${MEDIA_WIDTHS.upToMedium}px) {
    padding: 28px;
    height: 200px;
  }
`

const CenteredDiv = styled.div`
  text-align: center;
`
