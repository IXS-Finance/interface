import { Trans } from '@lingui/macro'
import React, { FC, useState, useCallback } from 'react'

import { ButtonGradientBorder, ButtonIXSGradient, ButtonOutlined, PinnedContentButton } from 'components/Button'
import Column from 'components/Column'
import { TYPE } from 'theme'

import { FormCard, PageLink, KYCStatusIcons } from './styleds'
import { Box } from 'rebass'

interface KYCProgressTopic {
  title: string
  href: string
  passed?: boolean
  failed?: boolean
}

interface Props {
  topics: KYCProgressTopic[]
  reasons: string[]
  description: string | null
  disabled?: boolean
  handleSubmit?: (e: any) => void
  handleSaveProgress?: (e: any) => void
  isKycV2?: boolean
}

export const KYCProgressBar: FC<Props> = ({
  description,
  topics,
  disabled,
  handleSubmit,
  handleSaveProgress,
  isKycV2,
}: Props) => {
  const [activeTopic, setActiveTopic] = useState<number>(0)

  const handleScrollToDiv = useCallback(
    (href: string, index: number) => {
      setActiveTopic(index)

      document.getElementById(href)?.scrollIntoView({ behavior: 'smooth' })
    },
    [setActiveTopic]
  )

  return (
    <div>
      <FormCard style={{ padding: '24px 0px' }}>
        <TYPE.title6 fontSize={'18px'} fontWeight={'700'} marginBottom="16px" paddingX="24px">
          Progress
        </TYPE.title6>

        <Column>
          {topics.map(
            ({ title, href, passed, failed }, index) =>
              title && (
                <PageLink
                  onClick={() => handleScrollToDiv(href, index)}
                  active={index === activeTopic}
                  key={`page-nav-${index}`}
                >
                  {title}
                  {passed && KYCStatusIcons.approved()}
                  {failed && KYCStatusIcons.rejected()}
                </PageLink>
              )
          )}
        </Column>
        {!isKycV2 && (
          <Box style={{ padding: '0px 20px' }}>
            <PinnedContentButton
              onClick={handleSubmit}
              disabled={disabled}
              type="submit"
              data-testid="submitButton"
              style={{ width: '100%' }}
              marginY="24px"
            >
              Submit form
            </PinnedContentButton>
            <ButtonOutlined style={{ width: '100%' }} onClick={handleSaveProgress}>
              Save Progress
            </ButtonOutlined>
          </Box>
        )}
      </FormCard>

      {/* <ButtonIXSGradient
        onClick={handleSubmit}
        disabled={disabled}
        type="submit"
        data-testid="submitButton"
        style={{ width: '100%' }}
        marginY="24px"
      >
        Submit form
      </ButtonIXSGradient> */}
    </div>
  )
}
