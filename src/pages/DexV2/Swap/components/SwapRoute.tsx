import React from 'react';

interface SwapRouteProps {
  fromToken: string;
  toToken: string;
  route: string[];
}

const SwapRoute: React.FC<SwapRouteProps> = ({ fromToken, toToken, route }) => {
  return (
    <div>
      <h3>Swap Route</h3>
      <p>From: {fromToken}</p>
      <p>To: {toToken}</p>
      <ul>
        {route.map((token, index) => (
          <li key={index}>{token}</li>
        ))}
      </ul>
    </div>
  );
};

export default SwapRoute;