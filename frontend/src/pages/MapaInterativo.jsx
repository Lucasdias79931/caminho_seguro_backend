import React, { useEffect, useState } from 'react';
import { OcorrenciaService, VistoriaService } from '../services/api';
import { MapPin, Info, AlertTriangle, ShieldCheck, CheckCircle2, User, Clock, ShieldAlert } from 'lucide-react';

export default function MapaInterativo() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [laudo, setLaudo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoLaudo, setCarregandoLaudo] = useState(false);

  useEffect(() => {
    async function carregarOcorrencias() {
      try {
        setCarregando(true);
        const dados = await OcorrenciaService.listar();
        setOcorrencias(dados);
        if (dados.length > 0) {
          setSelecionada(dados[0]); // Seleciona a primeira por padrão
        }
      } catch (err) {
        console.error("Erro ao obter ocorrências para o mapa:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarOcorrencias();
  }, []);

  // Sempre que a ocorrência selecionada mudar, carrega o laudo de vistoria dela se houver
  useEffect(() => {
    if (!selecionada) return;
    
    async function carregarLaudo() {
      if (selecionada.status !== "ABERTO") {
        try {
          setCarregandoLaudo(true);
          const dadosLaudo = await VistoriaService.obterLaudoPorOcorrencia(selecionada.id);
          setLaudo(dadosLaudo);
        } catch (err) {
          console.error("Erro ao carregar laudo de vistoria:", err);
          setLaudo(null);
        } finally {
          setCarregandoLaudo(false);
        }
      } else {
        setLaudo(null);
      }
    }
    
    carregarLaudo();
  }, [selecionada]);

  // Coordenadas simuladas na tela para cada ocorrência
  const coords = {
    "oc1": { top: '30%', left: '25%' }, // Paulista
    "oc2": { top: '55%', left: '42%' }, // Augusta
    "oc3": { top: '75%', left: '30%' }, // Pinheiros
    "oc4": { top: '40%', left: '78%' }  // Direita
  };

  const obterPosicaoEstavel = (id) => {
    if (coords[id]) return coords[id];
    
    // Gera coordenadas estáveis baseadas em um hash simples do ID
    let hashTop = 0;
    let hashLeft = 0;
    
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      if (i % 2 === 0) {
        hashTop = (hashTop << 5) - hashTop + char;
      } else {
        hashLeft = (hashLeft << 5) - hashLeft + char;
      }
    }
    
    const topPct = 20 + Math.abs(hashTop % 60);
    const leftPct = 15 + Math.abs(hashLeft % 65);
    
    return { top: `${topPct}%`, left: `${leftPct}%` };
  };

  const getPinColor = (status) => {
    if (status === "ABERTO") return "#ef4444";
    if (status === "EM_VISTORIA") return "#f59e0b";
    return "#10b981";
  };

  if (carregando) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Renderizando mapa urbano...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title} className="gradient-text">Mapa Temático de Barreiras Urbanas</h2>
        <p style={styles.subtitle}>Clique nos marcadores para ver os detalhes da calçada e os laudos dos fiscais</p>
      </div>

      <div style={styles.mapGrid}>
        
        {/* Visual Map Area */}
        <div className="glass-card" style={styles.mapContainer}>
          {/* Estilização da malha urbana de fundo */}
          <div style={styles.mapCanvas}>
            {/* Ruas simuladas */}
            <div style={{ ...styles.ruaLinha, top: '35%', width: '100%', transform: 'rotate(-2deg)' }}><span style={styles.mapRuaText}>Av. Paulista</span></div>
            <div style={{ ...styles.ruaLinha, top: '60%', width: '100%', transform: 'rotate(1deg)' }}><span style={styles.mapRuaText}>Rua Augusta</span></div>
            <div style={{ ...styles.ruaLinha, left: '35%', height: '100%', width: '2px', backgroundColor: 'rgba(255,255,255,0.06)' }}><span style={{ ...styles.mapRuaText, writingMode: 'vertical-rl', marginTop: '40px' }}>Rua dos Pinheiros</span></div>
            <div style={{ ...styles.ruaLinha, left: '75%', height: '100%', width: '2px', backgroundColor: 'rgba(255,255,255,0.06)' }}><span style={{ ...styles.mapRuaText, writingMode: 'vertical-rl', marginTop: '120px' }}>Rua Direita (Centro)</span></div>
            
            {/* Parques / Rio simulados */}
            <div style={styles.simulatedRiver} />
            <div style={styles.simulatedPark}><span style={styles.parkText}>Parque Mário Covas</span></div>
            
            {/* Pins */}
            {ocorrencias.map((oc) => {
              const pos = obterPosicaoEstavel(oc.id);
              const isSelected = selecionada && selecionada.id === oc.id;
              const color = getPinColor(oc.status);
              
              return (
                <button
                  key={oc.id}
                  onClick={() => setSelecionada(oc)}
                  style={{
                    ...styles.pinButton,
                    top: pos.top,
                    left: pos.left,
                  }}
                >
                  <MapPin 
                    size={isSelected ? 36 : 28} 
                    color={color} 
                    fill={isSelected ? `${color}40` : "transparent"}
                    style={{ 
                      filter: isSelected ? `drop-shadow(0 0 10px ${color})` : 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                  {isSelected && <div style={{ ...styles.pinPulse, backgroundColor: color }} />}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div style={styles.legenda}>
            <div style={styles.legendaItem}><div style={{ ...styles.legendaCor, backgroundColor: '#ef4444' }} /><span>Aberto (Pendente)</span></div>
            <div style={styles.legendaItem}><div style={{ ...styles.legendaCor, backgroundColor: '#f59e0b' }} /><span>Em Vistoria (Fiscalização)</span></div>
            <div style={styles.legendaItem}><div style={{ ...styles.legendaCor, backgroundColor: '#10b981' }} /><span>Resolvido (Livre)</span></div>
          </div>
        </div>

        {/* Selected Incident Panel */}
        <div className="glass-card" style={styles.detailsPanel}>
          {selecionada ? (
            <div style={styles.detailsContent}>
              
              {/* Top Banner Status */}
              <div style={styles.detailsHeader}>
                <span style={styles.detailsStreet}>{selecionada.obstaculo.rua.nome}</span>
                <span 
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: selecionada.status === "ABERTO" ? 'rgba(239, 68, 68, 0.1)' : selecionada.status === "EM_VISTORIA" ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: selecionada.status === "ABERTO" ? '#ef4444' : selecionada.status === "EM_VISTORIA" ? '#f59e0b' : '#10b981',
                    border: `1px solid ${selecionada.status === "ABERTO" ? 'rgba(239, 68, 68, 0.2)' : selecionada.status === "EM_VISTORIA" ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                  }}
                >
                  {selecionada.status}
                </span>
              </div>
              <p style={styles.detailsBairro}>{selecionada.obstaculo.bairro.nome} • CEP {selecionada.obstaculo.rua.cep}</p>

              {/* Descrição */}
              <div style={styles.section}>
                <h4 style={styles.subTitle}>Relato do Pedestre</h4>
                {selecionada.imagem_url && (
                  <div style={{ marginBottom: '8px', width: '100%' }}>
                    <img 
                      src={selecionada.imagem_url} 
                      alt="Foto do obstáculo" 
                      style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }} 
                    />
                  </div>
                )}
                <p style={styles.descText}>"{selecionada.descricao}"</p>
                <div style={styles.reporterInfo}>
                  <User size={14} style={{ marginRight: '6px' }} />
                  <span>Enviado por {selecionada.cidadao.nome}</span>
                </div>
              </div>

              {/* Atributos do Obstáculo (Banco de Dados) */}
              <div style={styles.section}>
                <h4 style={styles.subTitle}>Diagnóstico Técnico da Calçada</h4>
                <div style={styles.attributesGrid}>
                  <div style={styles.attrItem}>
                    <span style={styles.attrLabel}>Pavimentação</span>
                    <span style={{ ...styles.attrValue, color: selecionada.obstaculo.pavimentacao === 'Destruída' || selecionada.obstaculo.pavimentacao === 'Precária' ? '#ef4444' : '#f8fafc' }}>
                      {selecionada.obstaculo.pavimentacao}
                    </span>
                  </div>
                  <div style={styles.attrItem}>
                    <span style={styles.attrLabel}>Iluminação</span>
                    <span style={styles.attrValue}>{selecionada.obstaculo.iluminacao}</span>
                  </div>
                  <div style={styles.attrItem}>
                    <span style={styles.attrLabel}>Zeladoria</span>
                    <span style={styles.attrValue}>{selecionada.obstaculo.zeladoria}</span>
                  </div>
                  <div style={styles.attrItem}>
                    <span style={styles.attrLabel}>Saneamento</span>
                    <span style={styles.attrValue}>{selecionada.obstaculo.saneamento}</span>
                  </div>
                </div>
              </div>

              {/* Vistoria e Laudo Relacionados */}
              <div style={{ ...styles.section, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                <h4 style={styles.subTitle}>
                  {selecionada.status === "ABERTO" ? "Vistoria Fiscal" : "Laudo da Fiscalização"}
                </h4>
                
                {carregandoLaudo ? (
                  <p style={styles.laudoAviso}>Carregando laudo fiscal...</p>
                ) : laudo ? (
                  <div style={styles.laudoContainer}>
                    <div style={styles.laudoHeader}>
                      <ShieldCheck size={16} color="#10b981" style={{ marginRight: '6px' }} />
                      <span style={styles.laudoFiscal}>{laudo.fiscal.nome} (Matrícula: {laudo.fiscal.matricula})</span>
                    </div>
                    <p style={styles.laudoText}>"{laudo.laudo}"</p>
                    <div style={styles.laudoPrazo}>
                      <Clock size={12} style={{ marginRight: '4px' }} />
                      <span>Prazo de adequação: <strong>{new Date(laudo.prazo_adequacao).toLocaleDateString('pt-BR')}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div style={styles.noLaudo}>
                    <ShieldAlert size={20} color="#f59e0b" style={{ marginRight: '8px' }} />
                    <p style={styles.laudoAviso}>Esta ocorrência ainda não foi vistoriada por um fiscal municipal.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div style={styles.noSelect}>
              <Info size={36} color="#64748b" style={{ marginBottom: '12px' }} />
              <p>Nenhuma ocorrência selecionada no mapa</p>
            </div>
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
  header: {
    marginBottom: '28px',
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
  mapGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  mapContainer: {
    flex: 1.5,
    minWidth: '350px',
    height: '520px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    padding: '16px',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
  },
  ruaLinha: {
    position: 'absolute',
    height: '35px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderTop: '1px dashed rgba(255, 255, 255, 0.05)',
    borderBottom: '1px dashed rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '20px',
  },
  mapRuaText: {
    fontSize: '10px',
    color: '#334155',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  simulatedRiver: {
    position: 'absolute',
    bottom: '-20px',
    right: '-20px',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
    border: '1px solid rgba(59, 130, 246, 0.06)',
  },
  simulatedPark: {
    position: 'absolute',
    top: '10%',
    right: '8%',
    width: '120px',
    height: '90px',
    borderRadius: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    border: '1px dashed rgba(16, 185, 129, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parkText: {
    fontSize: '9px',
    color: 'rgba(16, 185, 129, 0.25)',
    fontWeight: '600',
    textAlign: 'center',
  },
  pinButton: {
    position: 'absolute',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transform: 'translate(-50%, -100%)',
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPulse: {
    position: 'absolute',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    zIndex: -1,
    transform: 'translateY(-10px)',
    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
  },
  legenda: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '16px',
    flexWrap: 'wrap',
  },
  legendaItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#94a3b8',
  },
  legendaCor: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  detailsPanel: {
    flex: 1,
    minWidth: '320px',
    height: '520px',
    overflowY: 'auto',
  },
  noSelect: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    fontSize: '14px',
  },
  detailsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  detailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  detailsStreet: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f8fafc',
    fontFamily: "'Outfit', sans-serif",
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  detailsBairro: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '-10px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  subTitle: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  descText: {
    fontSize: '13px',
    color: '#e2e8f0',
    lineHeight: '1.5',
    backgroundColor: 'rgba(255,255,255,0.01)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  reporterInfo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#64748b',
  },
  attributesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  attrItem: {
    padding: '10px 12px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  attrLabel: {
    fontSize: '10px',
    color: '#64748b',
  },
  attrValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f8fafc',
  },
  noLaudo: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
    border: '1px solid rgba(245, 158, 11, 0.1)',
  },
  laudoAviso: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  laudoContainer: {
    padding: '14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  laudoHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  laudoFiscal: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#10b981',
  },
  laudoText: {
    fontSize: '12px',
    color: '#cbd5e1',
    lineHeight: '1.5',
    fontStyle: 'italic',
  },
  laudoPrazo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#64748b',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    paddingTop: '8px',
  }
};
