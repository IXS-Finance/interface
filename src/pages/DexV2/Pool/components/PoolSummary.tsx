import React from 'react'

interface PoolSummaryProps {
  poolName: string
  totalLiquidity: number
  apr: number
  volume24h: number
}

const PoolSummary: React.FC<PoolSummaryProps> = ({ poolName, totalLiquidity, apr, volume24h }) => {
  return <div>Pool Summary</div>
}

export default PoolSummary
