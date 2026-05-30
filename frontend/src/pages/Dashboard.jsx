import React, { useEffect, useState } from 'react';
import { OcorrenciaService } from '../services/api';
import { 
  AlertOctagon, 
  FileSearch, 
  CheckCircle2, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon,
  Activity,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);
  const [ocorrenciasFiltradas, setOcorrenciasFiltradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoFiltro, setProcessandoFiltro] = useState(false);

  // States para os filtros selecionados
  const [filtroBairro, setFiltroBairro] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroDefeito, setFiltroDefeito] = useState('Todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('30'); // '7', '30', 'total'

  // Carregar os dados base do mock do banco de dados
  useEffect(() => {
    async function carregarOcorrencias() {
      try {
        setCarregando(true);
        const dados = await OcorrenciaService.listar();
        setTodasOcorrencias(dados);
        setOcorrenciasFiltradas(dados);
      } catch (err) {
        console.error("Erro ao carregar dados no dashboard:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarOcorrencias();
  }, []);

  // Executar filtragem dinâmica dos dados
  useEffect(() => {
    setProcessandoFiltro(true);
    
    // Simula um delay rápido de renderização de 200ms para dar dinamismo visual ("feedback de processamento")
    const timer = setTimeout(() => {
      let resultado = [...todasOcorrencias];

      // Filtro de Bairro
      if (filtroBairro !== 'Todos') {
        resultado = resultado.filter(oc => oc.obstaculo.bairro.nome === filtroBairro);
      }

      // Filtro de Status
      if (filtroStatus !== 'Todos') {
        resultado = resultado.filter(oc => oc.status === filtroStatus);
      }

      // Filtro de Tipo de Defeito (Diagnóstico físico)
      if (filtroDefeito !== 'Todos') {
        if (filtroDefeito === 'Pavimentação') {
          resultado = resultado.filter(oc => oc.obstaculo.pavimentacao === 'Precária' || oc.obstaculo.pavimentacao === 'Destruída');
        } else if (filtroDefeito === 'Iluminação') {
          resultado = resultado.filter(oc => oc.obstaculo.iluminacao === 'Ruim' || oc.obstaculo.iluminacao === 'Regular');
        } else if (filtroDefeito === 'Saneamento') {
          resultado = resultado.filter(oc => oc.obstaculo.saneamento === 'Prejudicado' || oc.obstaculo.saneamento === 'Sem bueiro/aberto');
        } else if (filtroDefeito === 'Zeladoria') {
          resultado = resultado.filter(oc => oc.obstaculo.zeladoria === 'Precária' || oc.obstaculo.zeladoria === 'Regular');
        }
      }

      // Filtro de Período
      if (filtroPeriodo !== 'total') {
        const diasLimite = parseInt(filtroPeriodo, 10);
        const hoje = new Date();
        const limiteData = new Date();
        limiteData.setDate(hoje.getDate() - diasLimite);

        resultado = resultado.filter(oc => {
          const dataOc = new Date(oc.created_at);
          return dataOc >= limiteData;
        });
      }

      setOcorrenciasFiltradas(resultado);
      setProcessandoFiltro(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [filtroBairro, filtroStatus, filtroDefeito, filtroPeriodo, todasOcorrencias]);

  // Função para limpar todos os filtros
  const resetarFiltros = () => {
    setFiltroBairro('Todos');
    setFiltroStatus('Todos');
    setFiltroDefeito('Todos');
    setFiltroPeriodo('total');
  };

  // 1. Cálculos de KPIs baseados nos dados filtrados
  const total = ocorrenciasFiltradas.length;
  const abertas = ocorrenciasFiltradas.filter(oc => oc.status === 'ABERTO').length;
  const emVistoria = ocorrenciasFiltradas.filter(oc => oc.status === 'EM_VISTORIA').length;
  const resolvidas = ocorrenciasFiltradas.filter(oc => oc.status === 'RESOLVIDO').length;
  
  // Cálculo dinâmico do índice de calçada segura
  const totalPavimentoBom = ocorrenciasFiltradas.filter(oc => oc.obstaculo.pavimentacao === 'Boa' || oc.obstaculo.pavimentacao === 'Regular').length;
  const indiceAcessibilidade = total > 0 ? Math.round((totalPavimentoBom / total) * 100) : 100;

  // Obter lista única de bairros das ocorrências para popular o filtro
  const listaBairrosDisponiveis = ['Todos', ...new Set(todasOcorrencias.map(oc => oc.obstaculo.bairro.nome))];

  // 2. Gráfico 1: Cálculo do Donut SVG para Status
  const pctAberto = total > 0 ? abertas / total : 0;
  const pctVistoria = total > 0 ? emVistoria / total : 0;
  const pctResolvido = total > 0 ? resolvidas / total : 0;

  // Circunferência do círculo R=30 no donut SVG (2 * PI * R = 188.49)
  const circ = 188.49;
  const strokeAberto = circ * pctAberto;
  const strokeVistoria = circ * pctVistoria;
  const strokeResolvido = circ * pctResolvido;

  // Offsets acumulados para desenhar sequencialmente
  const offsetAberto = 0;
  const offsetVistoria = -strokeAberto;
  const offsetResolvido = -(strokeAberto + strokeVistoria);

  // 3. Gráfico 2: Infraestrutura Crítica (Valores percentuais)
  const pavCritico = ocorrenciasFiltradas.filter(oc => oc.obstaculo.pavimentacao === 'Destruída' || oc.obstaculo.pavimentacao === 'Precária').length;
  const ilumCritico = ocorrenciasFiltradas.filter(oc => oc.obstaculo.iluminacao === 'Ruim').length;
  const saneCritico = ocorrenciasFiltradas.filter(oc => oc.obstaculo.saneamento === 'Sem bueiro/aberto' || oc.obstaculo.saneamento === 'Prejudicado').length;
  const zelaCritico = ocorrenciasFiltradas.filter(oc => oc.obstaculo.zeladoria === 'Precária').length;

  const pctPavCritico = total > 0 ? Math.round((pavCritico / total) * 100) : 0;
  const pctIlumCritico = total > 0 ? Math.round((ilumCritico / total) * 100) : 0;
  const pctSaneCritico = total > 0 ? Math.round((saneCritico / total) * 100) : 0;
  const pctZelaCritico = total > 0 ? Math.round((zelaCritico / total) * 100) : 0;

  // 4. Gráfico 3: Ocorrências por Bairro (Vertical Bar Chart Dinâmico)
  const countsPorBairro = ocorrenciasFiltradas.reduce((acc, oc) => {
    const nomeB = oc.obstaculo.bairro.nome;
    acc[nomeB] = (acc[nomeB] || 0) + 1;
    return acc;
  }, {});

  const dataBairrosChart = Object.keys(countsPorBairro).map(nome => ({
    bairro: nome,
    quantidade: countsPorBairro[nome]
  })).sort((a, b) => b.quantidade - a.quantidade);

  const maxBairrosQtde = dataBairrosChart.length > 0 ? Math.max(...dataBairrosChart.map(d => d.quantidade)) : 1;

  // 5. Gráfico 4: Tendência de Ocorrências nos últimos dias (Sparkline SVG Line)
  // Agrupa por data nos últimos 7 dias de forma dinâmica
  const obterDadosLinha = () => {
    const dias = [];
    const contagem = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dataStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dias.push(dataStr);
      
      const count = ocorrenciasFiltradas.filter(oc => {
        const dataOc = new Date(oc.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return dataOc === dataStr;
      }).length;
      contagem.push(count);
    }
    return { dias, contagem };
  };

  const trendData = obterDadosLinha();
  const maxTrendVal = Math.max(...trendData.contagem, 1);
  
  // Gera os pontos da linha SVG dentro de uma viewbox de 300x120
  const buildSvgPath = () => {
    const width = 300;
    const height = 120;
    const padding = 15;
    const usableHeight = height - padding * 2;
    const usableWidth = width - padding * 2;
    
    const pontos = trendData.contagem.map((val, idx) => {
      const x = padding + (idx / 6) * usableWidth;
      const y = padding + usableHeight - (val / maxTrendVal) * usableHeight;
      return { x, y };
    });

    if (pontos.length === 0) return '';
    
    // Gera a string do path SVG 'M x y L x y ...'
    let pathStr = `M ${pontos[0].x} ${pontos[0].y}`;
    for (let i = 1; i < pontos.length; i++) {
      pathStr += ` L ${pontos[i].x} ${pontos[i].y}`;
    }
    return { pathStr, pontos };
  };

  const svgData = buildSvgPath();

  if (carregando) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Carregando dados da cidade...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Header com indicador de processamento dos filtros */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title} className="gradient-text">Dashboard de Mobilidade e Gestão Urbana</h2>
          <p style={styles.subtitle}>Painel analítico integrado de acessibilidade e fiscalização de calçadas</p>
        </div>
        <div style={{ ...styles.badge, borderColor: processandoFiltro ? '#f59e0b' : 'rgba(16, 185, 129, 0.2)' }}>
          {processandoFiltro ? (
            <>
              <div style={styles.miniSpinner}></div>
              <span style={{ color: '#f59e0b' }}>Processando Filtros...</span>
            </>
          ) : (
            <>
              <TrendingUp size={16} color="#10b981" style={{ marginRight: '6px' }} />
              <span>Dados 100% Interativos</span>
            </>
          )}
        </div>
      </div>

      {/* Controladores / Filtros Avançados */}
      <div className="glass-card" style={styles.filterCard}>
        <div style={styles.filterTitleRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="#10b981" />
            <h3 style={styles.filterTitle}>Controladores de Dados</h3>
          </div>
          <button onClick={resetarFiltros} style={styles.btnReset} title="Limpar todos os filtros">
            <RefreshCw size={14} style={{ marginRight: '6px' }} />
            Resetar Filtros
          </button>
        </div>

        <div style={styles.filterGrid}>
          {/* Filtro 1: Bairro */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>
              <MapPin size={12} style={{ marginRight: '4px' }} /> Bairro Urbano
            </label>
            <select 
              value={filtroBairro} 
              onChange={(e) => setFiltroBairro(e.target.value)} 
              style={styles.filterSelect}
            >
              {listaBairrosDisponiveis.map((b, idx) => (
                <option key={idx} value={b}>{b === 'Todos' ? '🌆 Todos os Bairros' : b}</option>
              ))}
            </select>
          </div>

          {/* Filtro 2: Status */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>
              <Layers size={12} style={{ marginRight: '4px' }} /> Status da Ocorrência
            </label>
            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value)} 
              style={styles.filterSelect}
            >
              <option value="Todos">📊 Todos os Status</option>
              <option value="ABERTO">🔴 Aberto</option>
              <option value="EM_VISTORIA">🟡 Em Vistoria</option>
              <option value="RESOLVIDO">🟢 Resolvido</option>
            </select>
          </div>

          {/* Filtro 3: Defeito Crítico */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>
              <AlertOctagon size={12} style={{ marginRight: '4px' }} /> Defeito Foco
            </label>
            <select 
              value={filtroDefeito} 
              onChange={(e) => setFiltroDefeito(e.target.value)} 
              style={styles.filterSelect}
            >
              <option value="Todos">🛠️ Todos os Defeitos</option>
              <option value="Pavimentação">Pavimentação Inadequada</option>
              <option value="Iluminação">Iluminação Precária</option>
              <option value="Zeladoria">Zeladoria Regular/Precária</option>
              <option value="Saneamento">Problema de Saneamento</option>
            </select>
          </div>

          {/* Filtro 4: Período */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>
              <Calendar size={12} style={{ marginRight: '4px' }} /> Período de Registro
            </label>
            <div style={styles.periodTabs}>
              <button 
                onClick={() => setFiltroPeriodo('7')} 
                style={{ ...styles.periodTab, ...(filtroPeriodo === '7' ? styles.periodTabActive : {}) }}
              >
                7 Dias
              </button>
              <button 
                onClick={() => setFiltroPeriodo('30')} 
                style={{ ...styles.periodTab, ...(filtroPeriodo === '30' ? styles.periodTabActive : {}) }}
              >
                30 Dias
              </button>
              <button 
                onClick={() => setFiltroPeriodo('total')} 
                style={{ ...styles.periodTab, ...(filtroPeriodo === 'total' ? styles.periodTabActive : {}) }}
              >
                Total
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.gridKpi}>
        {/* KPI 1 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Registros Filtrados</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertOctagon size={20} />
            </div>
          </div>
          <h3 style={styles.kpiValue}>{total}</h3>
          <p style={{ ...styles.kpiFooter, color: '#ef4444' }}>Calçadas inadequadas</p>
        </div>

        {/* KPI 2 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Em Fiscalização</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <FileSearch size={20} />
            </div>
          </div>
          <h3 style={styles.kpiValue}>{emVistoria}</h3>
          <p style={{ ...styles.kpiFooter, color: '#f59e0b' }}>Em vistoria ativa</p>
        </div>

        {/* KPI 3 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Resolvidas</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h3 style={styles.kpiValue}>{resolvidas}</h3>
          <p style={{ ...styles.kpiFooter, color: '#10b981' }}>Passagem livre</p>
        </div>

        {/* KPI 4 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Indice de Calçada Regular</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Activity size={20} />
            </div>
          </div>
          <h3 style={styles.kpiValue}>{indiceAcessibilidade}%</h3>
          <p style={{ ...styles.kpiFooter, color: '#3b82f6' }}>Média de calçada boa/regular</p>
        </div>
      </div>

      {/* Seção Principal de Gráficos */}
      <div style={styles.mainGrid}>
        
        {/* Bloco 1: Gráfico de Donut de Status */}
        <div className="glass-card" style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
          <div style={styles.chartTitleRow}>
            <PieIcon size={16} color="#10b981" />
            <h3 style={styles.sectionTitle}>Distribuição por Status</h3>
          </div>
          <p style={styles.sectionDesc}>Porcentagem de resolução de barreiras ativas</p>
          
          {total > 0 ? (
            <div style={styles.donutContainer}>
              <div style={styles.donutSvgWrapper}>
                <svg width="140" height="140" viewBox="0 0 100 100">
                  <defs>
                    <filter id="glow-aberto">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Fundo do circulo */}
                  <circle cx="50" cy="50" r="30" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                  
                  {/* Resolvidos (Verde) */}
                  {resolvidas > 0 && (
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="30" 
                      fill="transparent" 
                      stroke="#10b981" 
                      strokeWidth="8" 
                      strokeDasharray={`${strokeResolvido} ${circ}`}
                      strokeDashoffset={offsetResolvido}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Em Vistoria (Amarelo) */}
                  {emVistoria > 0 && (
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="30" 
                      fill="transparent" 
                      stroke="#f59e0b" 
                      strokeWidth="8" 
                      strokeDasharray={`${strokeVistoria} ${circ}`}
                      strokeDashoffset={offsetVistoria}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Aberto (Vermelho) */}
                  {abertas > 0 && (
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="30" 
                      fill="transparent" 
                      stroke="#ef4444" 
                      strokeWidth="8" 
                      strokeDasharray={`${strokeAberto} ${circ}`}
                      strokeDashoffset={offsetAberto}
                      strokeLinecap="round"
                      filter="url(#glow-aberto)"
                    />
                  )}
                </svg>
                {/* Texto Central */}
                <div style={styles.donutCenterText}>
                  <span style={styles.donutCenterVal}>{total}</span>
                  <span style={styles.donutCenterLbl}>Total</span>
                </div>
              </div>

              {/* Legendas e Contagens */}
              <div style={styles.donutLegendContainer}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: '#ef4444' }}></div>
                  <span style={styles.legendLabel}>Abertas</span>
                  <span style={styles.legendValue}>{abertas} ({Math.round(pctAberto * 100)}%)</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: '#f59e0b' }}></div>
                  <span style={styles.legendLabel}>Em Vistoria</span>
                  <span style={styles.legendValue}>{emVistoria} ({Math.round(pctVistoria * 100)}%)</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: '#10b981' }}></div>
                  <span style={styles.legendLabel}>Resolvidas</span>
                  <span style={styles.legendValue}>{resolvidas} ({Math.round(pctResolvido * 100)}%)</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.noDataContainer}>Sem dados correspondentes aos filtros</div>
          )}
        </div>

        {/* Bloco 2: Apple Watch-Style Circular Activity Rings para Infraestrutura Crítica */}
        <div className="glass-card" style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
          <div style={styles.chartTitleRow}>
            <Activity size={16} color="#10b981" />
            <h3 style={styles.sectionTitle}>Defeitos Críticos Identificados</h3>
          </div>
          <p style={styles.sectionDesc}>Principais barreiras físicas denunciadas</p>

          {total > 0 ? (
            <div style={styles.ringsContainer}>
              {/* Ring 1: Pavimentação Ruim */}
              <div style={styles.ringCard}>
                <div style={styles.ringSvgWrapper}>
                  <svg width="70" height="70" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="14" fill="transparent" stroke="#1c2535" strokeWidth="3" />
                    <circle 
                      cx="20" 
                      cy="20" 
                      r="14" 
                      fill="transparent" 
                      stroke="#ef4444" 
                      strokeWidth="3.5" 
                      strokeDasharray={`${(pctPavCritico / 100) * 87.96} 87.96`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={styles.ringText}>{pctPavCritico}%</div>
                </div>
                <span style={styles.ringLabel}>Pavimento Inadequado</span>
                <span style={styles.ringSub}>{pavCritico} ocorrências</span>
              </div>

              {/* Ring 2: Iluminação Defeituosa */}
              <div style={styles.ringCard}>
                <div style={styles.ringSvgWrapper}>
                  <svg width="70" height="70" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="14" fill="transparent" stroke="#1c2535" strokeWidth="3" />
                    <circle 
                      cx="20" 
                      cy="20" 
                      r="14" 
                      fill="transparent" 
                      stroke="#f59e0b" 
                      strokeWidth="3.5" 
                      strokeDasharray={`${(pctIlumCritico / 100) * 87.96} 87.96`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={styles.ringText}>{pctIlumCritico}%</div>
                </div>
                <span style={styles.ringLabel}>Iluminação Ruim</span>
                <span style={styles.ringSub}>{ilumCritico} ocorrências</span>
              </div>

              {/* Ring 3: Saneamento / Bueiros abertos */}
              <div style={styles.ringCard}>
                <div style={styles.ringSvgWrapper}>
                  <svg width="70" height="70" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="14" fill="transparent" stroke="#1c2535" strokeWidth="3" />
                    <circle 
                      cx="20" 
                      cy="20" 
                      r="14" 
                      fill="transparent" 
                      stroke="#3b82f6" 
                      strokeWidth="3.5" 
                      strokeDasharray={`${(pctSaneCritico / 100) * 87.96} 87.96`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={styles.ringText}>{pctSaneCritico}%</div>
                </div>
                <span style={styles.ringLabel}>Saneamento / Vazamentos</span>
                <span style={styles.ringSub}>{saneCritico} ocorrências</span>
              </div>

              {/* Ring 4: Zeladoria Precária */}
              <div style={styles.ringCard}>
                <div style={styles.ringSvgWrapper}>
                  <svg width="70" height="70" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="14" fill="transparent" stroke="#1c2535" strokeWidth="3" />
                    <circle 
                      cx="20" 
                      cy="20" 
                      r="14" 
                      fill="transparent" 
                      stroke="#a855f7" 
                      strokeWidth="3.5" 
                      strokeDasharray={`${(pctZelaCritico / 100) * 87.96} 87.96`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={styles.ringText}>{pctZelaCritico}%</div>
                </div>
                <span style={styles.ringLabel}>Mato / Entulho na Calçada</span>
                <span style={styles.ringSub}>{zelaCritico} ocorrências</span>
              </div>
            </div>
          ) : (
            <div style={styles.noDataContainer}>Sem dados correspondentes aos filtros</div>
          )}
        </div>

      </div>

      <div style={{ ...styles.mainGrid, marginTop: '24px' }}>
        
        {/* Bloco 3: Gráfico de Barras Verticais SVG por Bairro */}
        <div className="glass-card" style={{ flex: 1.3, minWidth: '320px' }}>
          <div style={styles.chartTitleRow}>
            <BarChart3 size={16} color="#10b981" />
            <h3 style={styles.sectionTitle}>Ranking de Barreiras por Bairro</h3>
          </div>
          <p style={styles.sectionDesc}>Número absoluto de ocorrências localizadas por bairro</p>

          {dataBairrosChart.length > 0 ? (
            <div style={styles.verticalBarChartContainer}>
              <div style={styles.vChartYAxis}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = Math.round(maxBairrosQtde - (i * maxBairrosQtde) / 4);
                  return <span key={i}>{val}</span>;
                })}
              </div>
              
              <div style={styles.vChartArea}>
                {dataBairrosChart.map((d, idx) => {
                  const barHeightPct = (d.quantidade / maxBairrosQtde) * 100;
                  return (
                    <div key={idx} style={styles.vChartCol}>
                      <div style={styles.vChartBarWrapper}>
                        <div style={styles.vChartTooltip}>{d.quantidade}</div>
                        <div 
                          style={{ 
                            ...styles.vChartBarFill, 
                            height: `${barHeightPct}%`,
                            background: barHeightPct > 60 ? 'linear-gradient(to top, #ef4444, #f87171)' : 'linear-gradient(to top, #10b981, #34d399)'
                          }} 
                        />
                      </div>
                      <span style={styles.vChartLabel}>{d.bairro}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={styles.noDataContainer}>Sem dados correspondentes aos filtros</div>
          )}
        </div>

        {/* Bloco 4: Gráfico de Tendência Temporal SVG Line Chart */}
        <div className="glass-card" style={{ flex: 1, minWidth: '300px' }}>
          <div style={styles.chartTitleRow}>
            <TrendingUp size={16} color="#10b981" />
            <h3 style={styles.sectionTitle}>Linha de Tendência de Registros</h3>
          </div>
          <p style={styles.sectionDesc}>Ocorrências enviadas por dia na última semana</p>

          {svgData ? (
            <div style={styles.lineChartWrapper}>
              <svg width="100%" height="130" viewBox="0 0 300 120" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                {/* Linhas de Grade de Fundo */}
                <line x1="15" y1="15" x2="285" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="15" y1="60" x2="285" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="15" y1="105" x2="285" y2="105" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Sombra Sob a Linha */}
                {svgData.pathStr && (
                  <path 
                    d={`${svgData.pathStr} L 285 105 L 15 105 Z`} 
                    fill="url(#line-grad)" 
                  />
                )}

                {/* A Linha Real */}
                <path 
                  d={svgData.pathStr} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.3))' }}
                />

                {/* Pontos com Tooltip Visual */}
                {svgData.pontos.map((pt, idx) => (
                  <g key={idx} className="line-chart-dot-group" style={{ cursor: 'pointer' }}>
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#0a0d14" stroke="#10b981" strokeWidth="2" />
                    <circle cx={pt.x} cy={pt.y} r="8" fill="#10b981" fillOpacity="0.0" className="line-chart-dot-hover" />
                    <text 
                      x={pt.x} 
                      y={pt.y - 10} 
                      textAnchor="middle" 
                      fill="#cbd5e1" 
                      fontSize="9" 
                      fontWeight="bold"
                      style={{ opacity: 0.8 }}
                    >
                      {trendData.contagem[idx]}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Rótulos do Eixo X */}
              <div style={styles.lineChartXAxis}>
                {trendData.dias.map((dia, idx) => (
                  <span key={idx}>{dia}</span>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.noDataContainer}>Sem dados correspondentes aos filtros</div>
          )}
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
  miniSpinner: {
    width: '12px',
    height: '12px',
    border: '2px solid rgba(245, 158, 11, 0.1)',
    borderTop: '2px solid #f59e0b',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginRight: '6px',
    display: 'inline-block',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
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
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#10b981',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  
  // Estilos da Barra de Filtros
  filterCard: {
    marginBottom: '28px',
    padding: '20px 24px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  filterTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '10px',
  },
  filterTitle: {
    fontSize: '15px',
    color: '#cbd5e1',
    fontWeight: '600',
  },
  btnReset: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#94a3b8',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    outline: 'none',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      color: '#f8fafc',
    }
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
  },
  filterSelect: {
    padding: '10px 12px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
    ':focus': {
      borderColor: '#10b981',
    }
  },
  periodTabs: {
    display: 'flex',
    backgroundColor: '#0c0f16',
    borderRadius: '8px',
    padding: '3px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    height: '38px',
  },
  periodTab: {
    flex: 1,
    border: 'none',
    background: 'none',
    color: '#64748b',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  periodTabActive: {
    backgroundColor: '#10b981',
    color: '#fff',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
  },

  // KPI Grid
  gridKpi: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  kpiCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  kpiLabel: {
    fontSize: '12px',
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

  // Layout principal
  mainGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  chartTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  sectionTitle: {
    fontSize: '16px',
    color: '#f8fafc',
    fontWeight: '600',
  },
  sectionDesc: {
    color: '#64748b',
    fontSize: '12px',
    marginBottom: '16px',
  },
  noDataContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: '13px',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
  },

  // Donut Chart Styles
  donutContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '12px 0',
  },
  donutSvgWrapper: {
    position: 'relative',
    width: '140px',
    height: '140px',
  },
  donutCenterText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterVal: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#f8fafc',
    fontFamily: "'Outfit', sans-serif",
    lineHeight: '1',
  },
  donutCenterLbl: {
    fontSize: '10px',
    color: '#64748b',
    textTransform: 'uppercase',
    marginTop: '2px',
    fontWeight: '500',
  },
  donutLegendContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  legendLabel: {
    color: '#cbd5e1',
    width: '80px',
  },
  legendValue: {
    color: '#64748b',
    fontWeight: '500',
  },

  // Activity Rings Styles
  ringsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    flex: 1,
  },
  ringCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  ringSvgWrapper: {
    position: 'relative',
    width: '70px',
    height: '70px',
  },
  ringText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#f8fafc',
    fontFamily: "'Outfit', sans-serif",
  },
  ringLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: '8px',
  },
  ringSub: {
    fontSize: '9px',
    color: '#64748b',
    marginTop: '2px',
  },

  // Vertical Bar Chart Styles
  verticalBarChartContainer: {
    display: 'flex',
    height: '200px',
    padding: '10px 0 20px 0',
    position: 'relative',
  },
  vChartYAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '160px',
    width: '28px',
    fontSize: '10px',
    color: '#64748b',
    textAlign: 'right',
    paddingRight: '8px',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
  },
  vChartArea: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '160px',
    paddingLeft: '12px',
  },
  vChartCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '18%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  vChartBarWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    position: 'relative',
    cursor: 'pointer',
    // Hover text display logic
    ':hover > div:first-of-type': {
      opacity: 1,
      transform: 'translateX(-50%) translateY(-5px)',
    }
  },
  vChartTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1e293b',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  vChartBarFill: {
    width: '100%',
    borderRadius: '6px 6px 0 0',
    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
  },
  vChartLabel: {
    fontSize: '9px',
    color: '#64748b',
    marginTop: '8px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },

  // Line Chart Styles
  lineChartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '10px',
  },
  lineChartXAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px 0 12px',
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '500',
  }
};
