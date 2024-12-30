import { Currency } from "@ixswap1/sdk-core"
import { createContext, PropsWithChildren, useContext, useState } from "react"

export type UseLockResult = ReturnType<typeof _useLock>
export const LockContext = createContext<UseLockResult | null>(null)

export function _useLock() {
  const [userInput, setUserInput] = useState('')
  const [duration, setDuration] = useState(604800) // 7 days

  return {
    userInput, setUserInput,
    duration, setDuration,
  }
}

export function LockProvider({
  children,
}: PropsWithChildren) {
  const value = _useLock()
  return <LockContext.Provider value={value}>{children}</LockContext.Provider>
}

export const useLock = (): UseLockResult => useContext(LockContext) as UseLockResult
