import React, { useEffect, useMemo, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { prominent } from 'color.js'
import { Flex, Text } from 'rebass'
import InfoIcon from 'assets/images/dex-v2/info.svg'
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
  const { seedTokens, tokensList, totalLiquidity } = usePoolCreation()
  const { fNum } = useNumbers()
  const { getToken } = useTokens()
  const { resolve } = useUrls()

  const [colors, setColors] = useState<string[]>([])

  async function calculateColors() {
    const colorPromises = seedTokens
      .filter((t) => t.tokenAddress !== '')
      .map(async (t) => {
        try {
          const token = getToken(t.tokenAddress)
          const tokenLogoURI = resolve(token.logoURI || '')
          const color = await prominent(tokenLogoURI, {
            amount: 2,
            format: 'hex',
          })
          if (manualColorMap[token.symbol]) {
            return manualColorMap[token.symbol]
          }
          if (color[0] === '#ffffff' || color[0] === '#000000') return color[1] as string
          return color[0] as string
        } catch {
          return null
        }
      })
    const _colors = await Promise.all(colorPromises)
    setColors(_colors)

    return _colors
  }

  useEffect(() => {
    calculateColors()
  }, [JSON.stringify(seedTokens)])

  const chartData = useMemo(() => {
    const validTokens = tokensList.filter((t) => t !== '')

    return {
      labels: validTokens.map((token) => getToken(token)?.symbol),
      datasets: [
        {
          data: seedTokens.length > 0 ? seedTokens.map((t) => t.weight) : [],
          backgroundColor: colors.length > 0 ? colors : ['#D3D3D3'],
          borderColor: colors.length > 0 ? colors : ['#D3D3D3'],
          borderWidth: 0,
        },
      ],
    }
  }, [JSON.stringify(colors)])

  return (
    <div>
      <div>
        <Doughnut data={chartData} />

        <Flex flexDirection="column" justifyContent="space-between" alignItems="center" width="100%" my={32}>
          <Flex alignItems="center" style={{ gap: 6 }} mb="6px">
            <Text fontSize={14} color="#B8B8D2">
              In your wallet
            </Text>
            <img src={InfoIcon} alt="info" />
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
