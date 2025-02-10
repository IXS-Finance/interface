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

    console.log('_colors', _colors)
    setColors(_colors)

    return _colors
  }

  useEffect(() => {
    calculateColors()
  }, [JSON.stringify(seedTokens)])

  console.log('totalLiquidity', totalLiquidity)

  let data = [
    {
      label: 'SFP',
      value: 50,
      color: '#6666FF',
      cutout: '50%',
    },
    {
      label: 'USDT',
      value: 50,
      color: '#11D8B3',
      cutout: '50%',
    },
  ]

  const chartData = useMemo(() => {
    const validTokens = tokensList.filter((t) => t !== '')

    return {
      labels: validTokens.map((token) => getToken(token)?.symbol),
      datasets: [
        {
          data: data.map((item) => Math.round(item.value)),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
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
