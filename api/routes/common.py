from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import RowMapping, text
from sqlalchemy.ext.asyncio import AsyncSession


PROBLEMA_LABELS = {
    "pavimentacao": "Pavimentação",
    "iluminacao": "Iluminação",
    "saneamento": "Saneamento",
    "zeladoria": "Zeladoria",
}

PROBLEMA_DEFAULTS = {
    "pavimentacao": "CALCADA_DANIFICADA",
    "iluminacao": "LAMPADA_APAGADA",
    "saneamento": "BUEIRO_SEM_TAMPA",
    "zeladoria": "LIXO_ACUMULADO",
}

def jsonable(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, UUID):
        return str(value)
    return value


def row_to_dict(row: RowMapping) -> dict[str, Any]:
    return {key: jsonable(value) for key, value in row.items()}


def tipo_obstaculo(row: RowMapping) -> tuple[str | None, str | None]:
    for column, label in PROBLEMA_LABELS.items():
        value = row.get(column)
        if value:
            return label, str(value)
    return None, None


def gravidade_por_status(status: str | None) -> str:
    if status == "RESOLVIDO":
        return "BAIXA"
    if status == "EM_VISTORIA":
        return "MEDIA"
    return "ALTA"


def status_operacional(row: RowMapping) -> str:
    if row.get("intervencao_data_conclusao"):
        return "RESOLVIDO"
    if row.get("vistoria_id"):
        return "EM_VISTORIA"
    return "ABERTO"


OCORRENCIAS_BASE_QUERY = """
    SELECT
        o.id::text AS id,
        o.descricao,
        o.status,
        o.created_at AS data_criacao,
        o.updated_at AS data_atualizacao,
        ob.id::text AS obstaculo_id,
        ob.descricao AS obstaculo_descricao,
        ob.pavimentacao,
        ob.iluminacao,
        ob.saneamento,
        ob.zeladoria,
        r.id::text AS rua_id,
        r.nome AS rua_nome,
        trim(r.cep) AS rua_cep,
        b.id::text AS bairro_id,
        b.nome AS bairro_nome,
        c.id::text AS cidadao_id,
        c.nome AS cidadao_nome,
        c.email AS cidadao_email,
        org.id::text AS orgao_id,
        org.nome AS orgao_nome,
        v.id::text AS vistoria_id,
        v.laudo AS vistoria_laudo,
        v.prazo_adequacao AS prazo_adequacao,
        f.id::text AS fiscal_id,
        f.nome AS fiscal_nome,
        f.matricula AS fiscal_matricula,
        i.id::text AS intervencao_id,
        i.status AS intervencao_status,
        i.data_conclusao AS intervencao_data_conclusao
    FROM ocorrencia o
    JOIN obstaculo ob ON ob.id = o.id_obstaculo
    JOIN rua r ON r.id = ob.id_rua
    JOIN bairro b ON b.id = r.id_bairro
    JOIN cidadao c ON c.id = o.id_cidadao
    JOIN orgao org ON org.id = o.id_orgao
    LEFT JOIN LATERAL (
        SELECT *
        FROM vistoria v
        WHERE v.id_ocorrencia = o.id
        ORDER BY v.created_at DESC
        LIMIT 1
    ) v ON true
    LEFT JOIN fiscal f ON f.id = v.id_fiscal
    LEFT JOIN LATERAL (
        SELECT *
        FROM intervencao i
        WHERE i.id_vistoria = v.id
        ORDER BY i.data_registro DESC
        LIMIT 1
    ) i ON true
"""


def formatar_ocorrencia(row: RowMapping) -> dict[str, Any]:
    tipo, valor_tipo = tipo_obstaculo(row)
    status = status_operacional(row)
    return {
        "id": row.get("id"),
        "descricao": row.get("descricao"),
        "status": status,
        "status_banco": row.get("status"),
        "gravidade": gravidade_por_status(status),
        "data_criacao": jsonable(row.get("data_criacao")),
        "data_atualizacao": jsonable(row.get("data_atualizacao")),
        "tipo_obstaculo": tipo,
        "valor_tipo_obstaculo": valor_tipo,
        "bairro": {
            "id": row.get("bairro_id"),
            "nome": row.get("bairro_nome"),
        },
        "rua": {
            "id": row.get("rua_id"),
            "nome": row.get("rua_nome"),
            "cep": row.get("rua_cep"),
        },
        "obstaculo": {
            "id": row.get("obstaculo_id"),
            "descricao": row.get("obstaculo_descricao"),
            "pavimentacao": row.get("pavimentacao"),
            "iluminacao": row.get("iluminacao"),
            "saneamento": row.get("saneamento"),
            "zeladoria": row.get("zeladoria"),
        },
        "cidadao": {
            "id": row.get("cidadao_id"),
            "nome": row.get("cidadao_nome"),
            "email": row.get("cidadao_email"),
        },
        "orgao": {
            "id": row.get("orgao_id"),
            "nome": row.get("orgao_nome"),
        },
        "fiscal": {
            "id": row.get("fiscal_id"),
            "nome": row.get("fiscal_nome"),
            "matricula": row.get("fiscal_matricula"),
        } if row.get("fiscal_id") else None,
        "vistoria": {
            "id": row.get("vistoria_id"),
            "laudo": row.get("vistoria_laudo"),
            "prazo_adequacao": jsonable(row.get("prazo_adequacao")),
        } if row.get("vistoria_id") else None,
        "intervencao": {
            "id": row.get("intervencao_id"),
            "status_banco": row.get("intervencao_status"),
            "data_conclusao": jsonable(row.get("intervencao_data_conclusao")),
        } if row.get("intervencao_id") else None,
    }


async def buscar_ocorrencias(
    db: AsyncSession,
    ocorrencia_id: UUID | None = None,
    somente_pendentes: bool = False,
) -> list[dict[str, Any]]:
    where = []
    params: dict[str, Any] = {}
    if ocorrencia_id:
        where.append("o.id = CAST(:ocorrencia_id AS uuid)")
        params["ocorrencia_id"] = str(ocorrencia_id)

    query = OCORRENCIAS_BASE_QUERY
    if where:
        query += "\nWHERE " + " AND ".join(where)
    query += "\nORDER BY o.created_at DESC"

    result = await db.execute(text(query), params)
    ocorrencias = [formatar_ocorrencia(row) for row in result.mappings().all()]
    if somente_pendentes:
        return [ocorrencia for ocorrencia in ocorrencias if ocorrencia["status"] != "RESOLVIDO"]
    return ocorrencias
