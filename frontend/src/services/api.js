// src/services/api.js

// Controle global de ambiente (Chaveador Mocks / API Real)
const USAR_API_REAL = true; 
const SIMULAR_DELAY = false; // Mude para false se quiser remover totalmente o tempo de carregamento fake!
const API_URL = "http://127.0.0.1:8000/api";

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

let INTERVENCOES_LOCAIS = [];

// Helper para simular delay assíncrono (respeita a flag global SIMULAR_DELAY)
const delay = (ms = 600) => SIMULAR_DELAY ? new Promise(resolve => setTimeout(resolve, ms / 2)) : Promise.resolve();

const requestJson = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!res.ok) {
    const detalhe = await res.text().catch(() => "");
    throw new Error(`Erro HTTP ${res.status} em ${path}: ${detalhe}`);
  }

  return await res.json();
};

const comFallback = async (label, chamadaApi, fallback) => {
  if (USAR_API_REAL) {
    try {
      return await chamadaApi();
    } catch (err) {
      console.warn(`[API] ${label}: usando fallback mock.`, err);
    }
  }

  await delay();
  return typeof fallback === "function" ? fallback() : fallback;
};

const normalizarBairro = (bairro) => ({
  id: bairro.id,
  nome: bairro.nome,
  descricao: bairro.descricao || "",
  status: bairro.status || "ATIVO"
});

const normalizarRua = (rua) => ({
  id: rua.id,
  id_bairro: rua.id_bairro || rua.bairro_id || rua.bairro?.id,
  cep: String(rua.cep || "").trim(),
  nome: rua.nome,
  descricao: rua.descricao || "",
  status: rua.status || "ATIVO",
  bairro_nome: rua.bairro_nome || rua.bairro?.nome
});

const pavimentacaoLabel = (codigo) => {
  if (!codigo) return "Boa";
  if (codigo.includes("BURACO") || codigo.includes("DANIFICADA") || codigo.includes("ABANDONADA")) return "Precária";
  if (codigo.includes("RACHADURA")) return "Regular";
  return "Regular";
};

const iluminacaoLabel = (codigo) => codigo ? "Ruim" : "Boa";

const saneamentoLabel = (codigo) => {
  if (!codigo) return "Adequado";
  if (codigo.includes("SEM_TAMPA")) return "Sem bueiro/aberto";
  return "Prejudicado";
};

const zeladoriaLabel = (codigo) => codigo ? "Precária" : "Adequada";

const diagnosticoObstaculo = (obstaculo = {}) => ({
  pavimentacao: pavimentacaoLabel(obstaculo.pavimentacao),
  iluminacao: iluminacaoLabel(obstaculo.iluminacao),
  saneamento: saneamentoLabel(obstaculo.saneamento),
  zeladoria: zeladoriaLabel(obstaculo.zeladoria)
});

const tipoProblemaPayload = (dados) => {
  if (dados.pavimentacao === "Precária" || dados.pavimentacao === "Destruída") return "pavimentacao";
  if (dados.iluminacao === "Ruim") return "iluminacao";
  if (dados.saneamento && dados.saneamento !== "Adequado") return "saneamento";
  if (dados.zeladoria === "Precária") return "zeladoria";
  return "pavimentacao";
};

const normalizarOcorrencia = (ocorrencia) => {
  const bairro = normalizarBairro(ocorrencia.bairro || ocorrencia.obstaculo?.bairro || {});
  const rua = normalizarRua({ ...(ocorrencia.rua || ocorrencia.obstaculo?.rua || {}), bairro });
  const obstaculoApi = ocorrencia.obstaculo || {};
  const diagnostico = diagnosticoObstaculo(obstaculoApi);

  return {
    id: ocorrencia.id,
    id_obstaculo: ocorrencia.id_obstaculo || obstaculoApi.id,
    id_cidadao: ocorrencia.id_cidadao || ocorrencia.cidadao?.id,
    id_orgao: ocorrencia.id_orgao || ocorrencia.orgao?.id,
    descricao: ocorrencia.descricao || "",
    status: ocorrencia.status || "ABERTO",
    imagem_url: ocorrencia.imagem_url || "",
    created_at: ocorrencia.created_at || ocorrencia.data_criacao,
    updated_at: ocorrencia.updated_at || ocorrencia.data_atualizacao || ocorrencia.data_criacao,
    gravidade: ocorrencia.gravidade || "ALTA",
    tipo_obstaculo: ocorrencia.tipo_obstaculo,
    obstaculo: {
      id: obstaculoApi.id,
      id_rua: obstaculoApi.id_rua || rua.id,
      descricao: obstaculoApi.descricao || ocorrencia.descricao || "",
      ...diagnostico,
      rua,
      bairro
    },
    cidadao: {
      id: ocorrencia.cidadao?.id,
      nome: ocorrencia.cidadao?.nome || "Cidadão",
      email: ocorrencia.cidadao?.email || ""
    },
    orgao: ocorrencia.orgao || null,
    fiscal: ocorrencia.fiscal || null,
    vistoria: ocorrencia.vistoria || null,
    intervencao: ocorrencia.intervencao || null
  };
};

const normalizarVistoria = (vistoria) => ({
  id: vistoria.id,
  id_ocorrencia: vistoria.id_ocorrencia,
  id_fiscal: vistoria.id_fiscal || vistoria.fiscal?.id,
  laudo: vistoria.laudo,
  prazo_adequacao: vistoria.prazo_adequacao,
  status: vistoria.status === "ATIVO" ? "CONFIRMADO" : (vistoria.status || "CONFIRMADO"),
  created_at: vistoria.created_at,
  fiscal: {
    id: vistoria.id_fiscal || vistoria.fiscal?.id,
    nome: vistoria.fiscal_nome || vistoria.fiscal?.nome || "Fiscal Técnico",
    matricula: vistoria.fiscal_matricula || vistoria.fiscal?.matricula || "N/D"
  }
});

const normalizarIntervencao = (intervencao) => ({
  id: intervencao.id,
  id_vistoria: intervencao.id_vistoria,
  id_equipe: intervencao.id_equipe,
  custo_estimado: Number(intervencao.custo_estimado || 0),
  data_registro: intervencao.data_registro,
  data_conclusao: intervencao.data_conclusao,
  status: intervencao.data_conclusao ? "CONCLUIDO" : (intervencao.status === "ATIVO" ? "EM_ANDAMENTO" : intervencao.status),
  descricao: intervencao.descricao || "",
  equipe_nome: intervencao.equipe_nome,
  equipe_especialidade: intervencao.equipe_especialidade,
  orgao_nome: intervencao.orgao_nome
});

// ----------------------------------------------------
// EXPORTAÇÃO DOS SERVIÇOS
// ----------------------------------------------------

export const BairroService = {
  listar: async () => {
    return await comFallback(
      "GET /bairros",
      async () => (await requestJson("/bairros")).map(normalizarBairro),
      () => [...MOCK_BAIRROS]
    );
  },
  obterEstatisticas: async () => {
    return await comFallback(
      "GET /dashboard/bairros-criticos",
      async () => (await requestJson("/dashboard/bairros-criticos")).map(item => ({
        bairro: item.bairro,
        total: item.total_ocorrencias,
        abertas: item.total_ocorrencias,
        resolvidas: 0
      })),
      () => MOCK_BAIRROS.map(b => {
        const ocorrenciasDoBairro = MOCK_OCORRENCIAS.filter(oc => oc.obstaculo.bairro.id === b.id);
        return {
          bairro: b.nome,
          total: ocorrenciasDoBairro.length,
          abertas: ocorrenciasDoBairro.filter(oc => oc.status === "ABERTO").length,
          resolvidas: ocorrenciasDoBairro.filter(oc => oc.status === "RESOLVIDO").length
        };
      })
    );
  }
};

export const RuaService = {
  listar: async () => {
    return await comFallback(
      "GET /ruas",
      async () => (await requestJson("/ruas")).map(normalizarRua),
      () => [...MOCK_RUAS]
    );
  }
};

export const FiscalService = {
  listar: async () => {
    return await comFallback(
      "GET /vistorias para fiscais",
      async () => {
        const vistorias = await requestJson("/vistorias");
        const fiscais = new Map();

        vistorias.forEach(v => {
          if (v.id_fiscal) {
            fiscais.set(v.id_fiscal, {
              id: v.id_fiscal,
              matricula: v.fiscal_matricula || "N/D",
              nome: v.fiscal_nome || "Fiscal Técnico",
              email: "",
              status: "ATIVO"
            });
          }
        });

        return fiscais.size > 0 ? [...fiscais.values()] : [...MOCK_FISCAIS];
      },
      () => [...MOCK_FISCAIS]
    );
  }
};

export const EquipeService = {
  listar: async () => {
    return await comFallback(
      "GET /intervencoes para equipes",
      async () => {
        const intervencoes = await requestJson("/intervencoes");
        const equipes = new Map();

        intervencoes.forEach(i => {
          if (i.id_equipe) {
            equipes.set(i.id_equipe, {
              id: i.id_equipe,
              id_orgao: null,
              nome: i.equipe_nome || "Equipe Municipal",
              especialidade: i.equipe_especialidade || "Manutenção urbana",
              quantidade_membros: null,
              status: "ATIVO"
            });
          }
        });

        return equipes.size > 0 ? [...equipes.values()] : [...MOCK_EQUIPES];
      },
      () => [...MOCK_EQUIPES]
    );
  }
};

export const OcorrenciaService = {
  listar: async () => {
    return await comFallback(
      "GET /ocorrencias",
      async () => (await requestJson("/ocorrencias")).map(normalizarOcorrencia),
      async () => {
        await delay(800);
        return [...MOCK_OCORRENCIAS].reverse();
      }
    );
  },

  listarPendentes: async () => {
    return await comFallback(
      "GET /fiscal/pendentes",
      async () => (await requestJson("/fiscal/pendentes")).map(normalizarOcorrencia),
      async () => {
        await delay(500);
        return [...MOCK_OCORRENCIAS].filter(o => o.status !== "RESOLVIDO").reverse();
      }
    );
  },
  
  cadastrar: async (dados) => {
    if (USAR_API_REAL) {
      try {
        const payload = {
          id_rua: dados.id_rua,
          descricao: dados.descricao,
          nome_cidadao: dados.nome_cidadao || "Cidadão Anônimo",
          email_cidadao: dados.email_cidadao || "anonimo@caminhoseguro.local",
          tipo_problema: tipoProblemaPayload(dados),
          descricao_obstaculo: dados.titulo_obstaculo || dados.descricao
        };
        return normalizarOcorrencia(await requestJson("/ocorrencias", {
          method: "POST",
          body: JSON.stringify(payload)
        }));
      } catch (err) {
        console.warn("[API] POST /ocorrencias: usando cadastro mock.", err);
      }
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
    return await comFallback(
      "GET /dashboard/resumo",
      async () => {
        const resumo = await requestJson("/dashboard/resumo");
        return {
          total: resumo.total_ocorrencias,
          abertas: resumo.abertas,
          emVistoria: resumo.em_vistoria,
          resolvidas: resumo.resolvidas,
          indiceAcessibilidade: Math.round(resumo.indice_resolucao || 0)
        };
      },
      async () => {
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
    );
  }
};

export const VistoriaService = {
  listar: async () => {
    return await comFallback(
      "GET /vistorias",
      async () => (await requestJson("/vistorias")).map(normalizarVistoria),
      () => [...MOCK_VISTORIAS]
    );
  },
  
  criar: async (dados) => {
    if (USAR_API_REAL) {
      try {
        return normalizarVistoria(await requestJson("/vistorias", {
          method: "POST",
          body: JSON.stringify(dados)
        }));
      } catch (err) {
        console.warn("[API] POST /vistorias: usando cadastro mock.", err);
      }
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
    if (USAR_API_REAL) {
      try {
        const ocorrencia = await requestJson(`/ocorrencias/${idOcorrencia}`);
        if (!ocorrencia.vistoria) return null;

        return normalizarVistoria({
          ...ocorrencia.vistoria,
          id_ocorrencia: idOcorrencia,
          id_fiscal: ocorrencia.fiscal?.id,
          fiscal_nome: ocorrencia.fiscal?.nome,
          fiscal_matricula: ocorrencia.fiscal?.matricula
        });
      } catch (err) {
        console.warn("[API] GET /ocorrencias/{id}: usando laudo mock.", err);
      }
    }

    await delay(300);
    return MOCK_VISTORIAS.find(v => v.id_ocorrencia === idOcorrencia) || null;
  }
};

export const IntervencaoService = {
  listar: async () => {
    return await comFallback(
      "GET /intervencoes",
      async () => {
        const remotas = (await requestJson("/intervencoes")).map(normalizarIntervencao);
        return [...INTERVENCOES_LOCAIS, ...remotas];
      },
      () => [...INTERVENCOES_LOCAIS, ...MOCK_INTERVENCOES]
    );
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
    
    INTERVENCOES_LOCAIS.push(novaIntervencao);
    
    return novaIntervencao;
  },

  concluir: async (idIntervencao, idOcorrencia) => {
    await delay(500);
    const intervencao = INTERVENCOES_LOCAIS.find(i => i.id === idIntervencao)
      || MOCK_INTERVENCOES.find(i => i.id === idIntervencao);
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
