import React from 'react';
import { BetProvider } from './context/BetContext';
import BetForm from './components/BetForm';
import BetList from './components/BetList';
import Summary from './components/Summary';
import Charts from './components/Charts';
import Suggestions from './components/Suggestions';

function App() {
  return (
    <BetProvider>
      <main>
        <h1>BET dos Campeões</h1>
        <p>
          Sistema de controle de banca robusto para apostas fixas de R$5. Registre
          suas apostas, acompanhe ganhos, prejuízos e receba sugestões baseadas em
          métricas financeiras.
        </p>
        <BetForm />
        <Summary />
        <Charts />
        <Suggestions />
        <BetList />
      </main>
    </BetProvider>
  );
}

export default App;