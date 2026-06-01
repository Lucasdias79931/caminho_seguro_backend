import React, { useEffect, useState } from 'react';
import { OcorrenciaService, RuaService } from '../services/api';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  X, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  HelpCircle,
  FileSearch,
  Sparkles
} from 'lucide-react';

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [ruas, setRuas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estado de Filtros e Busca
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  
  // Estado do Modal de Cadastro
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [form, setForm] = useState({
    nome_cidadao: '',
    email_cidadao: '',
    id_rua: '',
    descricao: '',
    titulo_obstaculo: 'Calçamento Danificado',
    pavimentacao: 'Regular',
    iluminacao: 'Boa',
    saneamento: 'Adequado',
    zeladoria: 'Regular',
    id_orgao: 'o1', // Padrão SIURB
    imagem_url: ''
  });

  const carregarOcorrencias = async () => {
    try {
      setCarregando(true);
      const dados = await OcorrenciaService.listar();
      setOcorrencias(dados);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarOcorrencias();
    
    // Carrega ruas para o dropdown do formulário
    RuaService.listar().then(setRuas).catch(console.error);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result);
        setForm(prev => ({ ...prev, imagem_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_rua || !form.descricao) {
      alert("Por favor, selecione a rua e descreva o obstáculo!");
      return;
    }
    
    try {
      setEnviando(true);
      await OcorrenciaService.cadastrar(form);
      
      // Reseta form e fecha modal
      setForm({
        nome_cidadao: '',
        email_cidadao: '',
        id_rua: '',
        descricao: '',
        titulo_obstaculo: 'Calçamento Danificado',
        pavimentacao: 'Regular',
        iluminacao: 'Boa',
        saneamento: 'Adequado',
        zeladoria: 'Regular',
        id_orgao: 'o1',
        imagem_url: ''
      });
      setImagemPreview(null);
      setModalAberto(false);
      
      // Recarrega listagem
      await carregarOcorrencias();
    } catch (err) {
      console.error("Erro ao relatar obstáculo:", err);
      alert("Erro ao cadastrar ocorrência.");
    } finally {
      setEnviando(false);
    }
  };

  // Filtragem local dos dados
  const ocorrenciasFiltradas = ocorrencias.filter(oc => {
    const atendeFiltro = filtroStatus === 'TODOS' || oc.status === filtroStatus;
    const stringBusca = busca.toLowerCase();
    const atendeBusca = 
      oc.descricao.toLowerCase().includes(stringBusca) || 
      oc.obstaculo.rua.nome.toLowerCase().includes(stringBusca) ||
      oc.obstaculo.bairro.nome.toLowerCase().includes(stringBusca);
      
    return atendeFiltro && atendeBusca;
  });

  const getStatusStyle = (status) => {
    if (status === "ABERTO") return { bg: 'rgba(239, 68, 68, 0.1)', txt: '#ef4444', icon: AlertTriangle };
    if (status === "EM_VISTORIA") return { bg: 'rgba(245, 158, 11, 0.1)', txt: '#f59e0b', icon: FileSearch };
    return { bg: 'rgba(16, 185, 129, 0.1)', txt: '#10b981', icon: CheckCircle2 };
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title} className="gradient-text">Ocorrências Relatadas</h2>
          <p style={styles.subtitle}>Gerencie e relate novos pontos de calçadas hostis e problemas de acessibilidade</p>
        </div>
        <button onClick={() => setModalAberto(true)} style={styles.btnRelatar}>
          <Plus size={18} style={{ marginRight: '6px' }} />
          <span>Relatar Novo Obstáculo</span>
        </button>
      </div>

      {/* Filters and search card */}
      <div className="glass-card" style={styles.filterCard}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#64748b" style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Pesquisar por rua, bairro ou descrição..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterButtonGroup}>
          {['TODOS', 'ABERTO', 'EM_VISTORIA', 'RESOLVIDO'].map(status => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              style={{
                ...styles.filterBtn,
                ...(filtroStatus === status ? styles.filterBtnActive : {})
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Table listing */}
      {carregando ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '16px', color: '#94a3b8' }}>Carregando ocorrências...</p>
        </div>
      ) : ocorrenciasFiltradas.length > 0 ? (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Localização</th>
                  <th style={styles.th}>Descrição do Obstáculo</th>
                  <th style={styles.th}>Gravidade (Pavimento)</th>
                  <th style={styles.th}>Data de Criação</th>
                </tr>
              </thead>
              <tbody>
                {ocorrenciasFiltradas.map((oc) => {
                  const statusInfo = getStatusStyle(oc.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={oc.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <span 
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.txt,
                            border: `1px solid ${statusInfo.txt}20`
                          }}
                        >
                          <StatusIcon size={12} style={{ marginRight: '4px' }} />
                          {oc.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.locationContainer}>
                          <span style={styles.streetText}>{oc.obstaculo.rua.nome}</span>
                          <span style={styles.bairroText}>{oc.obstaculo.bairro.nome}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.descContainer} title={oc.descricao}>
                          {oc.descricao}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span 
                          style={{
                            ...styles.gravidadeBadge,
                            color: oc.obstaculo.pavimentacao === 'Destruída' || oc.obstaculo.pavimentacao === 'Precária' ? '#ef4444' : '#94a3b8',
                            backgroundColor: oc.obstaculo.pavimentacao === 'Destruída' || oc.obstaculo.pavimentacao === 'Precária' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.01)'
                          }}
                        >
                          {oc.obstaculo.pavimentacao}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.dateContainer}>
                          <Calendar size={12} style={{ marginRight: '6px' }} />
                          <span>{new Date(oc.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={styles.emptyState}>
          <HelpCircle size={48} color="#64748b" style={{ marginBottom: '16px' }} />
          <h3>Nenhuma ocorrência encontrada</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Tente alterar a pesquisa ou cadastrar um novo relato</p>
        </div>
      )}

      {/* Modal - Cadastro de Nova Ocorrência */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div className="glass-card" style={styles.modalContent}>
            
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Sparkles size={20} color="#10b981" style={{ marginRight: '10px' }} />
                <h3 style={{ fontSize: '20px', color: '#f8fafc' }}>Relatar Obstáculo Urbano</h3>
              </div>
              <button onClick={() => setModalAberto(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={styles.form}>
              
              <div style={styles.formGrid}>
                {/* Nome do Cidadão */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Seu Nome</label>
                  <input 
                    type="text" 
                    name="nome_cidadao" 
                    value={form.nome_cidadao} 
                    onChange={handleInputChange} 
                    placeholder="Ex: Luís Fernando" 
                    style={styles.input}
                    required
                  />
                </div>

                {/* Email do Cidadão */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Seu E-mail</label>
                  <input 
                    type="email" 
                    name="email_cidadao" 
                    value={form.email_cidadao} 
                    onChange={handleInputChange} 
                    placeholder="Ex: luis@email.com" 
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Seleção da Rua (Chave Estrangeira do Banco) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Selecione a Rua / Endereço</label>
                <select 
                  name="id_rua" 
                  value={form.id_rua} 
                  onChange={handleInputChange} 
                  style={styles.select}
                  required
                >
                  <option value="">-- Selecione uma Rua --</option>
                  {ruas.map(r => (
                    <option key={r.id} value={r.id}>{r.nome} (CEP: {r.cep})</option>
                  ))}
                </select>
              </div>

              {/* Descrição do Obstáculo */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição Detalhada do Problema</label>
                <textarea 
                  name="descricao" 
                  value={form.descricao} 
                  onChange={handleInputChange} 
                  placeholder="Descreva o que está impedindo o fluxo na calçada (buracos, degraus, entulho, poste no caminho...)" 
                  style={styles.textarea}
                  rows={3}
                  required
                />
              </div>

              {/* Registro de Imagem por Câmera */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Registrar Foto do Local (Câmera do Celular)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleImageChange} 
                  style={styles.fileInput}
                />
                {imagemPreview && (
                  <div style={styles.imagePreviewContainer}>
                    <img src={imagemPreview} alt="Obstáculo" style={styles.imagePreview} />
                    <button 
                      type="button" 
                      onClick={() => { setImagemPreview(null); setForm(prev => ({ ...prev, imagem_url: '' })); }} 
                      style={styles.btnRemoveImage}
                    >
                      Remover Foto
                    </button>
                  </div>
                )}
              </div>

              {/* Atributos da Calçada */}
              <h4 style={styles.formSubtitle}>Diagnóstico Físico da Calçada</h4>
              
              <div style={styles.formGridFour}>
                <div style={styles.formGroup}>
                  <label style={styles.labelMini}>Pavimento</label>
                  <select name="pavimentacao" value={form.pavimentacao} onChange={handleInputChange} style={styles.selectMini}>
                    <option value="Boa">Boa</option>
                    <option value="Regular">Regular</option>
                    <option value="Precária">Precária</option>
                    <option value="Destruída">Destruída</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.labelMini}>Iluminação</label>
                  <select name="iluminacao" value={form.iluminacao} onChange={handleInputChange} style={styles.selectMini}>
                    <option value="Boa">Boa</option>
                    <option value="Regular">Regular</option>
                    <option value="Ruim">Ruim</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.labelMini}>Zeladoria</label>
                  <select name="zeladoria" value={form.zeladoria} onChange={handleInputChange} style={styles.selectMini}>
                    <option value="Adequada">Adequada</option>
                    <option value="Regular">Regular</option>
                    <option value="Precária">Precária</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.labelMini}>Saneamento</label>
                  <select name="saneamento" value={form.saneamento} onChange={handleInputChange} style={styles.selectMini}>
                    <option value="Adequado">Adequado</option>
                    <option value="Prejudicado">Prejudicado</option>
                    <option value="Sem bueiro/aberto">Sem bueiro</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={styles.formActions}>
                <button type="button" onClick={() => setModalAberto(false)} style={styles.btnCancel}>Cancelar</button>
                <button type="submit" disabled={enviando} style={styles.btnSubmit}>
                  {enviando ? "Registrando..." : "Enviar Relato"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
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
  btnRelatar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
  },
  filterCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    padding: '16px 24px',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '250px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 42px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  filterButtonGroup: {
    display: 'flex',
    gap: '8px',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    color: '#10b981',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(16, 185, 129, 0.1)',
    borderTop: '3px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  th: {
    padding: '16px 24px',
    fontWeight: '600',
    color: '#64748b',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background-color 0.2s ease',
  },
  td: {
    padding: '16px 24px',
    color: '#cbd5e1',
    verticalAlign: 'middle',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  locationContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  streetText: {
    color: '#f8fafc',
    fontWeight: '500',
  },
  bairroText: {
    color: '#64748b',
    fontSize: '12px',
    marginTop: '2px',
  },
  descContainer: {
    maxWidth: '300px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#94a3b8',
  },
  gravidadeBadge: {
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
  },
  dateContainer: {
    display: 'flex',
    alignItems: 'center',
    color: '#64748b',
    fontSize: '13px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    textAlign: 'center',
    color: '#cbd5e1',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '580px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#cbd5e1',
  },
  input: {
    padding: '12px 14px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    padding: '12px 14px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '12px 14px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
  },
  formSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
    marginTop: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '8px',
  },
  formGridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '12px',
  },
  labelMini: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  selectMini: {
    padding: '8px 10px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    color: '#f8fafc',
    fontSize: '12px',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
  },
  btnCancel: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  btnSubmit: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
  },
  fileInput: {
    padding: '8px 10px',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    color: '#cbd5e1',
    fontSize: '12px',
    outline: 'none',
    cursor: 'pointer',
  },
  imagePreviewContainer: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px dashed rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
  },
  imagePreview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  btnRemoveImage: {
    padding: '6px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    transition: 'all 0.2s',
  }
};
