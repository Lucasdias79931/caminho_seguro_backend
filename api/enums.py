from enum import Enum


class STATUS(str, Enum):
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    PENDENTE = "PENDENTE"
    RESOLVIDO = "RESOLVIDO"
    
    

class ProblemaPavimentacao(str, Enum):
    BURACO_PISTA = "Buraco na Pista"
    BURACO_CALCADA = "Buraco na Calçada / Passeio"
    RACHADURA_ASFALTO = "Asfalto Rachado / Ondulado"
    CALCADA_DANIFICADA = "Calçada Danificada ou Bloqueada"
    OBRA_ABANDONADA = "Obra em Via Pública sem Conclusão"
    OUTROS = "OUTROS"
class ProblemaIluminacao(str, Enum):
    POSTE_QUEBRADO = "Poste Danificado / Caído"
    LAMPADA_APAGADA = "Lâmpada Queimada / Apagada à Noite"
    LAMPADA_ACESSA_DIA = "Lâmpada Acesa Durante o Dia"
    FIACAO_EXPOSTA = "Fiação Elétrica Exposta / Caída"
    OUTROS = "OUTROS"
class ProblemaSaneamento(str, Enum):
    BUEIRO_ENTUPIDO = "Bueiro Entupido / Alagamento"
    BUEIRO_SEM_TAMPA = "Bueiro sem Tampa (Risco de Queda)"
    VAZAMENTO_AGUA = "Vazamento de Água Limpa"
    VAZAMENTO_ESGOTO = "Esgoto a Céu Aberto / Vazamento"
    OUTROS = "OUTROS"
class ProblemaZeladoria(str, Enum):
    LIXO_ACUMULADO = "Acúmulo de Lixo / Entulho"
    ARVORE_RISCO_QUEDA = "Árvore com Risco de Queda"
    GALHOS_INVASIVOS = "Galhos Bloqueando Sinalização / Fios"
    SINALIZACAO_DANIFICADA = "Placa ou Semáforo Danificado"
    OUTROS = "OUTROS"