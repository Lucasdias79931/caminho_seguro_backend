import React, { useEffect, useState } from 'react';
import { 
  OcorrenciaService, 
  FiscalService, 
  VistoriaService, 
  EquipeService, 
  IntervencaoService 
} from '../services/api';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  User, 
  Calendar, 
  Wrench, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function Fiscalizacao() {
  const [fiscais, setFiscais] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [ocorrenciasPendentes, setOcorrenciasPendentes] = useState([]);
  const [vistoriasRealizadas, setVistoriasRealizadas] = useState([]);
  const [intervencoes, setIntervencoes] = useState([]);
  
  const [fiscalSelecionado, setFiscalSelecionado] = useState('');
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState(null);
  
  const [carregando, setCarregando] = useState(true);
  const [enviandoLaudo, setEnviandoLaudo] = useState(false);
  const [enviandoIntervencao, setEnviandoIntervencao] = useState(false);

  // Estados dos formulários
  const [laudoInput, setLaudoInput] = useState('');
  const [prazoInput, setPrazoInput] = useState('');
  
  const [equipeSelecionada, setEquipeSelecionada] = useState('');
  const [custoInput, setCustoInput] = useState('');
  const [descIntervencao, setDescIntervencao] = useState('');
  
  // Controle de Abas locais (Vistorias Pendentes vs Realizadas)
  const [abaAtiva, setAbaAtiva] = useState('pendentes');

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [listFiscais, listEquipes, listOcorrencias, listVistorias, listIntervencoes] = await Promise.all([
        FiscalService.listar(),
        EquipeService.listar(),
        OcorrenciaService.listar(),
        VistoriaService.listar(),
        IntervencaoService.listar()
      ]);
      
      setFiscais(listFiscais);
      setEquipes(listEquipes);
      
      // Filtra ocorrências que necessitam de vistoria (Aberto ou Em Vistoria)
      setOcorrenciasPendentes(listOcorrencias.filter(o => o.status !== 'RESOLVIDO'));
      setVistoriasRealizadas(listVistorias);
      setIntervencoes(listIntervencoes);
      
      if (listFiscais.length > 0 && !fiscalSelecionado) {
        setFiscalSelecionado(listFiscais[0].id);
      }
    } catch (err) {
      console.error("Erro ao carregar painel do fiscal:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSubmeterLaudo = async (e) => {
    e.preventDefault();
    if (!fiscalSelecionado) {
      alert("Por favor, selecione seu usuário Fiscal!");
      return;
    }
    if (!ocorrenciaSelecionada) {
      alert("Selecione uma ocorrência para vistoriar!");
      return;
    }
    if (!laudoInput) {
      alert("Escreva o laudo de vistoria!");
      return;
    }

    try {
      setEnviandoLaudo(true);
      await VistoriaService.criar({
        id_ocorrencia: ocorrenciaSelecionada.id,
        id_fiscal: fiscalSelecionado,
        laudo: laudoInput,
        prazo_adequacao: prazoInput || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      setLaudoInput('');
      setPrazoInput('');
      setOcorrenciaSelecionada(null);
      await carregarDados();
      alert("Vistoria e Laudo Técnico registrados com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar vistoria.");
    } finally {
      setEnviandoLaudo(false);
    }
  };

  const handleSubmeterIntervencao = async (e, idVistoria) => {
    e.preventDefault();
    if (!equipeSelecionada) {
      alert("Selecione uma equipe de reparo!");
      return;
    }

    try {
      setEnviandoIntervencao(true);
      await IntervencaoService.criar({
        id_vistoria: idVistoria,
        id_equipe: equipeSelecionada,
        custo_estimado: custoInput || 1500,
        descricao: descIntervencao || "Reparo físico na calçada"
      });
      
      setEquipeSelecionada('');
      setCustoInput('');
      setDescIntervencao('');
      await carregarDados();
      alert("Intervenção cadastrada e equipe de reparo acionada!");
    } catch (err) {
      console.error(err);
    } finally {
      setEnviandoIntervencao(false);
    }
  };

  const handleConcluirReparo = async (idIntervencao, idOcorrencia) => {
    try {
      await IntervencaoService.concluir(idIntervencao, idOcorrencia);
      await carregarDados();
      alert("Parabéns! Reparo da calçada concluído física e logicamente no banco de dados.");
    } catch (err) {
      console.error(err);
    }
  };

  if (carregando) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Acessando base de fiscalização...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Painel de Fiscalização Municipal</h2>
          <p style={styles.subtitle}>Gerencie laudos técnicos de vistorias e delegue intervenções para equipes</p>
        </div>

        {/* Fiscal Login Mock Selector */}
        <div style={styles.fiscalSelectorWrapper}>
          <User size={16} color="#10b981" style={{ marginRight: '8px' }} />
          <select 
            value={fiscalSelecionado} 
            onChange={(e) => setFiscalSelecionado(e.target.value)}
            style={styles.fiscalSelect}
          >
            {fiscais.map(f => (
              <option key={f.id} value={f.id}>Fiscal: {f.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={styles.tabsRow}>
        <button 
          onClick={() => setAbaAtiva('pendentes')}
          style={{ ...styles.tabBtn, ...(abaAtiva === 'pendentes' ? styles.tabBtnActive : {}) }}
        >
          Ocorrências Pendentes de Vistoria ({ocorrenciasPendentes.length})
        </button>
        <button 
          onClick={() => setAbaAtiva('realizadas')}
          style={{ ...styles.tabBtn, ...(abaAtiva === 'realizadas' ? styles.tabBtnActive : {}) }}
        >
          Histórico de Vistorias ({vistoriasRealizadas.length})
        </button>
      </div>

      {/* Main Layout Grid */}
      {abaAtiva === 'pendentes' ? (
        <div style={styles.dashboardGrid}>
          
          {/* List of pending incidents */}
          <div className="glass-card" style={styles.leftPane}>
            <h3 style={styles.paneTitle}>Selecione uma Calçada para Vistoriar</h3>
            <div style={styles.ocorrenciasList}>
              {ocorrenciasPendentes.map(oc => {
                const isSelected = ocorrenciaSelecionada && ocorrenciaSelecionada.id === oc.id;
                return (
                  <div 
                    key={oc.id} 
                    onClick={() => setOcorrenciaSelecionada(oc)}
                    style={{
                      ...styles.ocorrenciaItem,
                      ...(isSelected ? styles.ocorrenciaItemActive : {})
                    }}
                  >
                    <div style={styles.ocorrenciaItemHeader}>
                      <span style={styles.ocorrenciaRua}>{oc.obstaculo.rua.nome}</span>
                      <span style={{
                        ...styles.miniBadge,
                        color: oc.status === 'ABERTO' ? '#ef4444' : '#f59e0b',
                        backgroundColor: oc.status === 'ABERTO' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)'
                      }}>
                        {oc.status}
                      </span>
                    </div>
                    <p style={styles.ocorrenciaDesc}>"{oc.descricao.substring(0, 80)}..."</p>
                  </div>
                );
              })}
              {ocorrenciasPendentes.length === 0 && (
                <p style={styles.noDataText}>Não existem ocorrências pendentes no momento! Ótimo trabalho.</p>
              )}
            </div>
          </div>

          {/* Form to submit Vistoria */}
          <div className="glass-card" style={styles.rightPane}>
            {ocorrenciaSelecionada ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <ShieldCheck size={22} color="#10b981" style={{ marginRight: '10px' }} />
                  <h3 style={{ fontSize: '18px', color: '#f8fafc' }}>Registrar Vistoria Fiscal</h3>
                </div>

                <div style={styles.detailsBox}>
                  <p style={{ fontSize: '14px', color: '#f8fafc', fontWeight: '600' }}>{ocorrenciaSelecionada.obstaculo.rua.nome}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>{ocorrenciaSelecionada.obstaculo.bairro.nome}</p>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px', fontStyle: 'italic' }}>
                    "{ocorrenciaSelecionada.descricao}"
                  </p>
                </div>

                <form onSubmit={handleSubmeterLaudo} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Laudo Técnico (Diagnóstico do Fiscal)</label>
                    <textarea 
                      value={laudoInput}
                      onChange={(e) => setLaudoInput(e.target.value)}
                      placeholder="Descreva as irregularidades encontradas na calçada, infrações de acessibilidade e o que deve ser resolvido..."
                      style={styles.textarea}
                      rows={5}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Prazo de Adequação / Resolução</label>
                    <input 
                      type="date"
                      value={prazoInput}
                      onChange={(e) => setPrazoInput(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>

                  <button type="submit" disabled={enviandoLaudo} style={styles.btnSubmit}>
                    {enviandoLaudo ? "Salvando Laudo..." : "Salvar Laudo e Atualizar Status"}
                  </button>
                </form>
              </div>
            ) : (
              <div style={styles.noSelectState}>
                <FileText size={48} color="#64748b" style={{ marginBottom: '16px' }} />
                <h3>Nenhuma Calçada Selecionada</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Selecione um relato na lista à esquerda para começar a fiscalização.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Historical view of inspections + maintenance allocation */
        <div style={styles.historyList}>
          {vistoriasRealizadas.map((v) => {
            const correspondente = ocorrenciasPendentes.concat(ocorrenciasFiltradasMock(ocorrencias)).find(o => o.id === v.id_ocorrencia);
            const intervencaoDaVistoria = intervencoes.find(i => i.id_vistoria === v.id);
            
            return (
              <div key={v.id} className="glass-card" style={styles.historyCard}>
                <div style={styles.historyCardHeader}>
                  <div>
                    <h4 style={styles.historyStreet}>
                      {correspondente ? correspondente.obstaculo.rua.nome : "Calçada Registrada"}
                    </h4>
                    <p style={styles.historyBairro}>
                      Fiscal: {v.fiscal.nome} • Vistoriado em {new Date(v.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span style={styles.historyBadge}>VISTORIADA</span>
                </div>

                <div style={styles.historyLaudoBox}>
                  <span style={styles.laudoTitle}>Laudo Fiscal Técnico:</span>
                  <p style={styles.laudoText}>"{v.laudo}"</p>
                </div>

                {/* Sub-Workflow: Maintenance Interventions */}
                <div style={styles.interventionSection}>
                  {intervencaoDaVistoria ? (
                    <div style={styles.activeInterventionBox}>
                      <div style={styles.intervHeader}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Wrench size={16} color="#3b82f6" style={{ marginRight: '6px' }} />
                          <span style={styles.intervTitle}>Equipe Acionada: {obterNomeEquipe(intervencaoDaVistoria.id_equipe)}</span>
                        </div>
                        <span 
                          style={{
                            ...styles.miniBadge,
                            backgroundColor: intervencaoDaVistoria.status === 'CONCLUIDO' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: intervencaoDaVistoria.status === 'CONCLUIDO' ? '#10b981' : '#3b82f6'
                          }}
                        >
                          {intervencaoDaVistoria.status}
                        </span>
                      </div>
                      
                      <p style={styles.intervDesc}>"{intervencaoDaVistoria.descricao}"</p>
                      
                      <div style={styles.intervMetaRow}>
                        <div style={styles.metaItem}>
                          <DollarSign size={12} style={{ marginRight: '4px' }} />
                          <span>Custo Estimado: <strong>R$ {intervencaoDaVistoria.custo_estimado.toFixed(2)}</strong></span>
                        </div>
                        {intervencaoDaVistoria.status !== 'CONCLUIDO' && correspondente && (
                          <button 
                            onClick={() => handleConcluirReparo(intervencaoDaVistoria.id, correspondente.id)}
                            style={styles.btnConcluirObra}
                          >
                            <CheckCircle2 size={14} style={{ marginRight: '6px' }} />
                            Marcar Reparo como Concluído
                          </button>
                        )}
                        {intervencaoDaVistoria.status === 'CONCLUIDO' && (
                          <div style={{ ...styles.metaItem, color: '#10b981' }}>
                            <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                            <span>Reparado em: {new Date(intervencaoDaVistoria.data_conclusao).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Form to delegate active team */
                    <div style={styles.assignInterventionBox}>
                      <span style={styles.assignTitle}>Delegar Equipe de Zeladoria Municipal / Obras</span>
                      <form onSubmit={(e) => handleSubmeterIntervencao(e, v.id)} style={styles.assignForm}>
                        <div style={styles.assignGrid}>
                          <select 
                            value={equipeSelecionada}
                            onChange={(e) => setEquipeSelecionada(e.target.value)}
                            style={styles.selectMini}
                            required
                          >
                            <option value="">-- Selecione a Equipe --</option>
                            {equipes.map(eq => (
                              <option key={eq.id} value={eq.id}>{eq.nome} ({eq.especialidade})</option>
                            ))}
                          </select>
                          <input 
                            type="number"
                            placeholder="Custo estimado (R$)"
                            value={custoInput}
                            onChange={(e) => setCustoInput(e.target.value)}
                            style={styles.inputMini}
                            required
                          />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Instruções para o reparo físico da calçada..."
                          value={descIntervencao}
                          onChange={(e) => setDescIntervencao(e.target.value)}
                          style={styles.inputMiniLarge}
                          required
                        />
                        <button type="submit" style={styles.btnAcionarEquipe}>
                          <Plus size={14} style={{ marginRight: '4px' }} />
                          Acionar Equipe
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
          {vistoriasRealizadas.length === 0 && (
            <div className="glass-card" style={styles.emptyState}>
              <Clock size={48} color="#64748b" style={{ marginBottom: '16px' }} />
              <h3>Nenhuma vistoria no histórico</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Os fiscais ainda não registraram vistorias no sistema.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// Helpers locais
const ocorrenciasFiltradasMock = (lista) => {
  return lista;
};

const obterNomeEquipe = (idEquipe) => {
  if (idEquipe === 'eq1') return 'Equipe Pavimentação Centro';
  if (idEquipe === 'eq2') return 'Equipe Zeladoria Sé';
  return 'Equipe Reparos Elétricos Leste';
};

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
  fiscalSelectorWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '8px 16px',
    borderRadius: '12px',
  },
  fiscalSelect: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
  },
  tabsRow: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1px',
    marginBottom: '24px',
  },
  tabBtn: {
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    position: 'relative',
    transition: 'color 0.2s',
  },
  tabBtnActive: {
    color: '#10b981',
    borderBottom: '2px solid #10b981',
  },
  dashboardGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  leftPane: {
    flex: 1,
    minWidth: '320px',
    maxHeight: '560px',
    overflowY: 'auto',
  },
  paneTitle: {
    fontSize: '16px',
    color: '#f8fafc',
    marginBottom: '16px',
  },
  ocorrenciasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  ocorrenciaItem: {
    padding: '16px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  ocorrenciaItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  ocorrenciaItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  ocorrenciaRua: {
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '600',
  },
  miniBadge: {
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '8px',
    textTransform: 'uppercase',
  },
  ocorrenciaDesc: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  noDataText: {
    color: '#64748b',
    fontSize: '13px',
    textAlign: 'center',
    padding: '40px 0',
  },
  rightPane: {
    flex: 1.2,
    minWidth: '320px',
    minHeight: '400px',
  },
  noSelectState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    fontSize: '14px',
    textAlign: 'center',
  },
  detailsBox: {
    padding: '16px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  input: {
    padding: '12px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '13px',
    outline: 'none',
  },
  textarea: {
    padding: '12px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '13px',
    outline: 'none',
    resize: 'vertical',
  },
  btnSubmit: {
    padding: '12px 20px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
    marginTop: '8px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  historyCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  historyCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyStreet: {
    fontSize: '16px',
    color: '#f8fafc',
  },
  historyBairro: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  historyBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: '4px 10px',
    borderRadius: '12px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  historyLaudoBox: {
    padding: '16px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '10px',
  },
  laudoTitle: {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
    display: 'block',
    marginBottom: '6px',
  },
  laudoText: {
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: '1.5',
  },
  interventionSection: {
    borderTop: '1px solid rgba(255,255,255,0.04)',
    paddingTop: '16px',
  },
  activeInterventionBox: {
    padding: '16px',
    backgroundColor: 'rgba(59, 130, 246, 0.02)',
    border: '1px solid rgba(59, 130, 246, 0.08)',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  intervHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intervTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#3b82f6',
  },
  intervDesc: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.4',
    fontStyle: 'italic',
  },
  intervMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '10px',
    fontSize: '11px',
    color: '#64748b',
    flexWrap: 'wrap',
    gap: '10px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
  },
  btnConcluirObra: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  assignInterventionBox: {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px dashed rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  assignTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  assignForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  assignGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  selectMini: {
    padding: '10px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '12px',
    outline: 'none',
  },
  inputMini: {
    padding: '10px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '12px',
    outline: 'none',
  },
  inputMiniLarge: {
    padding: '10px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '12px',
    outline: 'none',
  },
  btnAcionarEquipe: {
    alignSelf: 'flex-end',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    textAlign: 'center',
    color: '#cbd5e1',
  }
};
