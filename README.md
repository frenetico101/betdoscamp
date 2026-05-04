# BET dos Campeões — Super App

Dashboard premium em React para controle de banca de apostas com estratégia R$5, foco em disciplina, métricas e visual profissional.

## O que mudou nesta versão

A versão anterior estava simples demais, com formulário básico e gráficos vazios. Esta versão foi refeita com cara de super app:

- Dashboard com sidebar, hero premium, cards de KPI e visual glassmorphism.
- Dados de demonstração premium para o app abrir bonito logo na primeira execução.
- Registro de aposta com esporte, mercado, evento, seleção, odd, stake, status, confiança e notas.
- Cálculo automático de lucro, retorno, ROI, taxa de acerto, banca atual, exposição mensal e drawdown.
- Gráficos próprios em SVG/CSS, sem Chart.js, para evitar tela branca por dependência ou registro de módulos.
- Mapa de resultados em donut, evolução da banca, barras diárias, breakdown por esporte/mercado e heatmap de calendário.
- Motor de sugestões automáticas com alertas de limite mensal, ROI, unidade de banca, apostas abertas e confiança.
- Filtros, busca, edição rápida de status, duplicar/excluir aposta.
- Exportação CSV, backup JSON e importação de backup.
- Persistência no localStorage.
- Tema claro/escuro.
- Configuração pronta para deploy na Vercel via Vite.

## Como executar localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

A pasta de saída é `dist`, já configurada no `vercel.json`.

## Observação importante

Este projeto é apenas um sistema de acompanhamento e gestão pessoal de banca. Ele não realiza apostas, não processa pagamentos e não garante lucro. Use limites, disciplina e responsabilidade.
