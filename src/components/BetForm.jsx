import React, { useState } from 'react';
import { useBetContext } from '../context/BetContext';

/**
 * Formulário para cadastro de nova aposta.
 * A aposta utiliza stake fixo de R$5, então apenas data, descrição,
 * resultado e valor de retorno são solicitados.
 */
export default function BetForm() {
  const { addBet } = useBetContext();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today,
    description: '',
    outcome: 'win',
    returnAmount: 10, // valor retornado incluindo stake; default 10 = ganho 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // parse returnAmount to float
    const returnAmount = parseFloat(form.returnAmount);
    if (Number.isNaN(returnAmount)) {
      alert('Insira um valor válido para retorno.');
      return;
    }
    addBet({
      date: form.date,
      description: form.description,
      outcome: form.outcome,
      returnAmount,
    });
    // reset form
    setForm({ date: today, description: '', outcome: 'win', returnAmount: 10 });
  };

  return (
    <section>
      <h2>Registrar nova aposta</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="date">Data</label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <label htmlFor="description">Descrição</label>
          <input
            type="text"
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="ex. Jogo ABC vs DEF"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="outcome">Resultado</label>
          <select id="outcome" name="outcome" value={form.outcome} onChange={handleChange}>
            <option value="win">Ganho</option>
            <option value="loss">Perda</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="returnAmount">Valor de retorno (R$)</label>
          <input
            type="number"
            id="returnAmount"
            name="returnAmount"
            value={form.returnAmount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>
        <button type="submit" style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem' }}>
          Adicionar
        </button>
      </form>
    </section>
  );
}