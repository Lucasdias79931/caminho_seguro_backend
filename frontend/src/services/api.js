// src/services/api.js

// Controle global de ambiente (Chaveador Mocks / API Real)
const USAR_API_REAL = false; 
const SIMULAR_DELAY = false; // Mude para false se quiser remover totalmente o tempo de carregamento fake!
const API_URL = "http://localhost:8000/api";

// ----------------------------------------------------
// BANCO DE DADOS EM MEMÓRIA (MOCK DATA)
// Mapeado de acordo com o esquema create_db.sql
// ----------------------------------------------------

const MOCK_BAIRROS = [
  { id: "b1", nome: "Bela Vista", descricao: "Zona Central, alta circulação de pedestres", status: "ATIVO" },
  { id: "b2", nome: "Consolação", descricao: "Área universitária e comercial", status: "ATIVO" },
  { id: "b3", nome: "Pinheiros", descricao: "Zona Oeste, residencial e corporativa", status: "ATIVO" },
  { id: "b4", nome: "Sé (Centro)", descricao: "Centro histórico, calçadões antigos", status: "ATIVO" },
  { id: "b5", nome: "Vila Mariana", descricao: "Zona Sul, muitas clínicas e hospitais", status: "ATIVO" }
];

const MOCK_RUAS = [
  { id: "r1", id_bairro: "b1", cep: "01310-100", nome: "Avenida Paulista", descricao: "Próximo ao metrô Trianon" },
  { id: "r2", id_bairro: "b1", cep: "01311-200", nome: "Rua São Carlos do Pinhal", descricao: "Atrás do Shopping Cidade São Paulo" },
  { id: "r3", id_bairro: "b2", cep: "01301-000", nome: "Rua Augusta", descricao: "Lado Jardins" },
  { id: "r4", id_bairro: "b3", cep: "05407-002", nome: "Rua dos Pinheiros", descricao: "Próximo à estação Fradique Coutinho" },
  { id: "r5", id_bairro: "b4", cep: "01001-000", nome: "Rua Direita", descricao: "Calçadão de pedestres" },
  { id: "r6", id_bairro: "b5", cep: "04012-000", nome: "Rua Domingos de Morais", descricao: "Perto do metrô Vila Mariana" }
];

const MOCK_FISCAIS = [
  { id: "f1", matricula: "FISC-2026-01", nome: "Carlos Henrique Souza", email: "carlos.fiscal@prefeitura.sp.gov.br", status: "ATIVO" },
  { id: "f2", matricula: "FISC-2026-02", nome: "Mariana Alencar", email: "mariana.fiscal@prefeitura.sp.gov.br", status: "ATIVO" },
  { id: "f3", matricula: "FISC-2026-03", nome: "Roberto Ramos Costa", email: "roberto.fiscal@prefeitura.sp.gov.br", status: "ATIVO" }
];

const MOCK_ORGAOS = [
  { id: "o1", nome: "Secretaria Municipal de Infraestrutura Urbana (SIURB)", telefone: "1131138000", status: "ATIVO" },
  { id: "o2", nome: "Subprefeitura da Sé", telefone: "1132912200", status: "ATIVO" },
  { id: "o3", nome: "Ilume (Departamento de Iluminação Pública)", telefone: "1133967000", status: "ATIVO" }
];

const MOCK_EQUIPES = [
  { id: "eq1", id_orgao: "o1", nome: "Equipe Pavimentação Centro", especialidade: "Reforma de Calçadas e Asfalto", quantidade_membros: 6, status: "ATIVO" },
  { id: "eq2", id_orgao: "o2", nome: "Equipe Zeladoria Sé", especialidade: "Desobstrução e Limpeza", quantidade_membros: 4, status: "ATIVO" },
  { id: "eq3", id_orgao: "o3", nome: "Equipe Reparos Elétricos Leste", especialidade: "Postes e Iluminação", quantidade_membros: 3, status: "ATIVO" }
];

// Ocorrências registradas por Cidadãos
let MOCK_OCORRENCIAS = [
  {
    id: "oc1",
    id_obstaculo: "ob1",
    id_cidadao: "c1",
    id_orgao: "o1",
    descricao: "Calçada com blocos de concreto totalmente soltos e buraco de 1 metro na via tátil, impedindo passagem de cadeirantes e deficientes visuais.",
    status: "ABERTO",
    imagem_url: "https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-05-25T10:00:00Z",
    updated_at: "2026-05-25T10:00:00Z",
    obstaculo: {
      id: "ob1",
      id_rua: "r1",
      descricao: "Piso tátil quebrado e calçamento destruído",
      pavimentacao: "Destruída",
      iluminacao: "Regular",
      saneamento: "Adequado",
      zeladoria: "Precária",
      rua: MOCK_RUAS[0], // Av Paulista
      bairro: MOCK_BAIRROS[0]
    },
    cidadao: { nome: "Luís Fernando da Silva", email: "luis.pedestre@gmail.com" }
  },
  {
    id: "oc2",
    id_obstaculo: "ob2",
    id_cidadao: "c2",
    id_orgao: "o3",
    descricao: "Poste metálico de iluminação instalado exatamente no centro da rampa de acessibilidade da faixa de pedestres, obstruindo a travessia de cadeirantes.",
    status: "EM_VISTORIA",
    imagem_url: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-05-27T14:30:00Z",
    updated_at: "2026-05-28T09:00:00Z",
    obstaculo: {
      id: "ob2",
      id_rua: "r3",
      descricao: "Obstáculo fixo (poste) na rampa de acessibilidade",
      pavimentacao: "Boa",
      iluminacao: "Ruim",
      saneamento: "Adequado",
      zeladoria: "Regular",
      rua: MOCK_RUAS[2], // Rua Augusta
      bairro: MOCK_BAIRROS[1]
    },
    cidadao: { nome: "Aline Rocha Duarte", email: "aline.rocha@hotmail.com" }
  },
  {
    id: "oc3",
    id_obstaculo: "ob3",
    id_cidadao: "c3",
    id_orgao: "o1",
    descricao: "Entulho de obras residenciais despejado sobre a calçada há duas semanas, forçando os pedestres a caminharem pela rua dividindo espaço com ônibus.",
    status: "RESOLVIDO",
    created_at: "2026-05-20T08:15:00Z",
    updated_at: "2026-05-24T17:00:00Z",
    obstaculo: {
      id: "ob3",
      id_rua: "r4",
      descricao: "Obstrução física de entulho de construção civil",
      pavimentacao: "Boa",
      iluminacao: "Boa",
      saneamento: "Adequado",
      zeladoria: "Inadequada",
      rua: MOCK_RUAS[3], // Rua dos Pinheiros
      bairro: MOCK_BAIRROS[2]
    },
    cidadao: { nome: "Roberto de Oliveira Melo", email: "roberto.melo@yahoo.com" }
  },
  {
    id: "oc4",
    id_obstaculo: "ob4",
    id_cidadao: "c4",
    id_orgao: "o2",
    descricao: "Degrau de 40cm entre a soleira do estabelecimento e a calçada pública antiga, além de bueiro quebrado sem tampa logo em frente.",
    status: "ABERTO",
    created_at: "2026-05-29T11:45:00Z",
    updated_at: "2026-05-29T11:45:00Z",
    obstaculo: {
      id: "ob4",
      id_rua: "r5",
      descricao: "Degrau irregular excessivo e bueiro sem tampa",
      pavimentacao: "Precária",
      iluminacao: "Regular",
      saneamento: "Sem bueiro/aberto",
      zeladoria: "Precária",
      rua: MOCK_RUAS[4], // Rua Direita
      bairro: MOCK_BAIRROS[3]
    },
    cidadao: { nome: "Glória Maria Pires", email: "gloria.pires@outlook.com" }
  }
];

let MOCK_VISTORIAS = [
  {
    id: "v1",
    id_ocorrencia: "oc2",
    id_fiscal: "f1",
    laudo: "Vistoria realizada no local. Constatou-se a obstrução grave do fluxo de pedestres e cadeirantes devido à instalação irregular do poste sobre a faixa de travessia. Notificado órgão de iluminação municipal para remanejamento imediato.",
    prazo_adequacao: "2026-06-10T12:00:00Z",
    status: "CONFIRMADO",
    created_at: "2026-05-28T09:00:00Z",
    fiscal: MOCK_FISCAIS[0]
  },
  {
    id: "v2",
    id_ocorrencia: "oc3",
    id_fiscal: "f2",
    laudo: "Zeladoria identificou o proprietário da obra. Multa aplicada e prazo de 24h para remoção completa do entulho sob pena de lacração. Proprietário removeu o material de forma satisfatória.",
    prazo_adequacao: "2026-05-22T17:00:00Z",
    status: "RESOLVIDO",
    created_at: "2026-05-21T10:00:00Z",
    fiscal: MOCK_FISCAIS[1]
  }
];

let MOCK_INTERVENCOES = [
  {
    id: "int1",
    id_vistoria: "v2",
    id_equipe: "eq2",
    custo_estimado: 450.00,
    data_registro: "2026-05-21T11:00:00Z",
    data_conclusao: "2026-05-24T17:00:00Z",
    status: "CONCLUIDO",
    descricao: "Acompanhamento da desobstrução e varrição final da calçada com equipe de zeladoria."
  }
];

// Helper para simular delay assíncrono (respeita a flag global SIMULAR_DELAY)
const delay = (ms = 600) => SIMULAR_DELAY ? new Promise(resolve => setTimeout(resolve, ms / 2)) : Promise.resolve();

// ----------------------------------------------------
// EXPORTAÇÃO DOS SERVIÇOS
// ----------------------------------------------------

export const BairroService = {
  listar: async () => {
    if (USAR_API_REAL) {
      const res = await fetch(`${API_URL}/bairros`);
      return await res.json();
    }
    await delay();
    return [...MOCK_BAIRROS];
  },
  obterEstatisticas: async () => {
    await delay(300);
    // Retorna dados estatísticos agregados para os gráficos
    return MOCK_BAIRROS.map(b => {
      const ocorrenciasDoBairro = MOCK_OCORRENCIAS.filter(oc => oc.obstaculo.bairro.id === b.id);
      return {
        bairro: b.nome,
        total: ocorrenciasDoBairro.length,
        abertas: ocorrenciasDoBairro.filter(oc => oc.status === "ABERTO").length,
        resolvidas: ocorrenciasDoBairro.filter(oc => oc.status === "RESOLVIDO").length
      };
    });
  }
};

export const RuaService = {
  listar: async () => {
    if (USAR_API_REAL) {
      const res = await fetch(`${API_URL}/ruas`);
      return await res.json();
    }
    await delay();
    return [...MOCK_RUAS];
  }
};

export const FiscalService = {
  listar: async () => {
    await delay();
    return [...MOCK_FISCAIS];
  }
};

export const EquipeService = {
  listar: async () => {
    await delay();
    return [...MOCK_EQUIPES];
  }
};

export const OcorrenciaService = {
  listar: async () => {
    if (USAR_API_REAL) {
      const res = await fetch(`${API_URL}/ocorrencias`);
      return await res.json();
    }
    await delay(800); // Maior latência na listagem principal
    return [...MOCK_OCORRENCIAS].reverse(); // Recentes primeiro
  },
  
  cadastrar: async (dados) => {
    if (USAR_API_REAL) {
      const res = await fetch(`${API_URL}/ocorrencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
      return await res.json();
    }
    
    await delay(700);
    const ruaSelecionada = MOCK_RUAS.find(r => r.id === dados.id_rua) || MOCK_RUAS[0];
    const bairroSelecionado = MOCK_BAIRROS.find(b => b.id === ruaSelecionada.id_bairro) || MOCK_BAIRROS[0];
    const orgaoSelecionado = MOCK_ORGAOS.find(o => o.id === dados.id_orgao) || MOCK_ORGAOS[0];
    
    const novaOcorrencia = {
      id: `oc-${Date.now()}`,
      id_obstaculo: `ob-${Date.now()}`,
      id_cidadao: `cid-${Math.floor(Math.random() * 1000)}`,
      id_orgao: orgaoSelecionado.id,
      descricao: dados.descricao,
      status: "ABERTO",
      imagem_url: dados.imagem_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      obstaculo: {
        id: `ob-${Date.now()}`,
        id_rua: ruaSelecionada.id,
        descricao: dados.titulo_obstaculo || "Calçada Irregular",
        pavimentacao: dados.pavimentacao || "Regular",
        iluminacao: dados.iluminacao || "Boa",
        saneamento: dados.saneamento || "Adequado",
        zeladoria: dados.zeladoria || "Regular",
        rua: ruaSelecionada,
        bairro: bairroSelecionado
      },
      cidadao: {
        nome: dados.nome_cidadao || "Cidadão Anônimo",
        email: dados.email_cidadao || "anonimo@caminhoseguro.com"
      }
    };
    
    MOCK_OCORRENCIAS.push(novaOcorrencia);
    return novaOcorrencia;
  },

  obterEstatisticasGerais: async () => {
    await delay(400);
    const total = MOCK_OCORRENCIAS.length;
    const abertas = MOCK_OCORRENCIAS.filter(o => o.status === "ABERTO").length;
    const vistoria = MOCK_OCORRENCIAS.filter(o => o.status === "EM_VISTORIA").length;
    const resolvidas = MOCK_OCORRENCIAS.filter(o => o.status === "RESOLVIDO").length;
    
    return {
      total,
      abertas,
      emVistoria: vistoria,
      resolvidas,
      indiceAcessibilidade: Math.round((resolvidas / (total || 1)) * 100)
    };
  }
};

export const VistoriaService = {
  listar: async () => {
    await delay();
    return [...MOCK_VISTORIAS];
  },
  
  criar: async (dados) => {
    if (USAR_API_REAL) {
      const res = await fetch(`${API_URL}/vistorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
      return await res.json();
    }
    
    await delay(600);
    
    const fiscal = MOCK_FISCAIS.find(f => f.id === dados.id_fiscal) || MOCK_FISCAIS[0];
    
    const novaVistoria = {
      id: `v-${Date.now()}`,
      id_ocorrencia: dados.id_ocorrencia,
      id_fiscal: fiscal.id,
      laudo: dados.laudo,
      prazo_adequacao: dados.prazo_adequacao || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "CONFIRMADO",
      created_at: new Date().toISOString(),
      fiscal: fiscal
    };
    
    MOCK_VISTORIAS.push(novaVistoria);
    
    // Atualiza o status da ocorrência para 'EM_VISTORIA' ou o que for apropriado
    const ocorrencia = MOCK_OCORRENCIAS.find(o => o.id === dados.id_ocorrencia);
    if (ocorrencia) {
      ocorrencia.status = "EM_VISTORIA";
      ocorrencia.updated_at = new Date().toISOString();
    }
    
    return novaVistoria;
  },

  obterLaudoPorOcorrencia: async (idOcorrencia) => {
    await delay(300);
    return MOCK_VISTORIAS.find(v => v.id_ocorrencia === idOcorrencia) || null;
  }
};

export const IntervencaoService = {
  listar: async () => {
    await delay();
    return [...MOCK_INTERVENCOES];
  },
  
  criar: async (dados) => {
    await delay(600);
    
    const novaIntervencao = {
      id: `int-${Date.now()}`,
      id_vistoria: dados.id_vistoria,
      id_equipe: dados.id_equipe,
      custo_estimado: parseFloat(dados.custo_estimado) || 1200.00,
      data_registro: new Date().toISOString(),
      data_conclusao: null,
      status: "EM_ANDAMENTO",
      descricao: dados.descricao
    };
    
    MOCK_INTERVENCOES.push(novaIntervencao);
    
    // Opcional: Se criar intervenção já puder marcar ocorrência como andamento/resolvido
    return novaIntervencao;
  },

  concluir: async (idIntervencao, idOcorrencia) => {
    await delay(500);
    const intervencao = MOCK_INTERVENCOES.find(i => i.id === idIntervencao);
    if (intervencao) {
      intervencao.status = "CONCLUIDO";
      intervencao.data_conclusao = new Date().toISOString();
    }
    
    const ocorrencia = MOCK_OCORRENCIAS.find(o => o.id === idOcorrencia);
    if (ocorrencia) {
      ocorrencia.status = "RESOLVIDO";
      ocorrencia.updated_at = new Date().toISOString();
    }
    
    return { intervencao, ocorrencia };
  }
};
