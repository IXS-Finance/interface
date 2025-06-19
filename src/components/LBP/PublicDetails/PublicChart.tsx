import React, { useCallback, useMemo } from 'react'
import { AreaChart, XAxis, YAxis, Tooltip, DefaultTooltipContent, Area } from 'recharts'
import styled from 'styled-components'
import { useWeb3React } from 'hooks/useWeb3React'
import { useSubgraphQueryLegacy } from 'hooks/useSubgraphQuery'
import { unixTimeToFormat } from 'utils/time'
import { getPrice, getDecayAtStep } from '../utils/calculation'
import { MEDIA_WIDTHS } from 'theme'
import { isMobile } from 'react-device-detect'

const composeHistoricalPriceQuery = (lbpAddress: string) => {
  return `
    {
      trades(where:{ pool_:{ id:"${lbpAddress}"}}, orderBy: blockTimestamp, orderDirection: asc) {
        blockTimestamp
        usdPrice
      }
    }
  `
}

interface DetailsChartProps {
  contractAddress?: string
  currentShareReserve?: string
  currentAssetReserve?: string
  startDate?: string
  endDate?: string
  startWeight?: number
  endWeight?: number
  shareAmount?: number
  assetAmount?: number
  chartWidth?: number
}

const DATA_POINT_COUNT = 100
const PRICE_PRECISION = 4

const CustomTooltip: React.FC<{ active?: boolean; payload?: any }> = (props) => {
  if (props.payload[0] != null) {
    // mutating props directly is against react's conventions
    // so we create a new payload with the name and value fields set to what we want
    const newPayload = [
      ...props.payload,
      {
        name: 'time',
        // all your data which created the tooltip is located in the .payload property
        value: props.payload[0].payload.dateWithTime,
        // you can also add "unit" here if you need it
      },
    ]

    // we render the default, but with our overridden payload
    return <DefaultTooltipContent {...props} payload={newPayload} />
  }

  // we just render the default
  return <DefaultTooltipContent {...props} />
}

export default function DetailsChart({
  contractAddress,
  startDate,
  endDate,
  startWeight,
  endWeight,
  shareAmount,
  assetAmount,
  currentShareReserve,
  currentAssetReserve,
  chartWidth,
}: DetailsChartProps) {
  const { chainId, account } = useWeb3React()

  if (!chainId || !account) return null

  const subgraphData = useSubgraphQueryLegacy({
    feature: 'LBP',
    chainId,
    query: composeHistoricalPriceQuery(contractAddress?.toLowerCase() || ''),
    pollingInterval: 20000,
    autoPolling: true,
  })

  // bucket size is the duration between two data points in milliseconds
  const bucketSize = useMemo(() => {
    if (!startDate || !endDate) return 0
    const start: any = new Date(startDate || '')
    const end: any = new Date(endDate || '')
    // Calculate the difference in milliseconds
    const differenceInMs = end - start
    const bucketSize = differenceInMs / DATA_POINT_COUNT
    return bucketSize
  }, [startDate, endDate])

  // get bucket index for a given timestamp
  const getBucketIndex = useCallback(
    (timestamp: any) => {
      if (!bucketSize || !startDate) return -1

      const start: any = new Date(startDate || '')
      const differenceFromStart = timestamp - start
      const bucketIndex = Math.floor(differenceFromStart / bucketSize)
      return bucketIndex
    },
    [startDate, bucketSize]
  )

  const dataPoints = useMemo(() => {
    if (
      !startWeight ||
      !endWeight ||
      !shareAmount ||
      !assetAmount ||
      !currentAssetReserve ||
      !currentShareReserve ||
      !bucketSize ||
      !startDate
    )
      return []

    const trades = subgraphData?.trades || []
    const lastTrade = trades.length ? trades[trades.length - 1] : null
    const lastTradeTimestamp = lastTrade ? new Date(Number(lastTrade.blockTimestamp) * 1000) : new Date(0)
    const lastPrice = lastTrade ? lastTrade.usdPrice : 0

    // Group trades by bucket index and find the highest price for each bucket
    const bucketMap = trades.reduce((acc: any, trade: any) => {
      const timestampMs = new Date(Number(trade.blockTimestamp) * 1000).getTime()
      const bucketIndex = getBucketIndex(timestampMs)

      const currentTrade = {
        bucketIndex: bucketIndex,
        blockTimestamp: trade.blockTimestamp,
        date: unixTimeToFormat({ time: trade.blockTimestamp, format: 'MMM DD' }),
        dateWithTime: unixTimeToFormat({ time: trade.blockTimestamp, format: 'MMM DD, HH:mm:ss' }),
        price: parseFloat(trade.usdPrice).toFixed(PRICE_PRECISION),
      }

      // Update bucket if current trade has a higher price
      if (!acc[bucketIndex] || parseFloat(currentTrade.price) > parseFloat(acc[bucketIndex].price)) {
        acc[bucketIndex] = currentTrade
      }

      return acc
    }, {})

    const start: any = new Date(startDate || '')
    const shareStartWeight = startWeight / 100
    const shareEndWeight = endWeight / 100

    const initialPrice = getPrice(shareAmount, shareStartWeight, assetAmount, 1 - shareStartWeight).toFixed(
      PRICE_PRECISION
    )

    bucketMap[-1] = {
      bucketIndex: -1,
      date: unixTimeToFormat({ time: start.getTime() / 1000, format: 'MMM DD' }),
      dateWithTime: unixTimeToFormat({ time: start.getTime() / 1000, format: 'MMM DD, HH:mm:ss' }),
      blockTimestamp: 0,
      price: initialPrice,
    }

    // Fill in missing future buckets
    for (let i = 0; i < DATA_POINT_COUNT; i++) {
      const time = start.getTime() + i * bucketSize
      if (!bucketMap[i] && time > lastTradeTimestamp.getTime()) {
        const decay = getDecayAtStep(shareStartWeight, shareEndWeight, i, DATA_POINT_COUNT)
        const currentShareWeight = shareStartWeight + decay
        const currentAssetWeight = 1 - currentShareWeight

        const price = getPrice(
          parseFloat(currentShareReserve),
          currentShareWeight,
          parseFloat(currentAssetReserve),
          currentAssetWeight
        ).toFixed(PRICE_PRECISION)

        // only show future data points if the future price is less than the last trade price
        if (trades.length && price > lastPrice) {
          continue
        }

        bucketMap[i] = {
          bucketIndex: i,
          date: unixTimeToFormat({ time: time / 1000, format: 'MMM DD' }),
          dateWithTime: unixTimeToFormat({ time: time / 1000, format: 'MMM DD, HH:mm:ss' }),
          blockTimestamp: 0,
          price: price,
        }
      }
    }

    const endPrice = getPrice(
      parseFloat(currentShareReserve),
      shareEndWeight,
      parseFloat(currentAssetReserve),
      1 - shareEndWeight
    ).toFixed(PRICE_PRECISION)
    bucketMap[DATA_POINT_COUNT] = {
      bucketIndex: DATA_POINT_COUNT,
      date: unixTimeToFormat({ time: new Date(endDate || '').getTime() / 1000, format: 'MMM DD' }),
      dateWithTime: unixTimeToFormat({ time: new Date(endDate || '').getTime() / 1000, format: 'MMM DD, HH:mm:ss' }),
      blockTimestamp: 0,
      price: endPrice,
    }

    // Convert bucketMap object to array and sort by bucketIndex
    const result = Object.values(bucketMap).sort((a: any, b: any) => a.bucketIndex - b.bucketIndex)
    return result
  }, [
    subgraphData,
    startDate,
    getBucketIndex,
    startWeight,
    endWeight,
    currentShareReserve,
    currentAssetReserve,
    shareAmount,
    assetAmount,
    bucketSize,
  ])

  const progressPercentage = useMemo(() => {
    if (!getBucketIndex || !dataPoints || !dataPoints.length || !endDate) return 0
    const currentTime: any = new Date()
    const end: any = new Date(endDate)
    if (currentTime > end) {
      return 100
    }

    const bucketIndex = getBucketIndex(currentTime.getTime())
    let currentPointIndex = dataPoints.findIndex((point: any) => point.bucketIndex === bucketIndex)

    if (currentPointIndex === -1) {
      currentPointIndex = dataPoints.findIndex((point: any) => point.bucketIndex > bucketIndex)
    }

    const progressPercentage = ((currentPointIndex + 1) / dataPoints.length) * 100

    return progressPercentage
  }, [getBucketIndex, dataPoints, endDate])

  return (
    <ChartContainer>
      <AreaChart
        width={isMobile ? 290 : chartWidth ? chartWidth : 800}
        height={isMobile ? 300 : 400}
        data={dataPoints}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6666FF" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#6666FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="100%" y2="0">
            <stop offset="0%" stopColor="#AFAFCD" />
            <stop offset={`${progressPercentage}%`} stopColor="#AFAFCD" />
            <stop offset={`${progressPercentage}%`} stopColor="#6666FF" />
            <stop offset="100%" stopColor="#6666FF" />
          </linearGradient>
        </defs>
        <Tooltip content={<CustomTooltip />} labelFormatter={() => ''} /> {/* Disable default label */}
        {/* <Line type="monotone" dataKey="price" strokeWidth={2} stroke="url(#gradient)" dot={false} /> */}
        <XAxis dataKey="date" axisLine={false} tick={false} />
        <XAxis tick={{ fontSize: 14 }} xAxisId="1" dataKey="date" allowDuplicatedCategory={false} axisLine={false} />
        <YAxis tick={{ fontSize: 14 }} tickFormatter={(value) => `$${value}`} axisLine={false} />
        <Area
          type="monotone"
          dataKey="price"
          stroke="url(#gradient)"
          strokeWidth={2}
          // fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>

      <RightLegend>
        <WrapItem>
          <Circle style={{ background: '#BDBDDB' }}></Circle>
          <TextLegend>Historical Price</TextLegend>
        </WrapItem>

        <WrapItem style={{ marginLeft: 16 }}>
          <Circle style={{ background: '#6666FF' }}></Circle>
          <TextLegend>Future Price</TextLegend>
        </WrapItem>
      </RightLegend>
    </ChartContainer>
  )
}

const TextLegend = styled.div`
  color: #292933;
  font-size: 14px;
  font-weight: 500;

  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    font-size: 12px;
  }
`

const ChartContainer = styled.div`
  margin-top: 20px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  padding: 24px;
  margin-bottom: 30px;
  position: relative;

  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    width: 100%;
    padding: 16px;
  }
`

const RightLegend = styled.div`
  display: flex;
  position: absolute;
  right: 16px;
  top: 16px;
`

const Circle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 100%;
  margin-right: 5px;
`

const WrapItem = styled.div`
  display: flex;
  align-items: center;
`
