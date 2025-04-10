import React from 'react'
import styled, { useTheme } from 'styled-components'
import { FileRejection, useDropzone } from 'react-dropzone'
import { FormikErrors, FieldArray, FormikTouched, Field, FieldProps } from 'formik'
import { ReactComponent as ImageIcon } from 'assets/launchpad/svg/image-icon.svg'
import { Plus, Trash } from 'react-feather'
import { ReactComponent as TrashIcon } from 'assets/launchpad/svg/trash-icon.svg'
import { Column } from 'components/LaunchpadMisc/styled'
import { InformationFormValues, VideoLink } from '../types'
import { AddButton, DeleteButton } from '../../shared/styled'
import { FormField } from '../../shared/fields/FormField'
import { FormGrid } from '../../shared/FormGrid'
import { IssuanceFile } from '../../types'
import { TextareaField } from '../../shared/fields/TextareaField'
import { text19, text20, text21, text48, text60 } from 'components/LaunchpadMisc/typography'
import { getSetter } from '../util'
import { useShowError } from 'state/application/hooks'
import { imageTypes, MBinBytes } from '../../shared/constants'

interface Props {
  images: IssuanceFile[]
  videos: VideoLink[]
  description: string

  errors: FormikErrors<InformationFormValues>
  touched: FormikTouched<InformationFormValues>

  setter: (field: string, value: any) => void
  touch?: (field: string, touched: boolean) => void
}

export const GalleryBlock: React.FC<Props> = (props) => {
  const theme = useTheme()
  const showError = useShowError()

  const container = React.useRef<HTMLDivElement>(null)

  const onFileSelect = React.useCallback(
    (files: File[]) => {
      // @ts-ignore
      props.setter('images', props.images.concat(files.map((x) => ({ file: x }))))

      if (props.touch) {
        setTimeout(() => {
          if (props.touch) props.touch('images', true)
        })
      }

      container.current?.scrollTo({ left: container.current.scrollWidth, behavior: 'smooth' })
    },
    [props.images, container]
  )

  const removeImage = React.useCallback(
    (idx: number) => {
      const images = [...props.images]

      images.splice(idx, 1)

      props.setter('images', images)

      if (props.touch) {
        setTimeout(() => {
          if (props.touch) props.touch('images', true)
        })
      }
    },
    [props.images]
  )

  const urls = React.useMemo(
    () =>
      props.images.map((x) => {
        if (x.file) {
          let blob = x.file as any
          if (x.file.type) {
            blob = new Blob([x.file], { type: x.file.type })
          } else if (x.file.name.endsWith('.svg')) {
            blob = new Blob([x.file], { type: 'image/svg+xml' })
          }
          return URL.createObjectURL(blob)
        }
        return ''
      }),
    [props.images]
  )
  const videos = React.useMemo(() => props.videos as (VideoLink & { id: number })[], [props.videos])

  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDrop: onFileSelect,
    accept: imageTypes,
    maxSize: 10 * MBinBytes,
    onDropRejected: (fileRejections: FileRejection[]) => {
      fileRejections.forEach((rj) => {
        rj.errors.forEach((err) => {
          if (err.message) {
            showError(err.message)
          }
        })
      })
    },
  })

  return (
    <FormGrid title="Gallery">
      <TitledContainer>
        <Title>Images</Title>
        <Hint>{'File size should not exceed 10.0 MB. Supported file formats are PNG, JPG, JPEG, and SVG'}</Hint>
        <ImageFieldContainer ref={container}>
          {props.images.map((image, idx) => (
            <ImageFileCardContainer key={idx} url={urls[idx]}>
              <ImageRemoveButton onClick={() => removeImage(idx)}>
                <Trash size="15" color={theme.launchpad.colors.primary} />
              </ImageRemoveButton>
            </ImageFileCardContainer>
          ))}

          <ImageFieldPromptContainer {...getRootProps()}>
            <input {...getInputProps()} />

            <ImageIcon width={16} height={16} />

            <header>Add More Images</header>

            <main>Drag images here or click to browse</main>
          </ImageFieldPromptContainer>
        </ImageFieldContainer>
      </TitledContainer>

      <TitledContainer>
        <Title>Videos</Title>

        <FieldArray name="videos">
          {({ push, handleRemove }) => (
            <>
              {videos.map((video, idx) => (
                <Field name={`videos[${idx}].url`} key={idx}>
                  {({ field: { name, value, onChange, onBlur }, meta }: FieldProps) => (
                    <FormField
                      label="Link Source"
                      placeholder="URL"
                      field={name}
                      setter={getSetter(onChange)}
                      touch={getSetter(onBlur)}
                      value={value}
                      error={meta.error}
                      trailing={
                        (props.videos.length > 1 || idx > 0) && (
                          <RemoveButton onClick={handleRemove(idx)}>
                            <TrashIcon />
                          </RemoveButton>
                        )
                      }
                    />
                  )}
                </Field>
              ))}

              <AddButton onClick={() => push({ url: '' })}>
                <Plus /> Add Video
              </AddButton>
            </>
          )}
        </FieldArray>
      </TitledContainer>

      <DescriptionContainer>
        <DescriptionLabel>Description/Pitch</DescriptionLabel>
        <DescriptionHint>Provide a description of the issuance. This is what the investors will see.</DescriptionHint>

        <TextareaField
          field="longDescription"
          setter={props.setter}
          touch={props.touch}
          label=""
          placeholder=""
          value={props.description}
          error={(props.touched.longDescription && props.errors.longDescription) as string}
        />
      </DescriptionContainer>
    </FormGrid>
  )
}

const Hint = styled.div`
  ${text19}

  color: ${(props) => props.theme.launchpad.colors.text.bodyAlt};
`

const TitledContainer = styled(Column)`
  grid-column: span 2;
  gap: 1rem;
`

const Title = styled.div`
  ${text60}
  color: ${(props) => props.theme.launchpad.colors.text.title};
`

const ImageFieldContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: stretch;
  gap: 0.75rem;
  padding: 0.75rem;
  overflow-x: auto;
  overflow-y: hide;
  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 6px;

  scrollbar-height: thin;
  scrollbar-color: ${(props) => props.theme.launchpad.colors.border.default};
  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.launchpad.colors.border.default};
  }
`

const ImageFileCardContainer = styled.div<{ url?: string }>`
  position: relative;
  width: 160px;
  height: 160px;
  flex-basis: 160px;
  flex-shrink: 0;
  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 6px;

  ${(props) =>
    props.url &&
    `
    background: url(${props.url});
    background-repeat: no-repeat;
    background-size: cover;
  `}

  content: contain;
`

const ImageRemoveButton = styled.button`
  position: absolute;
  display: grid;
  place-content: center;
  width: 24px;
  height: 24px;
  right: 0.125rem;
  top: 0.125rem;
  background: none;
  border: none;
  outline: none;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;

  :hover {
    background: ${(props) => props.theme.launchpad.colors.text.title + '20'};
  }
`

const ImageFieldPromptContainer = styled(ImageFileCardContainer)`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  padding: 2rem 0;
  cursor: pointer;
  transition: background 0.3s;

  :hover {
    background: ${(props) => props.theme.launchpad.colors.foreground};
  }

  header,
  main {
    max-width: 80%;
  }

  header {
    ${text21}
    text-align: center;
    color: ${(props) => props.theme.launchpad.colors.text.title};
  }

  main {
    ${text20}
    text-align: center;
    color: ${(props) => props.theme.launchpad.colors.text.bodyAlt};
  }
`

const RemoveButton = styled(DeleteButton)`
  position: absolute;
  right: 1rem;
`

const DescriptionContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: stretch;
  gap: 0.5rem;
  grid-column: span 2;
`
const DescriptionLabel = styled.div`
  ${text48}
  color: ${(props) => props.theme.launchpad.colors.text.title};
`

const DescriptionHint = styled.div`
  ${text19}
  color: ${(props) => props.theme.launchpad.colors.text.hint};
`
