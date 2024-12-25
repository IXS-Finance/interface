import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Flex, Text } from 'rebass'
import InfoIcon from 'assets/images/dex-v2/info.svg'

ChartJS.register(ArcElement, Tooltip, Legend)

interface PoolSummaryProps {}

const PoolSummary: React.FC<PoolSummaryProps> = () => {
  let data = [
    {
      label: 'SFP',
      value: 55,
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

  const options: any = {
    plugins: {
      responsive: true,
    },
    cutout: data.map((item) => item.cutout),
  }

  const finalData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => Math.round(item.value)),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 1,
        dataVisibility: new Array(data.length).fill(true),
      },
    ],
  }

  return (
    <div>
      <div>
        <Doughnut data={finalData} options={options} />

        <Flex flexDirection="column" justifyContent="space-between" alignItems="center" width="100%" my={32}>
          <Flex alignItems="center" style={{ gap: 6 }} mb="6px">
            <Text fontSize={14} color="#B8B8D2">
              In your wallet
            </Text>
            <img src={InfoIcon} alt="info" />
          </Flex>

          <Text fontSize={20} color="rgba(41, 41, 51, 0.90)" fontWeight={600}>
            $38,600.90
          </Text>
        </Flex>
      </div>
    </div>
  )
}

export default PoolSummary
