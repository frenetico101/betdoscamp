import React from 'react';
import { useBetContext } from '../context/BetContext';

/**
 * Componente responsável por gerar sugestões de boas práticas com base
 * nas métricas atuais. As recomendações são inspiradas em princípios
 * de gestão de bankroll e registro de apostas presentes em fontes
 * especializadas【80883013453490†L46-L64】【116213832699109†L80-L99】.
 */
export default function Suggestions() {
  const { metrics } = useBetContext();
  const { roi, winRate, betCount, totalProfit } = metrics;

  const suggestions = [];

  // Sugestão geral de registro
  suggestions.push(
    'Mantenha um registro detalhado de cada aposta com data, esporte, tipo, odds, stake, resultado e lucro/perda para analisar padrões【80883013453490†L106-L171】.'
  );
  // Sugestão de gerenciamento de banca
  suggestions.push(
    'Defina um bankroll separado do seu dinheiro de uso diário e utilize uma unidade fixa (no nosso caso R$5) que represente cerca de 1–3% da banca【116213832699109†L80-L99】.'
  );
  // Sugestão para evitar chasing
  suggestions.push(
    'Evite “chasing”: se tiver prejuízo no dia, não aumente as apostas para recuperar. Aceite a perda e retome no dia seguinte【116213832699109†L104-L118】.'
  );
  // Sugestões baseadas no ROI
  if (betCount > 0) {
    if (roi < 0) {
      suggestions.push(
        'Seu ROI está negativo. Reveja suas estratégias, identifique quais tipos de apostas têm trazido prejuízo e concentre-se nas que apresentam melhor desempenho【80883013453490†L60-L68】.'
      );
    } else if (roi >= 0 && roi < 0.1) {
      suggestions.push(
        'Seu ROI é positivo, mas modesto. Continue registrando cada aposta e procurando valor nas linhas, mantendo disciplina no tamanho das unidades.'
      );
    } else {
      suggestions.push(
        'Parabéns! Seu ROI é alto. Mantenha a estratégia e considere aumentar gradualmente a banca ou a unidade quando a banca crescer, sempre respeitando o limite de 1–3%【116213832699109†L121-L139】.'
      );
    }
  }
  // Sugestões baseadas na taxa de vitórias
  if (betCount >= 10) {
    if (winRate < 0.5) {
      suggestions.push(
        'Sua taxa de vitórias está abaixo de 50%. Analise categorias de apostas (esporte, tipo) para identificar onde tem melhor desempenho e ajuste suas escolhas【80883013453490†L60-L68】.'
      );
    } else {
      suggestions.push(
        'Boa taxa de vitórias! Continue focado nos tipos de apostas que mais geram lucro.'
      );
    }
  }

  return (
    <section>
      <h2>Sugestões</h2>
      <ul>
        {suggestions.map((text, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}