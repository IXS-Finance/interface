import { createContext, PropsWithChildren, useContext, useState } from 'react'

export type UseDashResult = ReturnType<typeof _useDashboard>
export const DashboardContext = createContext<UseDashResult | null>(null)

export function _useDashboard() {
  const [userInput, setUserInput] = useState('')

  return {
    userInput,
    setUserInput,
  }
}

export function DashProvider({ children }: PropsWithChildren) {
  const value = _useDashboard()
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export const useDashboard = (): UseDashResult => useContext(DashboardContext) as UseDashResult
