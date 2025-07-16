import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title?: string
  message: string
}

interface PromptOptions {
  title?: string
  message: string
  placeholder?: string
  expectedValue?: string
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  resolve?: (value: boolean) => void
}

interface PromptState {
  isOpen: boolean
  title: string
  message: string
  placeholder: string
  expectedValue?: string
  resolve?: (value: string | null) => void
}

export const useConfirmation = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
  })

  const [promptState, setPromptState] = useState<PromptState>({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
  })

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Confirmation',
        message: options.message,
        resolve,
      })
    })
  }, [])

  const prompt = useCallback((options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        title: options.title || 'Input Required',
        message: options.message,
        placeholder: options.placeholder || '',
        expectedValue: options.expectedValue,
        resolve,
      })
    })
  }, [])

  const handleConfirmConfirm = useCallback(() => {
    confirmState.resolve?.(true)
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [confirmState.resolve])

  const handleConfirmCancel = useCallback(() => {
    confirmState.resolve?.(false)
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [confirmState.resolve])

  const handlePromptConfirm = useCallback((value: string) => {
    promptState.resolve?.(value)
    setPromptState((prev) => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [promptState.resolve])

  const handlePromptCancel = useCallback(() => {
    promptState.resolve?.(null)
    setPromptState((prev) => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [promptState.resolve])

  return {
    confirm,
    prompt,
    confirmProps: {
      isOpen: confirmState.isOpen,
      title: confirmState.title,
      message: confirmState.message,
      onConfirm: handleConfirmConfirm,
      onCancel: handleConfirmCancel,
    },
    promptProps: {
      isOpen: promptState.isOpen,
      title: promptState.title,
      message: promptState.message,
      placeholder: promptState.placeholder,
      expectedValue: promptState.expectedValue,
      onConfirm: handlePromptConfirm,
      onCancel: handlePromptCancel,
    },
  }
}
