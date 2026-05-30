import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MapaInterativo from './pages/MapaInterativo';
import Ocorrencias from './pages/Ocorrencias';
import Fiscalizacao from './pages/Fiscalizacao';
import Sobre from './pages/Sobre';

export default function App() {
  const [paginaAtiva, setPaginaAtiva] = useState('dashboard');

  const renderPagina = () => {
    switch (paginaAtiva) {
      case 'dashboard':
        return <Dashboard />;
      case 'mapa':
        return <MapaInterativo />;
      case 'ocorrencias':
        return <Ocorrencias />;
      case 'fiscalizacao':
        return <Fiscalizacao />;
      case 'sobre':
        return <Sobre />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Decorative premium glows in background */}
      <div className="bg-glow bg-glow-right" />
      <div className="bg-glow bg-glow-left" />

      {/* Navigation Sidebar */}
      <Sidebar paginaAtiva={paginaAtiva} setPaginaAtiva={setPaginaAtiva} />

      {/* Main Content Area */}
      <main className="main-content">
        {renderPagina()}
      </main>
    </div>
  );
}
