import React, { FC } from 'react';

const Withdraw: FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Withdraw from Pool</h1>
      <p>Submit your withdrawal details below:</p>
      <form>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="withdraw-amount">Amount:</label>
          <input
            type="number"
            id="withdraw-amount"
            name="amount"
            placeholder="Enter amount"
            style={{ marginLeft: '10px' }}
          />
        </div>
        <button type="submit">Withdraw</button>
      </form>
    </div>
  );
};

export default Withdraw;