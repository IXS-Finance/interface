import React from 'react'

interface AddLiquidityCardProps {
  title?: string
}

const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ title = 'Add Liquidity' }) => {
  return (
    <div className="add-liquidity-card">
      <h2>{title}</h2>
      <form>
        <div>
          <label htmlFor="tokenA">Token A:</label>
          <input type="text" id="tokenA" name="tokenA" placeholder="Enter token A" />
        </div>
        <div>
          <label htmlFor="tokenB">Token B:</label>
          <input type="text" id="tokenB" name="tokenB" placeholder="Enter token B" />
        </div>
        <button type="submit">Add Liquidity</button>
      </form>
    </div>
  )
}

export default AddLiquidityCard
