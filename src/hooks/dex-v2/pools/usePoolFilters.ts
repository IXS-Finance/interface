import { useState } from 'react'

export default function usePoolFilters() {
  const [selectedTokens, setSelectedTokensState] = useState<string[]>([])

  function setSelectedTokens(addresses: string[]): void {
    setSelectedTokensState(addresses)
  }

  function addSelectedToken(address: string): void {
    setSelectedTokensState((prevTokens) => [...prevTokens, address])
  }

  function removeSelectedToken(address: string): void {
    setSelectedTokensState((prevTokens) => prevTokens.filter((token) => token !== address))
  }

  return {
    // state
    selectedTokens,
    // methods
    setSelectedTokens,
    addSelectedToken,
    removeSelectedToken,
  }
}
