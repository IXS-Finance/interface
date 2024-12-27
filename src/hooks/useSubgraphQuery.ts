import { useEffect, useState } from 'react'
import { SUBGRAPH_QUERY, SUBGRAPH_URLS } from 'constants/subgraph'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

interface SubgraphQueryProps {
  feature: 'LBP' | SUBGRAPH_QUERY
  chainId: number | undefined
  query: string
  autoPolling?: boolean
  pollingInterval?: number
  variables?: any
}

interface SubgraphQueryPropsNew extends UseQueryOptions {
  feature: SUBGRAPH_QUERY
  chainId: number | undefined
  query: string
  variables?: any
}

export const useSubgraphQueryLegacy = ({
  feature,
  chainId,
  query,
  autoPolling = false,
  pollingInterval = 3000,
  variables = null,
}: SubgraphQueryProps) => {
  if (!chainId) {
    return null
  }

  const [data, setData] = useState<{ [key: string]: any }>({})

  const fetchData = async () => {
    try {
      const endpoint = SUBGRAPH_URLS[feature][chainId]

      if (!endpoint || !query) return

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables, }),
      })

      const responseData = await resp.json()
      setData(responseData.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()

    if (autoPolling) {
      // Polling logic
      const interval = setInterval(fetchData, pollingInterval)

      // Clean up the interval when the component unmounts
      return () => clearInterval(interval)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, pollingInterval, autoPolling, query, variables])

  return data
}

export const useSubgraphQuery = ({
  feature,
  chainId,
  query,
  variables = null,
  ...options
}: SubgraphQueryPropsNew) => {
  const fetchData = async () => {
    if (!chainId) {
      return null
    }

    const endpoint = SUBGRAPH_URLS[feature][chainId]

    if (!endpoint || !query) return

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables, }),
    })

    return await resp.json()
  }

  return useQuery({
    queryFn: fetchData,
    ...options,
  })
}

export const useSubgraphQueryWithCallback = ({
  feature,
  chainId,
  query,
  autoPolling = false,
  pollingInterval = 3000,
}: SubgraphQueryProps) => {
  if (!chainId) {
    return null
  }

  const [data, setData] = useState<{ [key: string]: any }>({})

  const fetchData = async () => {
    try {
      const endpoint = SUBGRAPH_URLS[feature][chainId]

      if (!endpoint || !query) return

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables: null }),
      })

      const responseData = await resp.json()
      setData(responseData.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()

    if (autoPolling) {
      // Polling logic
      const interval = setInterval(fetchData, pollingInterval)

      // Clean up the interval when the component unmounts
      return () => clearInterval(interval)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, pollingInterval, autoPolling, query])

  return { data, fetchData }
}
