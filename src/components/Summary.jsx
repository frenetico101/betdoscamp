import React from 'react';
import { useBetContext } from '../context/BetContext';

/**
 * Componente que exibe um resumo geral das apostas.
 */
export default function Summary() {
  const { metrics } = useBetContext();
  const { totalStake, totalReturn, totalProfit, betCount, winCount, winRate, roi } =
    metrics;

  return (
    <section>
      <h2>Resumo Geral</h2>
      <p>
        Total apostado: <strong>R${totalStake.toFixed(2)}</strong> | Retorno total:{' '}
        <strong>R${totalReturn.toFixed(2)}</strong> | Lucro líquido:{' '}
        <strong style={{ color: totalProfit >= 0 ? 'green' : 'red' }}>
          R${totalProfit.toFixed(2)}
        </strong>
      </p>
      <p>
        Apostas: <strong>{winCount}</strong> vitórias de <strong>{betCount}</strong> total |
        Taxa de vitórias: <strong>{(winRate * 100).toFixed(2)}%</strong> |
        ROI: <strong>{(roi * 100).toFixed(2)}%</strong>
      </p>
    </section>
  );
}