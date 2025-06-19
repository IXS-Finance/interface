import React, { useEffect, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { prominent } from 'color.js'
import { Flex, Text } from 'rebass'

import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useUrls from 'hooks/dex-v2/useUrls'

ChartJS.register(ArcElement, Tooltip, Legend)

interface PoolSummaryProps {}

const manualColorMap = {
  ETH: '#627EEA',
  WETH: '#627EEA',
  WBTC: '#F7931A',
  TIXS: '#00265A',
} as any

const PoolSummary: React.FC<PoolSummaryProps> = () => {
  const { seedTokens, totalLiquidity } = usePoolCreation()
  const { fNum } = useNumbers()
  const { getToken } = useTokens()
  const { resolve } = useUrls()

  const [colors, setColors] = useState<string[]>([])

  const tokens = seedTokens.filter((t) => t.tokenAddress !== '')
  async function calculateColors() {
    const colorPromises = seedTokens
      .filter((t) => t.tokenAddress !== '')
      .map(async (t) => {
        try {
          const token = getToken(t.tokenAddress)
          const tokenLogoURI = resolve(token.logoURI || '')
          if (tokenLogoURI === '' && manualColorMap[token.symbol]) {
            return manualColorMap[token.symbol]
          } else {
            const color = await prominent(tokenLogoURI, {
              amount: 2,
              format: 'hex',
            })

            if (color[0] === '#ffffff' || color[0] === '#000000') return color[1] as string
            return color[0] as string
          }
        } catch (e) {
          console.error(e)
          return null
        }
      })
    const _colors = await Promise.all(colorPromises)
    setColors(_colors)

    return _colors
  }
  console.log('tokens', tokens)
  const chartData = {
    labels: tokens.map((token: any) => getToken(token.tokenAddress)?.symbol),
    datasets: [
      {
        data: tokens.length > 0 ? tokens.map((t) => t.weight) : [],
        backgroundColor: colors.length > 0 ? colors : ['#D3D3D3'],
        borderColor: colors.length > 0 ? colors : ['#D3D3D3'],
        borderWidth: 0,
      },
    ],
  }
  useEffect(() => {
    calculateColors()
  }, [JSON.stringify(seedTokens)])
  return (
    <div>
      <div>
        <Doughnut data={chartData} />

        <Flex flexDirection="column" justifyContent="space-between" alignItems="center" width="100%" my={32}>
          <Flex alignItems="center" style={{ gap: 6 }} mb="6px" color="#B8B8D2">
            <Text fontSize={14}>In your wallet</Text>
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </Flex>

          <Text fontSize={20} color="rgba(41, 41, 51, 0.90)" fontWeight={600}>
            {fNum(totalLiquidity.toString(), FNumFormats.fiat)}
          </Text>
        </Flex>
      </div>
    </div>
  )
}

export default PoolSummary
