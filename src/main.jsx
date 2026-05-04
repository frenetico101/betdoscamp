import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORAGE_KEY = 'bet-dos-campeoes-superapp-v2';
const SETTINGS_KEY = 'bet-dos-campeoes-superapp-settings-v2';

const defaultSettings = {
  initialBankroll: 250,
  unitValue: 5,
  monthlyBudget: 5,
  dailyStopLoss: 10,
  stopWin: 15,
  targetRoi: 12,
  riskMode: 'Conservador',
};

const seedBets = [
  { id: 101, date: '2026-04-06', sport: 'Futebol', market: 'Resultado', event: 'Lions FC x Aurora', selection: 'Lions FC', odds: 1.86, stake: 5, status: 'green', confidence: 7, note: 'Favorito em casa, boa leitura pré-jogo.' },
  { id: 102, date: '2026-04-09', sport: 'Basquete', market: 'Total pontos', event: 'Titans x Wolves', selection: 'Over 188.5', odds: 1.92, stake: 5, status: 'red', confidence: 6, note: 'Ritmo caiu no último quarto.' },
  { id: 103, date: '2026-04-12', sport: 'Tênis', market: 'Moneyline', event: 'M. Costa x H. Lima', selection: 'M. Costa', odds: 2.1, stake: 5, status: 'green', confidence: 8, note: 'Entrou bem no 2º set.' },
  { id: 104, date: '2026-04-14', sport: 'Futebol', market: 'Ambas marcam', event: 'River Azul x União', selection: 'Sim', odds: 1.74, stake: 5, status: 'green', confidence: 6, note: 'Mercado com bom volume.' },
  { id: 105, date: '2026-04-16', sport: 'Vôlei', market: 'Handicap', event: 'Praia Norte x Sul', selection: '+1.5 sets', odds: 1.8, stake: 5, status: 'void', confidence: 5, note: 'Aposta anulada.' },
  { id: 106, date: '2026-04-19', sport: 'Futebol', market: 'Escanteios', event: 'Capital x Interior', selection: 'Over 8.5', odds: 1.97, stake: 5, status: 'red', confidence: 7, note: 'Jogo travado e poucas laterais.' },
  { id: 107, date: '2026-04-22', sport: 'Basquete', market: 'Spread', event: 'Rockets x Comets', selection: 'Comets +4.5', odds: 1.88, stake: 5, status: 'green', confidence: 8, note: 'Excelente fechamento de linha.' },
  { id: 108, date: '2026-04-25', sport: 'Futebol', market: 'Dupla chance', event: 'Nacional x Real Porto', selection: 'Nacional ou empate', odds: 1.55, stake: 5, status: 'green', confidence: 7, note: 'Gestão conservadora.' },
  { id: 109, date: '2026-04-27', sport: 'Tênis', market: 'Total games', event: 'A. Teixeira x B. Prado', selection: 'Under 22.5', odds: 1.83, stake: 5, status: 'red', confidence: 5, note: 'Tie-break quebrou a projeção.' },
  { id: 110, date: '2026-05-01', sport: 'Futebol', market: 'Resultado', event: 'Campeões x Estrela', selection: 'Campeões', odds: 1.91, stake: 5, status: 'green', confidence: 9, note: 'Aposta do mês da estratégia R$5.' },
  { id: 111, date: '2026-05-03', sport: 'Basquete', market: 'Jogador', event: 'Leste x Oeste', selection: 'Pontos jogador +18.5', odds: 2.05, stake: 5, status: 'open', confidence: 6, note: 'Pendente, acompanhar escalação.' },
];

const sports = ['Futebol', 'Basquete', 'Tênis', 'Vôlei', 'MMA', 'eSports', 'Outro'];
const markets = ['Resultado', 'Dupla chance', 'Ambas marcam', 'Escanteios', 'Total pontos', 'Spread', 'Handicap', 'Moneyline', 'Jogador', 'Total games', 'Outro'];
const statuses = {
  green: { label: 'Ganhou', cls: 'good', icon: '✓' },
  red: { label: 'Perdeu', cls: 'bad', icon: '×' },
  void: { label: 'Anulada', cls: 'neutral', icon: '↺' },
  open: { label: 'Aberta', cls: 'pending', icon: '•' },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function brl(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function pct(value, digits = 1) {
  return `${Number(value || 0).toFixed(digits)}%`;
}

function dateLabel(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function shortDate(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function calcProfit(bet) {
  const stake = Number(bet.stake || 0);
  const odds = Number(bet.odds || 0);
  if (bet.status === 'green') return stake * (odds - 1);
  if (bet.status === 'red') return -stake;
  return 0;
}

function withProfit(bet) {
  return { ...bet, profit: calcProfit(bet), returnAmount: bet.status === 'green' ? Number(bet.stake || 0) * Number(bet.odds || 0) : bet.status === 'void' ? Number(bet.stake || 0) : 0 };
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function downloadFile(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function computeMetrics(bets, settings) {
  const settled = bets.filter((b) => b.status !== 'open');
  const resolvedForRoi = bets.filter((b) => b.status === 'green' || b.status === 'red');
  const profit = settled.reduce((sum, b) => sum + calcProfit(b), 0);
  const stakeResolved = resolvedForRoi.reduce((sum, b) => sum + Number(b.stake || 0), 0);
  const stakeAll = bets.reduce((sum, b) => sum + Number(b.stake || 0), 0);
  const wins = bets.filter((b) => b.status === 'green').length;
  const losses = bets.filter((b) => b.status === 'red').length;
  const voids = bets.filter((b) => b.status === 'void').length;
  const open = bets.filter((b) => b.status === 'open').length;
  const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;
  const roi = stakeResolved > 0 ? (profit / stakeResolved) * 100 : 0;
  const bankroll = Number(settings.initialBankroll || 0) + profit;
  const unitPercent = bankroll > 0 ? (Number(settings.unitValue || 0) / bankroll) * 100 : 0;

  let running = Number(settings.initialBankroll || 0);
  let peak = running;
  let maxDrawdown = 0;
  const sorted = [...settled].sort((a, b) => a.date.localeCompare(b.date));
  const equity = [{ label: 'Início', value: running }];
  sorted.forEach((bet) => {
    running += calcProfit(bet);
    peak = Math.max(peak, running);
    maxDrawdown = Math.max(maxDrawdown, peak - running);
    equity.push({ label: shortDate(bet.date), value: running });
  });

  const currentMonth = monthKey();
  const monthBets = bets.filter((b) => b.date.slice(0, 7) === currentMonth);
  const monthStake = monthBets.reduce((sum, b) => sum + Number(b.stake || 0), 0);
  const monthProfit = monthBets.filter((b) => b.status !== 'open').reduce((sum, b) => sum + calcProfit(b), 0);
  const monthBudgetUsed = Number(settings.monthlyBudget || 0) > 0 ? Math.min(100, (monthStake / Number(settings.monthlyBudget || 1)) * 100) : 0;

  const today = todayISO();
  const todayProfit = bets.filter((b) => b.date === today && b.status !== 'open').reduce((sum, b) => sum + calcProfit(b), 0);
  const lastTen = [...settled].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const avgConfidence = bets.length ? bets.reduce((sum, b) => sum + Number(b.confidence || 0), 0) / bets.length : 0;

  return {
    totalBets: bets.length,
    settledCount: settled.length,
    wins,
    losses,
    voids,
    open,
    profit,
    stakeResolved,
    stakeAll,
    winRate,
    roi,
    bankroll,
    unitPercent,
    maxDrawdown,
    equity,
    monthStake,
    monthProfit,
    monthBudgetUsed,
    todayProfit,
    lastTen,
    avgConfidence,
  };
}

function groupBy(bets, key, settledOnly = true) {
  const source = settledOnly ? bets.filter((b) => b.status !== 'open') : bets;
  return source.reduce((acc, bet) => {
    const k = bet[key] || 'Outros';
    if (!acc[k]) acc[k] = { label: k, profit: 0, stake: 0, count: 0, wins: 0, losses: 0 };
    acc[k].profit += calcProfit(bet);
    acc[k].stake += Number(bet.stake || 0);
    acc[k].count += 1;
    if (bet.status === 'green') acc[k].wins += 1;
    if (bet.status === 'red') acc[k].losses += 1;
    return acc;
  }, {});
}

function dailySeries(bets) {
  const map = {};
  bets.filter((b) => b.status !== 'open').forEach((bet) => {
    map[bet.date] = (map[bet.date] || 0) + calcProfit(bet);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ label: shortDate(date), value, date }));
}

function App() {
  const [settings, setSettings] = useState(() => loadJson(SETTINGS_KEY, defaultSettings));
  const [bets, setBets] = useState(() => loadJson(STORAGE_KEY, seedBets).map(withProfit));
  const [filters, setFilters] = useState({ search: '', sport: 'Todos', status: 'Todos' });
  const [theme, setTheme] = useState('dark');
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const metrics = useMemo(() => computeMetrics(bets, settings), [bets, settings]);
  const filteredBets = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return [...bets]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .filter((bet) => (filters.sport === 'Todos' ? true : bet.sport === filters.sport))
      .filter((bet) => (filters.status === 'Todos' ? true : bet.status === filters.status))
      .filter((bet) => (q ? `${bet.event} ${bet.selection} ${bet.market} ${bet.note}`.toLowerCase().includes(q) : true));
  }, [bets, filters]);

  const handleAddBet = (newBet) => {
    setBets((prev) => [{ ...withProfit(newBet), id: Date.now() }, ...prev]);
  };

  const deleteBet = (id) => setBets((prev) => prev.filter((bet) => bet.id !== id));
  const duplicateBet = (bet) => setBets((prev) => [{ ...bet, id: Date.now(), date: todayISO(), status: 'open', profit: 0, returnAmount: 0 }, ...prev]);

  const updateStatus = (id, status) => {
    setBets((prev) => prev.map((bet) => (bet.id === id ? withProfit({ ...bet, status }) : bet)));
  };

  const exportCsv = () => {
    const header = ['data', 'esporte', 'mercado', 'evento', 'seleção', 'odd', 'stake', 'status', 'retorno', 'lucro', 'confiança', 'nota'];
    const rows = bets.map((b) => [b.date, b.sport, b.market, b.event, b.selection, b.odds, b.stake, statuses[b.status]?.label || b.status, withProfit(b).returnAmount.toFixed(2), calcProfit(b).toFixed(2), b.confidence, b.note]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(';')).join('\n');
    downloadFile('bet-dos-campeoes-apostas.csv', csv, 'text/csv;charset=utf-8');
  };

  const exportJson = () => {
    downloadFile('bet-dos-campeoes-backup.json', JSON.stringify({ settings, bets }, null, 2), 'application/json;charset=utf-8');
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.bets)) setBets(data.bets.map(withProfit));
      if (data.settings) setSettings({ ...defaultSettings, ...data.settings });
    } catch {
      alert('Arquivo inválido. Envie um backup JSON exportado pelo próprio sistema.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="app-shell">
      <Sidebar metrics={metrics} theme={theme} setTheme={setTheme} />
      <main className="content">
        <Hero metrics={metrics} settings={settings} />
        <MetricGrid metrics={metrics} settings={settings} />
        <section className="workspace-grid">
          <StrategyPanel settings={settings} setSettings={setSettings} metrics={metrics} setBets={setBets} />
          <BetComposer settings={settings} metrics={metrics} onAdd={handleAddBet} />
        </section>
        <section className="chart-grid">
          <LineChart title="Evolução da banca" subtitle="Saldo acumulado após apostas liquidadas" data={metrics.equity} currency />
          <BarChart title="Resultado por dia" subtitle="Ganhos e perdas diários" data={dailySeries(bets)} />
          <DonutPanel metrics={metrics} />
        </section>
        <section className="intelligence-grid">
          <InsightEngine metrics={metrics} settings={settings} bets={bets} />
          <Breakdown bets={bets} />
          <CalendarHeatmap bets={bets} />
        </section>
        <BetTable
          bets={filteredBets}
          filters={filters}
          setFilters={setFilters}
          deleteBet={deleteBet}
          duplicateBet={duplicateBet}
          updateStatus={updateStatus}
          onExportCsv={exportCsv}
          onExportJson={exportJson}
          onImport={() => fileInputRef.current?.click()}
        />
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={importJson} />
        <footer className="footer-note">
          <strong>Uso responsável:</strong> o BET dos Campeões é um controle pessoal de banca e não realiza apostas, pagamentos ou recomendações garantidas. Use apenas valores que pode perder, respeite limites e mantenha disciplina.
        </footer>
      </main>
    </div>
  );
}

function Sidebar({ metrics, theme, setTheme }) {
  const nav = ['Dashboard', 'Banca', 'Apostas', 'Risco', 'Relatórios'];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">BC</div>
        <div>
          <strong>BET dos Campeões</strong>
          <span>Bankroll Command</span>
        </div>
      </div>
      <nav>
        {nav.map((item, index) => (
          <a key={item} className={index === 0 ? 'active' : ''} href={`#${item.toLowerCase()}`}>{item}</a>
        ))}
      </nav>
      <div className="side-card">
        <span className="eyebrow">Pulse da banca</span>
        <strong>{brl(metrics.bankroll)}</strong>
        <small className={metrics.profit >= 0 ? 'positive' : 'negative'}>{metrics.profit >= 0 ? '+' : ''}{brl(metrics.profit)} no histórico</small>
        <div className="mini-progress"><span style={{ width: `${Math.min(100, Math.max(0, metrics.monthBudgetUsed))}%` }} /></div>
        <small>{pct(metrics.monthBudgetUsed, 0)} do limite mensal usado</small>
      </div>
      <button className="ghost-button full" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo escuro'}
      </button>
    </aside>
  );
}

function Hero({ metrics, settings }) {
  const health = Math.max(0, Math.min(100, 65 + metrics.roi * 0.9 - metrics.unitPercent * 3 - (metrics.maxDrawdown / Math.max(1, settings.initialBankroll)) * 100));
  return (
    <section className="hero" id="dashboard">
      <div className="hero-copy">
        <div className="hero-pills">
          <span>🏆 Super App React</span>
          <span>Plano R$5/mês</span>
          <span>Dados salvos no navegador</span>
        </div>
        <h1>Controle sua banca como um campeão.</h1>
        <p>Dashboard premium para registrar apostas, medir retorno diário e geral, detectar risco, controlar limite mensal e transformar números em decisões.</p>
        <div className="hero-actions">
          <a href="#apostas" className="primary-button">Registrar aposta</a>
          <a href="#relatórios" className="ghost-button">Ver inteligência</a>
        </div>
      </div>
      <div className="hero-orb-card">
        <CircularScore value={health} label="Saúde" />
        <div>
          <span className="eyebrow">Estratégia ativa</span>
          <strong>{brl(settings.unitValue)} por entrada</strong>
          <small>Limite mensal: {brl(settings.monthlyBudget)} • Modo {settings.riskMode}</small>
        </div>
      </div>
    </section>
  );
}

function MetricGrid({ metrics, settings }) {
  const cards = [
    { title: 'Banca atual', value: brl(metrics.bankroll), delta: `${metrics.profit >= 0 ? '+' : ''}${brl(metrics.profit)} líquido`, tone: metrics.profit >= 0 ? 'good' : 'bad', icon: '💎' },
    { title: 'ROI geral', value: pct(metrics.roi), delta: `Meta ${pct(settings.targetRoi, 0)}`, tone: metrics.roi >= settings.targetRoi ? 'good' : metrics.roi >= 0 ? 'warn' : 'bad', icon: '📈' },
    { title: 'Taxa de acerto', value: pct(metrics.winRate), delta: `${metrics.wins} verdes • ${metrics.losses} reds`, tone: metrics.winRate >= 55 ? 'good' : metrics.winRate >= 45 ? 'warn' : 'bad', icon: '🎯' },
    { title: 'Exposição mensal', value: brl(metrics.monthStake), delta: `${pct(metrics.monthBudgetUsed, 0)} do limite`, tone: metrics.monthBudgetUsed <= 100 ? 'good' : 'bad', icon: '🛡️' },
    { title: 'Unidade da banca', value: pct(metrics.unitPercent, 2), delta: `${brl(settings.unitValue)} por aposta`, tone: metrics.unitPercent <= 3 ? 'good' : metrics.unitPercent <= 5 ? 'warn' : 'bad', icon: '⚖️' },
    { title: 'Drawdown máximo', value: brl(metrics.maxDrawdown), delta: 'Maior queda desde pico', tone: metrics.maxDrawdown <= settings.dailyStopLoss ? 'good' : 'warn', icon: '📉' },
  ];
  return <section className="metrics-grid">{cards.map((card) => <MetricCard key={card.title} {...card} />)}</section>;
}

function MetricCard({ title, value, delta, tone, icon }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{delta}</small>
    </article>
  );
}

function StrategyPanel({ settings, setSettings, metrics, setBets }) {
  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: key === 'riskMode' ? value : Number(value) }));
  return (
    <section className="card strategy-card" id="banca">
      <div className="section-heading">
        <span className="eyebrow">Central de estratégia</span>
        <h2>Regras da banca</h2>
        <p>Ajuste a banca inicial, unidade fixa, limite mensal e travas de proteção.</p>
      </div>
      <div className="settings-grid">
        <InputMoney label="Banca inicial" value={settings.initialBankroll} onChange={(v) => update('initialBankroll', v)} />
        <InputMoney label="Unidade fixa" value={settings.unitValue} onChange={(v) => update('unitValue', v)} />
        <InputMoney label="Limite mensal" value={settings.monthlyBudget} onChange={(v) => update('monthlyBudget', v)} />
        <InputMoney label="Stop loss diário" value={settings.dailyStopLoss} onChange={(v) => update('dailyStopLoss', v)} />
        <InputMoney label="Stop win" value={settings.stopWin} onChange={(v) => update('stopWin', v)} />
        <label className="field"><span>Meta ROI (%)</span><input type="number" value={settings.targetRoi} onChange={(e) => update('targetRoi', e.target.value)} /></label>
        <label className="field wide"><span>Modo de risco</span><select value={settings.riskMode} onChange={(e) => update('riskMode', e.target.value)}><option>Conservador</option><option>Balanceado</option><option>Arrojado</option></select></label>
      </div>
      <div className="risk-banner">
        <div><strong>{metrics.monthBudgetUsed > 100 ? 'Limite excedido' : 'Plano sob controle'}</strong><span>{metrics.monthBudgetUsed > 100 ? 'Pausar novas entradas até o próximo mês.' : 'A estratégia R$5 está sendo monitorada.'}</span></div>
        <span className={`status-dot ${metrics.monthBudgetUsed > 100 ? 'bad' : 'good'}`}></span>
      </div>
      <div className="button-row">
        <button className="ghost-button" onClick={() => setBets(seedBets.map(withProfit))}>Recarregar demo premium</button>
        <button className="danger-button" onClick={() => window.confirm('Deseja apagar todas as apostas?') && setBets([])}>Zerar apostas</button>
      </div>
    </section>
  );
}

function InputMoney({ label, value, onChange }) {
  return <label className="field"><span>{label}</span><input type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function BetComposer({ settings, metrics, onAdd }) {
  const [form, setForm] = useState({ date: todayISO(), sport: 'Futebol', market: 'Resultado', event: '', selection: '', odds: 1.85, stake: settings.unitValue, status: 'open', confidence: 7, note: '' });

  useEffect(() => {
    setForm((prev) => ({ ...prev, stake: settings.unitValue }));
  }, [settings.unitValue]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const preview = withProfit({ ...form, odds: Number(form.odds), stake: Number(form.stake) });
  const overBudget = metrics.monthStake + Number(form.stake || 0) > Number(settings.monthlyBudget || 0);

  const submit = (event) => {
    event.preventDefault();
    if (!form.event.trim() || !form.selection.trim()) {
      alert('Informe o evento e a seleção para registrar a aposta.');
      return;
    }
    onAdd({ ...form, odds: Number(form.odds), stake: Number(form.stake), confidence: Number(form.confidence) });
    setForm((prev) => ({ ...prev, event: '', selection: '', note: '', status: 'open', odds: 1.85, confidence: 7, date: todayISO() }));
  };

  return (
    <section className="card composer-card" id="apostas">
      <div className="section-heading compact">
        <span className="eyebrow">Nova entrada</span>
        <h2>Registrar aposta</h2>
        <p>Stake pré-configurada em {brl(settings.unitValue)} para manter disciplina.</p>
      </div>
      <form onSubmit={submit} className="composer-form">
        <label className="field"><span>Data</span><input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} /></label>
        <label className="field"><span>Esporte</span><select value={form.sport} onChange={(e) => update('sport', e.target.value)}>{sports.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="field"><span>Mercado</span><select value={form.market} onChange={(e) => update('market', e.target.value)}>{markets.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="field wide"><span>Evento</span><input placeholder="Ex.: Brasil x Argentina" value={form.event} onChange={(e) => update('event', e.target.value)} /></label>
        <label className="field wide"><span>Seleção</span><input placeholder="Ex.: Brasil vence" value={form.selection} onChange={(e) => update('selection', e.target.value)} /></label>
        <label className="field"><span>Odd decimal</span><input type="number" min="1.01" step="0.01" value={form.odds} onChange={(e) => update('odds', e.target.value)} /></label>
        <label className="field"><span>Stake</span><input type="number" min="0" step="0.01" value={form.stake} onChange={(e) => update('stake', e.target.value)} /></label>
        <label className="field"><span>Status</span><select value={form.status} onChange={(e) => update('status', e.target.value)}>{Object.entries(statuses).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}</select></label>
        <label className="field"><span>Confiança</span><input type="range" min="1" max="10" value={form.confidence} onChange={(e) => update('confidence', e.target.value)} /><b>{form.confidence}/10</b></label>
        <label className="field wide"><span>Notas</span><textarea placeholder="Motivo da entrada, leitura do jogo, emoções, fechamento de linha..." value={form.note} onChange={(e) => update('note', e.target.value)} /></label>
        <div className={`preview-box ${preview.profit >= 0 ? 'good' : 'bad'}`}>
          <span>Projeção</span><strong>{form.status === 'open' ? 'Pendente' : brl(preview.profit)}</strong><small>{form.status === 'green' ? `Retorno ${brl(preview.returnAmount)}` : form.status === 'red' ? `Perda ${brl(Math.abs(preview.profit))}` : 'Sem lucro/prejuízo'}</small>
        </div>
        <button className="primary-button submit" type="submit">Adicionar ao cockpit</button>
      </form>
      {overBudget && <div className="warning-line">⚠️ Esta entrada ultrapassa o limite mensal de {brl(settings.monthlyBudget)}. Avalie pausar.</div>}
    </section>
  );
}

function CircularScore({ value, label }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="circular-score" style={{ '--score': `${safe * 3.6}deg` }}>
      <div><strong>{Math.round(safe)}</strong><span>{label}</span></div>
    </div>
  );
}

function LineChart({ title, subtitle, data, currency }) {
  const width = 680;
  const height = 280;
  const pad = 34;
  const values = data.map((d) => Number(d.value || 0));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const spread = max - min || 1;
  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((Number(d.value || 0) - min) / spread) * (height - pad * 2);
    return { ...d, x, y };
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = points.length ? `${path} L${points[points.length - 1].x},${height - pad} L${points[0].x},${height - pad} Z` : '';

  return (
    <section className="card chart-card">
      <ChartHeader title={title} subtitle={subtitle} />
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label={title}>
        <defs><linearGradient id="lineArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="rgba(34,211,238,.42)" /><stop offset="100%" stopColor="rgba(34,211,238,0)" /></linearGradient></defs>
        {[0, 1, 2, 3].map((i) => <line key={i} x1={pad} x2={width - pad} y1={pad + i * ((height - pad * 2) / 3)} y2={pad + i * ((height - pad * 2) / 3)} className="grid-line" />)}
        {area && <path d={area} fill="url(#lineArea)" />}
        {path && <path d={path} className="line-path" />}
        {points.map((p, i) => <g key={`${p.label}-${i}`}><circle className="line-dot" cx={p.x} cy={p.y} r="4"><title>{p.label}: {currency ? brl(p.value) : p.value}</title></circle>{i % Math.ceil(points.length / 5 || 1) === 0 && <text x={p.x} y={height - 8} textAnchor="middle" className="axis-label">{p.label}</text>}</g>)}
        <text x={pad} y={23} className="axis-label">{currency ? brl(max) : max.toFixed(1)}</text>
        <text x={pad} y={height - pad + 18} className="axis-label">{currency ? brl(min) : min.toFixed(1)}</text>
      </svg>
    </section>
  );
}

function BarChart({ title, subtitle, data }) {
  const width = 680;
  const height = 280;
  const pad = 34;
  const maxAbs = Math.max(...data.map((d) => Math.abs(Number(d.value || 0))), 1);
  const zeroY = height / 2;
  const barW = (width - pad * 2) / Math.max(1, data.length) * 0.62;
  return (
    <section className="card chart-card">
      <ChartHeader title={title} subtitle={subtitle} />
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label={title}>
        <line x1={pad} x2={width - pad} y1={zeroY} y2={zeroY} className="zero-line" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={pad} x2={width - pad} y1={pad + i * ((height - pad * 2) / 3)} y2={pad + i * ((height - pad * 2) / 3)} className="grid-line" />)}
        {data.length === 0 && <text x={width / 2} y={height / 2} textAnchor="middle" className="empty-chart-text">Sem apostas liquidadas ainda</text>}
        {data.map((d, i) => {
          const value = Number(d.value || 0);
          const barH = Math.abs(value) / maxAbs * (height / 2 - pad - 10);
          const x = pad + i * ((width - pad * 2) / Math.max(1, data.length)) + 8;
          const y = value >= 0 ? zeroY - barH : zeroY;
          return <g key={`${d.label}-${i}`}><rect className={value >= 0 ? 'bar-good' : 'bar-bad'} x={x} y={y} width={barW} height={Math.max(2, barH)} rx="8"><title>{d.label}: {brl(value)}</title></rect>{i % Math.ceil(data.length / 6 || 1) === 0 && <text x={x + barW / 2} y={height - 8} textAnchor="middle" className="axis-label">{d.label}</text>}</g>;
        })}
      </svg>
    </section>
  );
}

function DonutPanel({ metrics }) {
  const total = Math.max(1, metrics.wins + metrics.losses + metrics.voids + metrics.open);
  const green = (metrics.wins / total) * 100;
  const red = (metrics.losses / total) * 100;
  const voids = (metrics.voids / total) * 100;
  const pending = (metrics.open / total) * 100;
  const style = { background: `conic-gradient(var(--good) 0 ${green}%, var(--bad) ${green}% ${green + red}%, var(--neutral) ${green + red}% ${green + red + voids}%, var(--warn) ${green + red + voids}% 100%)` };
  return (
    <section className="card chart-card donut-card">
      <ChartHeader title="Mapa de resultados" subtitle="Distribuição geral das entradas" />
      <div className="donut-wrap">
        <div className="donut" style={style}><div><strong>{metrics.totalBets}</strong><span>apostas</span></div></div>
        <div className="legend-list">
          <LegendRow color="good" label="Vitórias" value={metrics.wins} percent={green} />
          <LegendRow color="bad" label="Derrotas" value={metrics.losses} percent={red} />
          <LegendRow color="neutral" label="Anuladas" value={metrics.voids} percent={voids} />
          <LegendRow color="warn" label="Abertas" value={metrics.open} percent={pending} />
        </div>
      </div>
    </section>
  );
}

function LegendRow({ color, label, value, percent }) {
  return <div className="legend-row"><span className={`legend-dot ${color}`} /> <strong>{label}</strong><em>{value} • {pct(percent, 0)}</em></div>;
}

function ChartHeader({ title, subtitle }) {
  return <div className="chart-header"><div><h3>{title}</h3><p>{subtitle}</p></div><span className="live-chip">LIVE</span></div>;
}

function InsightEngine({ metrics, settings, bets }) {
  const insights = useMemo(() => {
    const list = [];
    if (metrics.monthBudgetUsed > 100) list.push({ tone: 'bad', title: 'Pausa recomendada', text: `O limite mensal de ${brl(settings.monthlyBudget)} foi ultrapassado. Evite novas entradas até o próximo ciclo.` });
    else list.push({ tone: 'good', title: 'Disciplina de limite', text: `Você usou ${pct(metrics.monthBudgetUsed, 0)} do orçamento mensal. Acompanhe antes de registrar nova aposta.` });
    if (metrics.unitPercent > 3) list.push({ tone: 'warn', title: 'Unidade acima do ideal', text: `A unidade representa ${pct(metrics.unitPercent, 2)} da banca. Para um perfil conservador, reduzir risco protege contra variância.` });
    if (metrics.roi < 0) list.push({ tone: 'bad', title: 'ROI negativo', text: 'Revise os mercados com prejuízo, reduza volume e evite recuperar perdas com apostas maiores.' });
    else if (metrics.roi >= settings.targetRoi) list.push({ tone: 'good', title: 'ROI acima da meta', text: `Resultado excelente: ${pct(metrics.roi)} contra meta de ${pct(settings.targetRoi, 0)}. Mantenha unidade fixa e registre motivos.` });
    if (metrics.open > 0) list.push({ tone: 'warn', title: 'Apostas abertas', text: `${metrics.open} aposta(s) ainda não foram liquidadas. Atualize o status para manter os relatórios corretos.` });
    const highConfidenceLosses = bets.filter((b) => b.status === 'red' && Number(b.confidence) >= 8).length;
    if (highConfidenceLosses) list.push({ tone: 'warn', title: 'Viés de confiança', text: `${highConfidenceLosses} red(s) tinham confiança alta. Use notas para entender se foi leitura, odd ou emoção.` });
    return list.slice(0, 5);
  }, [metrics, settings, bets]);
  return (
    <section className="card insight-card" id="relatórios">
      <div className="section-heading compact"><span className="eyebrow">Inteligência do campeão</span><h2>Sugestões automáticas</h2><p>Alertas calculados a partir do seu histórico e das regras de banca.</p></div>
      <div className="insight-list">{insights.map((item) => <article className={`insight ${item.tone}`} key={item.title}><span></span><div><strong>{item.title}</strong><p>{item.text}</p></div></article>)}</div>
    </section>
  );
}

function Breakdown({ bets }) {
  const sportData = Object.values(groupBy(bets, 'sport')).sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit)).slice(0, 5);
  const marketData = Object.values(groupBy(bets, 'market')).sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit)).slice(0, 5);
  return (
    <section className="card breakdown-card">
      <div className="section-heading compact"><span className="eyebrow">Raio-X</span><h2>Onde a banca performa</h2><p>Lucro por esporte e mercado.</p></div>
      <MiniBars title="Esportes" data={sportData} />
      <MiniBars title="Mercados" data={marketData} />
    </section>
  );
}

function MiniBars({ title, data }) {
  const max = Math.max(...data.map((d) => Math.abs(d.profit)), 1);
  return (
    <div className="mini-bars"><h3>{title}</h3>{data.length === 0 && <p className="muted">Sem dados.</p>}{data.map((row) => <div className="mini-bar-row" key={row.label}><div><strong>{row.label}</strong><small>{row.count} entradas • {row.wins}V/{row.losses}D</small></div><div className="bar-track"><span className={row.profit >= 0 ? 'good' : 'bad'} style={{ width: `${Math.max(6, (Math.abs(row.profit) / max) * 100)}%` }} /></div><em className={row.profit >= 0 ? 'positive' : 'negative'}>{brl(row.profit)}</em></div>)}</div>
  );
}

function CalendarHeatmap({ bets }) {
  const map = {};
  bets.filter((b) => b.status !== 'open').forEach((bet) => { map[bet.date] = (map[bet.date] || 0) + calcProfit(bet); });
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    const iso = d.toISOString().slice(0, 10);
    return { iso, value: map[iso] || 0 };
  });
  return (
    <section className="card heatmap-card">
      <div className="section-heading compact"><span className="eyebrow">Calendário</span><h2>Mapa de calor dos dias</h2><p>Verde para lucro, vermelho para prejuízo e neutro sem liquidação.</p></div>
      <div className="heatmap-grid">{days.map((day) => <span key={day.iso} className={day.value > 0 ? 'pos' : day.value < 0 ? 'neg' : ''} title={`${dateLabel(day.iso)} • ${brl(day.value)}`}></span>)}</div>
      <div className="heatmap-legend"><span>Menos</span><i></i><i className="pos"></i><i className="neg"></i><span>Mais impacto</span></div>
    </section>
  );
}

function BetTable({ bets, filters, setFilters, deleteBet, duplicateBet, updateStatus, onExportCsv, onExportJson, onImport }) {
  return (
    <section className="card table-card">
      <div className="table-toolbar">
        <div><span className="eyebrow">Histórico</span><h2>Livro de apostas</h2></div>
        <div className="toolbar-actions"><button className="ghost-button" onClick={onImport}>Importar JSON</button><button className="ghost-button" onClick={onExportJson}>Backup JSON</button><button className="primary-button" onClick={onExportCsv}>Exportar CSV</button></div>
      </div>
      <div className="filters-row">
        <input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Buscar evento, seleção, notas..." />
        <select value={filters.sport} onChange={(e) => setFilters((f) => ({ ...f, sport: e.target.value }))}><option>Todos</option>{sports.map((s) => <option key={s}>{s}</option>)}</select>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}><option>Todos</option>{Object.entries(statuses).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}</select>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Data</th><th>Evento</th><th>Mercado</th><th>Odd</th><th>Stake</th><th>Status</th><th>Lucro</th><th>Ações</th></tr></thead>
          <tbody>
            {bets.length === 0 && <tr><td colSpan="8" className="empty-row">Nenhuma aposta encontrada.</td></tr>}
            {bets.map((bet) => {
              const enriched = withProfit(bet);
              return (
                <tr key={bet.id}>
                  <td>{dateLabel(bet.date)}</td>
                  <td><div className="event-cell"><strong>{bet.event}</strong><span>{bet.sport} • {bet.selection}</span>{bet.note && <small>{bet.note}</small>}</div></td>
                  <td>{bet.market}</td>
                  <td>{Number(bet.odds).toFixed(2)}</td>
                  <td>{brl(bet.stake)}</td>
                  <td><select className={`status-select ${statuses[bet.status]?.cls}`} value={bet.status} onChange={(e) => updateStatus(bet.id, e.target.value)}>{Object.entries(statuses).map(([k, s]) => <option key={k} value={k}>{s.icon} {s.label}</option>)}</select></td>
                  <td className={enriched.profit >= 0 ? 'positive' : 'negative'}>{bet.status === 'open' ? '—' : brl(enriched.profit)}</td>
                  <td><div className="row-actions"><button onClick={() => duplicateBet(bet)}>Duplicar</button><button onClick={() => deleteBet(bet.id)}>Excluir</button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
