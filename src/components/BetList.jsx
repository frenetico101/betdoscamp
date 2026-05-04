import React from 'react';
import { useBetContext } from '../context/BetContext';

/**
 * Lista de apostas registradas em uma tabela.
 */
export default function BetList() {
  const { bets, removeBet } = useBetContext();

  if (bets.length === 0) {
    return <p>Nenhuma aposta registrada.</p>;
  }

  return (
    <section>
      <h2>Histórico de Apostas</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Stake (R$)</th>
            <th>Retorno (R$)</th>
            <th>Lucro (R$)</th>
            <th>Resultado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bets.map((bet) => {
            const profit = (bet.returnAmount || 0) - bet.stake;
            return (
              <tr key={bet.id}>
                <td>{bet.date}</td>
                <td>{bet.description}</td>
                <td>{bet.stake.toFixed(2)}</td>
                <td>{bet.returnAmount.toFixed(2)}</td>
                <td style={{ color: profit >= 0 ? 'green' : 'red' }}>{profit.toFixed(2)}</td>
                <td>{bet.outcome === 'win' ? 'Ganho' : 'Perda'}</td>
                <td>
                  <button onClick={() => removeBet(bet.id)}>Excluir</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}