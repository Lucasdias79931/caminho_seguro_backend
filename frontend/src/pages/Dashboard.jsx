import React, { useEffect, useState } from 'react';
import { 
  OcorrenciaService, 
  BairroService 
} from '../services/api';
import { 
  AlertOctagon, 
  FileSearch, 
  CheckCircle2, 
  Accessibility, 
  TrendingUp, 
  MapPin, 
  Clock 
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    abertas: 0,
    emVistoria: 0,
    resolvidas: 0,
    indiceAcessibilidade: 0
  });
  
  const [bairrosStats, setBairrosStats] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        const [estGerais, estBairros, listaOcorrencias] = await Promise.all([
          OcorrenciaService.obterEstatisticasGerais(),
          BairroService.obterEstatisticas(),
          OcorrenciaService.listar()
        ]);
        
        setStats(estGerais);
        setBairrosStats(estBairros);
        setRecentes(listaOcorrencias.slice(0, 3));
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setCarregando(false);
      }
    }
    
    carregarDados();
  }, []);

  if (carregando) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Carregando dados da cidade...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Visão Geral da Cidade</h2>
          <p style={styles.subtitle}>Diagnósticos de mobilidade e acessibilidade em calçadas</p>
        </div>
        <div style={styles.badge}>
          <TrendingUp size={16} color="#10b981" style={{ marginRight: '6px' }} />
          <span>Monitoramento em Tempo Real</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.gridKpi}>
        {/* KPI 1 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total de Ocorrências</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertOctagon size={20} />
            </div>
          </div>
          <h3 style={styles.kpiValue}>{stats.total}</h3>
          <p style={{ ...styles.kpiFooter, color: '#ef4444' }}>Calçadas inadequadas</p>
        </div>

        {/* KPI 2 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Em Vistoria</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <FileSearch size={20} />
            </div>
          </div>
          <h3 style={styles.kpiValue}>{stats.emVistoria}</h3>
          <p style={{ ...styles.kpiFooter, color: '#f59e0b' }}>Aguardando laudo/reparos</p>
        </div>

        {/* KPI 3 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Resolvidas</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h3 style={styles.kpiValue}>{stats.resolvidas}</h3>
          <p style={{ ...styles.kpiFooter, color: '#10b981' }}>Zeladoria/Reparo concluído</p>
        </div>

        {/* KPI 4 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Índice de Acessibilidade</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Accessibility size={20} />
            </div>
          </div>
          <h3 style={styles.kpiValue}>{stats.indiceAcessibilidade}%</h3>
          <p style={{ ...styles.kpiFooter, color: '#3b82f6' }}>Média de calçadas seguras</p>
        </div>
      </div>

      {/* Main Grid: Neighborhoods & Recent incidents */}
      <div style={styles.mainGrid}>
        
        {/* Neighborhood status */}
        <div className="glass-card" style={{ flex: 1.3 }}>
          <h3 style={styles.sectionTitle}>Índice de Risco por Bairro</h3>
          <p style={styles.sectionDesc}>Mapeamento de concentração de barreiras de infraestrutura</p>
          
          <div style={styles.bairrosList}>
            {bairrosStats.map((item, index) => {
              const maxOcorrencias = Math.max(...bairrosStats.map(b => b.total), 1);
              const percentageWidth = (item.total / maxOcorrencias) * 100;
              return (
                <div key={index} style={styles.bairroItem}>
                  <div style={styles.bairroTextRow}>
                    <span style={styles.bairroName}>{item.bairro}</span>
                    <span style={styles.bairroCount}>
                      {item.total} {item.total === 1 ? 'problema' : 'problemas'}
                    </span>
                  </div>
                  {/* Custom CSS Bar Chart */}
                  <div style={styles.barContainer}>
                    <div 
                      style={{ 
                        ...styles.barFill, 
                        width: `${percentageWidth}%`,
                        backgroundColor: percentageWidth > 60 ? '#ef4444' : percentageWidth > 30 ? '#f59e0b' : '#10b981'
                      }} 
                    />
                  </div>
                  <div style={styles.barFooter}>
                    <span>{item.abertas} abertos</span>
                    <span>{item.resolvidas} resolvidos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent updates */}
        <div className="glass-card" style={{ flex: 1 }}>
          <h3 style={styles.sectionTitle}>Relatos Recentes</h3>
          <p style={styles.sectionDesc}>Últimos relatos enviados pelos cidadãos</p>

          <div style={styles.recentesList}>
            {recentes.map((oc, index) => {
              const isAberto = oc.status === "ABERTO";
              const isVistoria = oc.status === "EM_VISTORIA";
              
              return (
                <div key={index} style={styles.recenteItem}>
                  <div style={styles.recenteHeader}>
                    <div style={styles.recenteLocation}>
                      <MapPin size={14} color="#64748b" style={{ marginRight: '4px' }} />
                      <span style={styles.recenteRua}>{oc.obstaculo.rua.nome}</span>
                    </div>
                    {/* Status Badge */}
                    <span 
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: isAberto ? 'rgba(239, 68, 68, 0.1)' : isVistoria ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: isAberto ? '#ef4444' : isVistoria ? '#f59e0b' : '#10b981',
                        border: `1px solid ${isAberto ? 'rgba(239, 68, 68, 0.2)' : isVistoria ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                      }}
                    >
                      {oc.status}
                    </span>
                  </div>
                  <p style={styles.recenteDesc}>{oc.descricao.substring(0, 100)}...</p>
                  <div style={styles.recenteTime}>
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    <span>{new Date(oc.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(16, 185, 129, 0.1)',
    borderTop: '3px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    color: '#f8fafc',
    marginBottom: '4px',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#10b981',
    fontWeight: '500',
  },
  gridKpi: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  kpiCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  kpiLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  kpiIconWrapper: {
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '4px',
    fontFamily: "'Outfit', sans-serif",
  },
  kpiFooter: {
    fontSize: '11px',
    fontWeight: '500',
    marginTop: 'auto',
  },
  mainGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#f8fafc',
    marginBottom: '4px',
  },
  sectionDesc: {
    color: '#64748b',
    fontSize: '13px',
    marginBottom: '24px',
  },
  bairrosList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  bairroItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  bairroTextRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  bairroName: {
    color: '#f8fafc',
    fontWeight: '500',
  },
  bairroCount: {
    color: '#94a3b8',
  },
  barContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: '#1e293b',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  barFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#64748b',
  },
  recentesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  recenteItem: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  recenteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  recenteLocation: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  recenteRua: {
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  recenteDesc: {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  recenteTime: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#64748b',
    marginTop: '4px',
  }
};
