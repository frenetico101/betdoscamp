# BET dos Campeões

**BET dos Campeões** é um sistema de controle de banca para apostas esportivas com stake fixa de **R$5**. Inspirado por práticas de gestão financeira e bankroll management, o objetivo é oferecer uma visão clara dos resultados e auxiliar na disciplina do apostador.

## Funcionalidades

- Cadastro de apostas com data, descrição, resultado (ganho/perda) e valor de retorno. O stake é fixado em R$5 por aposta.
- Persistência automática dos dados no `localStorage` do navegador.
- Resumo geral com total apostado, retorno total, lucro líquido, contagem de vitórias, taxa de vitórias e ROI (retorno sobre investimento).
- Gráficos interativos (linha, barra e pizza) utilizando **Chart.js** via `react-chartjs-2`:
  - Lucro diário em linha;
  - Lucro mensal em barras, destacando meses positivos e negativos;
  - Distribuição de vitórias e derrotas em gráfico de pizza.
- Histórico de apostas em formato tabular, com possibilidade de exclusão individual.
- Geração de sugestões de boas práticas com base em métricas financeiras e princípios de bankroll management: controle de stake, evitar “chasing”, registro detalhado e análise de ROI.

## Referências e boas práticas

O projeto utiliza conceitos consagrados de gestão financeira e apostas:

- **Dashboard financeiro:** Dividir a construção do dashboard em etapas (layout, componentes de visualização e customização) ajuda a organizar a aplicação【816845141439058†screenshot】. O uso de bibliotecas de gráficos em React deve considerar tree‑shaking, lazy loading e técnicas de desempenho【599463627541566†L607-L658】.
- **Métricas financeiras:** Acompanhar métricas como margem de lucro (Gross/Net), retorno sobre investimento (ROI) e lucro líquido permite avaliar a eficiência e a rentabilidade das apostas【578160918994050†screenshot】.
- **Registro detalhado:** Anotar data, esporte, tipo de aposta, odds, stake, resultado e lucro/perda é essencial para identificar padrões e “vazamentos” na estratégia【80883013453490†L106-L171】.
- **Gestão de banca e unidades:** Separar um bankroll dedicado e apostar sempre uma fração fixa da banca (1–3%) protege contra variações e evita a falência. Uma unidade de R$5 representa de 1% a 3% de um bankroll moderado【116213832699109†L80-L99】.
- **Evitar chasing:** Aumentar o valor das apostas para recuperar perdas (“chasing”) é um dos maiores erros; aceitar o prejuízo e voltar no dia seguinte preserva a banca【116213832699109†L104-L118】.

## Como executar

O projeto é baseado em Create React App. Para rodar localmente:

```bash
npm install
npm start
```

Isso iniciará a aplicação em modo de desenvolvimento. Acesse `http://localhost:3000` no navegador para utilizar o controle de apostas.

Para construir a versão de produção, execute `npm run build`.