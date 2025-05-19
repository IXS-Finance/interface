import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { TYPE } from 'theme'
import styled from 'styled-components'

import apiService from 'services/apiService'

interface RouteParams {
  id: string | undefined
}

interface InternalNotesProps {
  message: string | undefined
}

const InternalNotes: React.FC<InternalNotesProps> = ({ message }) => {
  const { id } = useParams<RouteParams>()

  const [note, setNote] = useState(message || '')

  useEffect(() => {
    if (message) {
      setNote(message)
    }
  }, [message])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }

  const saveNoteMutation = useMutation({
    mutationFn: (newNote: string) => apiService.put(`/newkyc/private-notes/${id}`, { message: newNote }),
  })

  const handleSaveNote = () => {
    saveNoteMutation.mutate(note)
  }

  const debouncedSaveNote = React.useMemo(
    () => debounce(handleSaveNote, 1000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note, id]
  )

  useEffect(() => {
    if (note) {
      debouncedSaveNote()
    }
    return () => {
      debouncedSaveNote.cancel()
    }
  }, [note, debouncedSaveNote])

  return (
    <div>
      <StatusHeader>
        <TYPE.body4>Internal Note Message (Auto save)</TYPE.body4>
      </StatusHeader>
      <TextField
        value={note}
        onChange={handleChange}
        onBlur={() => {
          debouncedSaveNote.cancel()
          handleSaveNote()
        }}
        placeholder="Add internal note message"
        style={{ marginTop: '10px', marginBottom: '20px' }}
      />
    </div>
  )
}

export default InternalNotes

const TextField = styled.textarea`
  width: 716px;
  height: 160px;
  padding: 16px 16px 24px 16px;
  flex-shrink: 0;
  border: 1px solid #e6e6ff;
  border-radius: 8px;
  background-color: #fff;
  font-family: inherit;
  font-size: 14px;
  color: inherit;
  resize: none;
`

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`
