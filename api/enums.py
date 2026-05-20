from enum import Enum

class BASE(str, Enum):
    OUTROS = "OUTROS"

class ProblemaPavimentacao(BASE):
    BURACO_PISTA = "Buraco na Pista"
    BURACO_CALCADA = "Buraco na Calçada / Passeio"
    RACHADURA_ASFALTO = "Asfalto Rachado / Ondulado"
    CALCADA_DANIFICADA = "Calçada Danificada ou Bloqueada"
    OBRA_ABANDONADA = "Obra em Via Pública sem Conclusão"

class ProblemaIluminacao(BASE):
    POSTE_QUEBRADO = "Poste Danificado / Caído"
    LAMPADA_APAGADA = "Lâmpada Queimada / Apagada à Noite"
    LAMPADA_ACESSA_DIA = "Lâmpada Acesa Durante o Dia"
    FIACAO_EXPOSTA = "Fiação Elétrica Exposta / Caída"

class ProblemaSaneamento(BASE):
    BUEIRO_ENTUPIDO = "Bueiro Entupido / Alagamento"
    BUEIRO_SEM_TAMPA = "Bueiro sem Tampa (Risco de Queda)"
    VAZAMENTO_AGUA = "Vazamento de Água Limpa"
    VAZAMENTO_ESGOTO = "Esgoto a Céu Aberto / Vazamento"

class ProblemaZeladoria(BASE):
    LIXO_ACUMULADO = "Acúmulo de Lixo / Entulho"
    ARVORE_RISCO_QUEDA = "Árvore com Risco de Queda"
    GALHOS_INVASIVOS = "Galhos Bloqueando Sinalização / Fios"
    SINALIZACAO_DANIFICADA = "Placa ou Semáforo Danificado"