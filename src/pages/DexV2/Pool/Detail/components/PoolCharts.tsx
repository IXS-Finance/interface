import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

import { Pool } from 'services/pool/types'
import useNumbers from 'hooks/dex-v2/useNumbers'
import dayjs from 'dayjs'
import { Box } from 'rebass'
import usePoolSnapshotsQuery from 'hooks/dex-v2/queries/usePoolSnapshotsQuery'

interface PoolChartProps {
  pool: Pool
}

export const getDefaultPoolChartOptions = (currencyFormatter: any) => {
  // Light mode tooltip styles (static)
  const toolTipTheme = {
    heading: 'font-weight: bold; color: #000',
    container: 'background: #fff;',
    text: '#333',
  }

  return {
    grid: {
      left: '1.5%',
      right: '2.5%',
      top: '7.5%',
      bottom: '0',
      containLabel: true,
    },
    xAxis: {
      show: true,
      type: 'time',
      minorSplitLine: { show: false },
      axisTick: { show: false },
      splitNumber: 3,
      axisLabel: {
        formatter: (value: number) => {
          return dayjs(new Date(value * 1000)).format('MMM D')
        },
        color: '#333',
        opacity: 0.5,
        interval: 0,
        showMaxLabel: false,
        showMinLabel: false,
      },
      axisPointer: {
        type: 'line',
        label: {
          formatter: (params: any) => {
            return dayjs(new Date(params.value * 1000)).format('MMM D')
          },
        },
      },
      axisLine: { show: false },
      splitArea: {
        show: false,
        areaStyle: {
          color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
        },
      },
    },
    yAxis: {
      show: true,
      type: 'value',
      axisLine: { show: false },
      minorSplitLine: { show: false },
      splitLine: { show: false },
      splitNumber: 3,
      axisLabel: {
        formatter: (value: number) => currencyFormatter(value),
        color: '#333',
        opacity: 0.5,
        interval: 'auto',
        showMaxLabel: false,
        showMinLabel: false,
      },
    },
    tooltip: {
      show: true,
      showContent: true,
      trigger: 'axis',
      confine: true,
      axisPointer: {
        animation: false,
        type: 'shadow',
        label: {
          show: false,
        },
      },
      extraCssText: `padding-right:2rem;border: none;${toolTipTheme.container}`,
      formatter: (params: any) => {
        const data = Array.isArray(params) ? params[0] : params
        return `
          <div style="padding: none; display: flex; flex-direction: column; justify-content: center; ${
            toolTipTheme.container
          }">
            <div style="font-size: 0.85rem; font-weight: 500; color: ${toolTipTheme.text};">
              ${dayjs(new Date(data.value[0] * 1000)).format('MMM D')}
            </div>
            <div style="font-size: 14px; font-weight: 500; color: ${toolTipTheme.text};">
              ${currencyFormatter(data.value[1])}
            </div>
          </div>
        `
      },
    },
  }
}

const PoolCharts: React.FC<PoolChartProps> = ({ pool }) => {
  const { fNum } = useNumbers()
  const { data: snapshotValues } = usePoolSnapshotsQuery(pool.id, 30)

  const defaultChartOptions = getDefaultPoolChartOptions(fNum)
  const processedChartData = Object.keys(snapshotValues || {}).map((date: string) => [
    +date / 1000,
    snapshotValues[+date].swapVolume,
  ])

  const options = useMemo(() => {
    const activeTabOptions = {
      type: 'bar',
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: '#87CEFA',
          },
          {
            offset: 1,
            color: '#4682B4',
          },
        ],
      },
      hoverColor: '#FF69B4',
      hoverBorderColor: '#FF4500',
      areaStyle: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: '#87CEFA',
          },
          {
            offset: 1,
            color: '#4682B4',
          },
        ],
      },
    }

    return {
      ...defaultChartOptions,
      series: [
        {
          type: activeTabOptions.type,
          data: processedChartData,
          barWidth: 10, // Adjust this value to reduce/increase bar width
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: activeTabOptions.color,
            borderRadius: 100,
          },
          emphasis: {
            itemStyle: {
              color: activeTabOptions.hoverColor,
              borderColor: activeTabOptions.hoverBorderColor,
            },
          },
          areaStyle: activeTabOptions.areaStyle,
          animationEasing: function (k: number) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
          },
        },
      ],
    }
  }, [defaultChartOptions, processedChartData])

  return (
    <Box height={['300px', '400px', 'full']}>
      <ReactECharts
        // onEvents={{ updateAxisPointer: handleAxisMoved }}
        option={options}
        style={{ height: '100%', width: '100%' }}
      />
    </Box>
  )
}

export default PoolCharts
