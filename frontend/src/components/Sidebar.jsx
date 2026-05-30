import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  ClipboardCheck, 
  Activity
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function Sidebar({ paginaAtiva, setPaginaAtiva }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'mapa', label: 'Mapa', icon: Map },
    { id: 'ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
    { id: 'fiscalizacao', label: 'Fiscal', icon: ClipboardCheck },
  ];

  // Mobile Bottom Navigation Bar View
  if (isMobile) {
    return (
      <aside style={styles.mobileBar}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = paginaAtiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPaginaAtiva(item.id)}
              style={{
                ...styles.mobileBtn,
                color: isActive ? '#10b981' : '#94a3b8',
              }}
            >
              <Icon 
                size={20} 
                style={{ 
                  color: isActive ? '#10b981' : '#94a3b8',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }} 
              />
              <span style={{ 
                ...styles.mobileBtnLabel, 
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#10b981' : '#64748b'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </aside>
    );
  }

  // Desktop Standard Sidebar View
  return (
    <aside style={styles.sidebar}>
      {/* Header Logo */}
      <div style={styles.logoContainer}>
        <button 
          onClick={() => setPaginaAtiva('dashboard')} 
          style={styles.logoButton}
          className="logo-btn-interactive"
          title="Ir para Visão Geral"
        >
          <img src={logo} alt="Caminho Seguro Logo" style={styles.logoImage} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = paginaAtiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPaginaAtiva(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {}),
              }}
              className="nav-btn-interactive"
            >
              <Icon 
                size={20} 
                style={{
                  marginRight: '12px',
                  color: isActive ? '#10b981' : '#94a3b8',
                  transition: 'color 0.2s ease'
                }} 
              />
              <span style={{ fontWeight: isActive ? '600' : '400' }}>
                {item.id === 'dashboard' ? 'Visão Geral' : item.id === 'mapa' ? 'Mapa de Calçadas' : item.id === 'fiscalizacao' ? 'Área do Fiscal' : item.label}
              </span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={styles.footer}>
        <div style={styles.odsContainer}>
          <div style={styles.odsBadge}>ODS 11</div>
          <div style={styles.odsBadgeSec}>ODS 10</div>
        </div>
        <p style={styles.footerText}>Banco de Dados II</p>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#0a0d14',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 10,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    padding: '0 8px',
    width: '100%',
  },
  logoButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    outline: 'none',
  },
  logoImage: {
    width: '100%',
    maxHeight: '105px',
    objectFit: 'contain',
    display: 'block',
    transition: 'transform 0.2s ease',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    width: '100%',
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Inter', sans-serif",
  },
  navButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    color: '#f8fafc',
    border: '1px solid rgba(16, 185, 129, 0.15)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    height: '50%',
    width: '3px',
    backgroundColor: '#10b981',
    borderRadius: '0 4px 4px 0',
  },
  footer: {
    marginTop: 'auto',
    padding: '16px 8px 0 8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  odsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  },
  odsBadge: {
    backgroundColor: '#da291c', // Cor oficial ODS 11
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  odsBadgeSec: {
    backgroundColor: '#e5243b', // Cor oficial ODS 10
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  footerText: {
    fontSize: '12px',
    color: '#64748b',
  },

  // Mobile Bottom Bar Navigation System
  mobileBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '72px',
    backgroundColor: '#0a0d14ef', // Transparente leve
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 99,
    padding: '0 12px 10px 12px', // Altura extra no final para evitar gestos do iOS
  },
  mobileBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    flex: 1,
    height: '100%',
    gap: '4px',
  },
  mobileBtnLabel: {
    fontSize: '10px',
    fontFamily: "'Inter', sans-serif",
    transition: 'color 0.2s ease',
  }
};
