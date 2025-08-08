import React, { ChangeEvent, FC, useState } from 'react'
import { Box, Flex } from 'rebass'
import { FileWithPath } from 'react-dropzone'
import { TYPE } from 'theme'
import { Label } from 'components/Label'
import Upload from 'components/Upload'
import { FilePreview, FilePreviewPayout } from 'components/FilePreview'
import { AcceptFiles } from 'components/Upload/types'
import { ReactComponent as InfoLogo } from 'assets/images/info-filled.svg'
import { ReactComponent as UploadLogo } from 'assets/images/NewDownloads.svg'
import { Text } from 'rebass'
import styled from 'styled-components'
import { UploaderCard } from 'pages/KYC/styleds'

export interface UploaderProps {
  files: FileWithPath[]
  onDrop: (file: any) => void
  title: string
  subtitle?: string | JSX.Element
  optional?: boolean
  error?: any | JSX.Element
  handleDeleteClick: (index: number) => void
  required?: boolean
  tooltipText?: string | JSX.Element
  isDisabled?: boolean
  isUploadHide?: boolean
  id?: any
  name?: string
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  isPayoutpage?: boolean
  acceptedFileTypes?: string[]
  onCsvRowsChange?: (value: string[][]) => void
  onCsvFileUpload?: (text: string) => void
}

export const Uploader: FC<UploaderProps> = ({
  id,
  title,
  subtitle,
  files,
  required,
  error,
  handleDeleteClick,
  onDrop,
  optional = false,
  tooltipText,
  isDisabled = false,
  isUploadHide = false,
  isPayoutpage,
  acceptedFileTypes,
  onCsvRowsChange,
  onCsvFileUpload,
}: UploaderProps) => {
  const defaultAcceptedFiles = `${AcceptFiles.PDF},image/jpeg,image/png`
  const accept = acceptedFileTypes?.join(',') || defaultAcceptedFiles

  const handleFileUpload = (file: FileWithPath) => {
    if (file.type === 'text/csv') {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        onCsvFileUpload?.(text)
      }
      reader.readAsText(file)
    }
  }

  const handleDrop = (acceptedFiles: FileWithPath | FileWithPath[]) => {
    const filesArray = Array.isArray(acceptedFiles) ? acceptedFiles : [acceptedFiles]

    filesArray.forEach((file) => {
      handleFileUpload(file)
      onDrop(file)
    })
  }

  const handleFileDelete = (index: number) => {
    handleDeleteClick(index)
    onCsvRowsChange?.([])
  }

  return (
    <Box>
      <Flex>
        <Label label={title} required={required} tooltipText={tooltipText} />
        {optional && (
          <>
            <TYPE.body1 marginLeft="4px" marginRight="8px" color={`text9`}>
              (optional)
            </TYPE.body1>
            <InfoLogo />
          </>
        )}
      </Flex>
      {subtitle && <StyledDescription marginBottom="10px">{subtitle}</StyledDescription>}

      {files && files.length > 0 && (
        <Flex flexWrap="wrap">
          {isPayoutpage ? (
            <>
              {files.map((file: any, index) => (
                <FilePreviewPayout
                  key={`file-${index}-${file.name}`}
                  file={file?.asset ? file.asset : file}
                  index={1}
                  handleDeleteClick={() => handleFileDelete(index)}
                  isDisabled={isDisabled}
                />
              ))}
            </>
          ) : (
            <>
              {files.map((file: any, index) => (
                <FilePreview
                  key={`file-${index}-${file.name}`}
                  file={file?.asset ? file.asset : file}
                  index={1}
                  handleDeleteClick={() => handleFileDelete(index)}
                  isDisabled={isDisabled}
                />
              ))}
            </>
          )}
        </Flex>
      )}

      {!isDisabled && !isUploadHide && (
        <Upload isDisabled={isDisabled} accept={accept as AcceptFiles} data-testid={id} file={null} onDrop={handleDrop}>
          <UploaderCard>
            <Flex flexDirection="column" justifyContent="center" alignItems="center" style={{ maxWidth: 100 }}>
              <StyledUploadLogo />
              <TYPE.small textAlign="center" marginTop="8px" color={'#666680'}>
                Drag and Drop
              </TYPE.small>
              <TYPE.small display="flex" textAlign="center" color={'#666680'}>
                or <Text style={{ marginLeft: 2, color: '#fff' }}>Upload</Text>
              </TYPE.small>
            </Flex>
          </UploaderCard>
        </Upload>
      )}

      {error && (
        <TYPE.small marginTop="4px" color={'red1'}>
          {error}
        </TYPE.small>
      )}
    </Box>
  )
}

const StyledDescription = styled(TYPE.description3)`
  color: ${({ theme: { text2 } }) => `${text2}50`};
  ul {
    margin: 0;
    padding-left: 20px;
    font-size: 12px;
    > li:not(:last-child) {
      margin-bottom: 8px;
    }
  }
  li {
    line-height: 18px;
  }
`

const StyledUploadLogo = styled(UploadLogo)`
  path {
    stroke: #fff;
    fill: none;
  }
`
