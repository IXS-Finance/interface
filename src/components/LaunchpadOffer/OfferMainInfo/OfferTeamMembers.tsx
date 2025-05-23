import React from 'react'
import styled from 'styled-components'

import { OfferTeamMember } from 'state/launchpad/types'
import { text34, text56, text7 } from 'components/LaunchpadMisc/typography'
import { MEDIA_WIDTHS } from 'theme'
import { getPublicAssetUrl } from 'components/TokenLogo/utils'

interface Props {
  team: OfferTeamMember[]
}

export const OfferTeamMembers: React.FC<Props> = (props) => {
  return (
    <TeamMemberList>
      <TeamMemberListTitle>Team Members</TeamMemberListTitle>

      {props.team.map((member, idx) => (
        <TeamMemberCard key={`team-member-${idx}`}>
          <TeamMemberPhoto src={getPublicAssetUrl(member.avatar)} />
          <TeamMemberName>{member.name}</TeamMemberName>
          <TeamMemberRole>{member.title}</TeamMemberRole>
          <TeamMemberSummary>{member.description}</TeamMemberSummary>
        </TeamMemberCard>
      ))}
    </TeamMemberList>
  )
}

const TeamMemberList = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1rem;
  white-space: pre-line;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    padding: 0px 20px;
  }
`

const TeamMemberListTitle = styled.div`
  ${text56}

  color: ${(props) => props.theme.launchpad.colors.text.title};
`

const TeamMemberCard = styled.div`
  display: grid;

  grid-template-columns: 48px 1fr;
  grid-template-rows: repeat(4, auto);
  grid-template-areas:
    'photo name'
    'photo role'
    '. summary';

  place-content: start center;
  gap: 0 1rem;
  padding: 2rem;

  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 8px;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    padding: 1rem 0rem;
  }
`

const TeamMemberPhoto = styled.img`
  grid-area: photo;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`

const TeamMemberName = styled.div`
  grid-area: name;
  ${text34}

  color: ${(props) => props.theme.launchpad.colors.text.title};
`
const TeamMemberRole = styled.div`
  grid-area: role;
  ${text34}
  color: ${(props) => props.theme.launchpad.colors.text.caption};
`

const TeamMemberSummary = styled.div`
  grid-area: summary;
  ${text7}

  color: ${(props) => props.theme.launchpad.colors.text.body};
`
