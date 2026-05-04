import React, { createContext, useContext, useEffect, useState } from 'react';
import { parseISO, format } from 'date-fns';

/**
 * Contexto de apostas
 *
 * Este contexto armazena as apostas realizadas e fornece funções para
 * adicionar nova aposta, remover e calcular métricas. Os dados são
 * persistidos em localStorage para que o usuário não perca o histórico
 * ao recarregar a página.
 */
const BetContext = createContext();

export const useBetContext = () => useContext(BetContext);

export function BetProvider({ children }) {
  // Carrega apostas do localStorage ou inicializa vazio
  const [bets, setBets] = useState(() => {
    const stored = localStorage.getItem('bets');
    return stored ? JSON.parse(stored) : [];
  });

  // Persiste apostas toda vez que mudarem
  useEffect(() => {
    localStorage.setItem('bets', JSON.stringify(bets));
  }, [bets]);

  /**
   * Adiciona uma nova aposta
   * @param {Object} bet Dados da aposta
   *  - date: string (yyyy-mm-dd)
   *  - description: string
   *  - outcome: 'win' | 'loss'
   *  - returnAmount: number (valor de retorno em reais, para lucro/perda)
   */
  const addBet = (bet) => {
    setBets((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...bet,
        stake: 5, // aposta fixa de R$5 por estratégia
      },
    ]);
  };

  /**
   * Remove aposta pelo id
   * @param {number} id
   */
  const removeBet = (id) => {
    setBets((prev) => prev.filter((b) => b.id !== id));
  };

  /**
   * Calcula métricas globais: total apostado, retorno total, lucro líquido,
   * ROI e porcentagem de vitórias.
   */
  const metrics = React.useMemo(() => {
    const totalStake = bets.reduce((sum, b) => sum + b.stake, 0);
    const totalReturn = bets.reduce((sum, b) => sum + (b.returnAmount || 0), 0);
    const totalProfit = totalReturn - totalStake;
    const betCount = bets.length;
    const winCount = bets.filter((b) => b.outcome === 'win').length;
    const winRate = betCount > 0 ? winCount / betCount : 0;
    const roi = totalStake > 0 ? totalProfit / totalStake : 0;
    return { totalStake, totalReturn, totalProfit, betCount, winCount, winRate, roi };
  }, [bets]);

  /**
   * Agrupa lucros por dia. Retorna um mapa {dateString: lucroLiquido}
   */
  const dailyProfit = React.useMemo(() => {
    const map = {};
    bets.forEach((b) => {
      const dateKey = b.date;
      const profit = (b.returnAmount || 0) - b.stake;
      map[dateKey] = (map[dateKey] || 0) + profit;
    });
    return map;
  }, [bets]);

  return (
    <BetContext.Provider value={{ bets, addBet, removeBet, metrics, dailyProfit }}>
      {children}
    </BetContext.Provider>
  );
}