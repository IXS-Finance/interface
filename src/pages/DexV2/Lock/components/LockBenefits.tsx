import { Box, Flex } from "rebass"
import styled from "styled-components"
import { TYPE } from "theme"

import { ReactComponent as GiftIcon } from 'assets/images/dex-v2/gift.svg'
import { ReactComponent as PercentageIcon } from 'assets/images/dex-v2/percentage.svg'
import { Line } from "components/Line"
import { Fragment } from "react"

const lockBenefitContents = [{
  icon: GiftIcon,
  title: 'Protocol Trading Fees',
  description: 'Users will earn a share of the protocol’s trading fees.',
}, {
  icon: PercentageIcon,
  title: 'Launchpad Rewards',
  description: 'Exclusive access to commission fees from successful project launches on the launchpad',
}, ]

const LockBenefits = () => {
  return (
    <Container p={5}>
      <Box mb={4}>
        <TYPE.label>Benefits</TYPE.label>
      </Box>
      <Flex flexDirection='column' style={{ gap: 32 }}>
        {lockBenefitContents.map((content, i) => {
          const Icon = content.icon
          return (
            <Fragment key={content.title}>
              <Box>
                <StyledIcon mb={2}><Icon color='#6666FF' /></StyledIcon>
                <TYPE.subHeader1>{content.title}</TYPE.subHeader1>
                <TYPE.subHeader color='#84849D'>{content.description}</TYPE.subHeader>
              </Box>
              {i !== lockBenefitContents.length - 1 ? <Line /> : null}
            </Fragment>
          )
        })}
      </Flex>
    </Container>
  )
}

const Container = styled(Box)`
  background-color: ${({ theme }) => theme.white}4D;
  border-radius: 16px;
  height: 100%;
`

const StyledIcon = styled(Box)`
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 50%;
  border: 1px solid #6666FF4D;
`

export default LockBenefits
