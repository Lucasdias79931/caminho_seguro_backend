from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import row_to_dict


router = APIRouter(prefix="/intervencoes", tags=["Intervenções"])


class IntervencaoCreate(BaseModel):
    id_vistoria: UUID
    id_equipe: UUID
    custo_estimado: Decimal = Field(ge=0)
    descricao: str | None = None


class ConcluirIntervencaoPayload(BaseModel):
    data_conclusao: datetime | None = None


INTERVENCOES_SELECT = """
    SELECT
        i.id::text,
        i.id_vistoria::text,
        i.id_equipe::text,
        i.custo_estimado,
        i.data_registro,
        i.data_conclusao,
        i.descricao,
        i.status,
        eq.nome AS equipe_nome,
        eq.especialidade AS equipe_especialidade,
        org.nome AS orgao_nome,
        v.id_ocorrencia::text,
        v.laudo AS vistoria_laudo
    FROM intervencao i
    JOIN equipe_manutencao eq ON eq.id = i.id_equipe
    JOIN orgao org ON org.id = eq.id_orgao
    JOIN vistoria v ON v.id = i.id_vistoria
"""


@router.get("")
async def listar_intervencoes(db: AsyncSession = Depends(get_db)):
    return await consultar_intervencoes(db)


@router.post("", status_code=status.HTTP_201_CREATED)
async def criar_intervencao(payload: IntervencaoCreate, db: AsyncSession = Depends(get_db)):
    vistoria_existe = await db.scalar(
        text("SELECT EXISTS (SELECT 1 FROM vistoria WHERE id = CAST(:id AS uuid))"),
        {"id": str(payload.id_vistoria)},
    )
    if not vistoria_existe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vistoria informada não existe.")

    equipe_existe = await db.scalar(
        text("SELECT EXISTS (SELECT 1 FROM equipe_manutencao WHERE id = CAST(:id AS uuid))"),
        {"id": str(payload.id_equipe)},
    )
    if not equipe_existe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Equipe informada não existe.")

    intervencao_id = uuid4()
    try:
        await db.execute(
            text("""
                INSERT INTO intervencao(
                    id, id_vistoria, id_equipe, custo_estimado, data_registro,
                    data_conclusao, descricao, status, created_at, updated_at
                )
                VALUES (
                    CAST(:id AS uuid),
                    CAST(:id_vistoria AS uuid),
                    CAST(:id_equipe AS uuid),
                    CAST(:custo_estimado AS numeric),
                    now(),
                    NULL,
                    :descricao,
                    'ATIVO',
                    now(),
                    now()
                )
            """),
            {
                "id": str(intervencao_id),
                "id_vistoria": str(payload.id_vistoria),
                "id_equipe": str(payload.id_equipe),
                "custo_estimado": str(payload.custo_estimado),
                "descricao": payload.descricao,
            },
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    intervencao = await obter_intervencao_por_id(db, intervencao_id)
    if not intervencao:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Intervenção criada, mas não retornada.")
    return intervencao


@router.patch("/{intervencao_id}/concluir")
async def concluir_intervencao(
    intervencao_id: UUID,
    payload: ConcluirIntervencaoPayload | None = None,
    db: AsyncSession = Depends(get_db),
):
    intervencao_existe = await db.scalar(
        text("SELECT EXISTS (SELECT 1 FROM intervencao WHERE id = CAST(:id AS uuid))"),
        {"id": str(intervencao_id)},
    )
    if not intervencao_existe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intervenção não encontrada.")

    data_conclusao = payload.data_conclusao if payload else None
    try:
        await db.execute(
            text("""
                UPDATE intervencao
                SET
                    data_conclusao = COALESCE(CAST(:data_conclusao AS timestamptz), now()),
                    updated_at = now()
                WHERE id = CAST(:id AS uuid)
            """),
            {
                "id": str(intervencao_id),
                "data_conclusao": data_conclusao.isoformat() if data_conclusao else None,
            },
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    intervencao = await obter_intervencao_por_id(db, intervencao_id)
    if not intervencao:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intervenção não encontrada.")
    return intervencao


async def consultar_intervencoes(
    db: AsyncSession,
    ocorrencia_id: UUID | None = None,
) -> list[dict]:
    where = []
    params: dict[str, str] = {}
    if ocorrencia_id:
        where.append("v.id_ocorrencia = CAST(:ocorrencia_id AS uuid)")
        params["ocorrencia_id"] = str(ocorrencia_id)

    query = INTERVENCOES_SELECT
    if where:
        query += "\nWHERE " + " AND ".join(where)
    query += "\nORDER BY i.data_registro DESC"

    result = await db.execute(
        text(query),
        params,
    )
    return [row_to_dict(row) for row in result.mappings().all()]


async def obter_intervencao_por_id(db: AsyncSession, intervencao_id: UUID) -> dict | None:
    result = await db.execute(
        text(INTERVENCOES_SELECT + "\nWHERE i.id = CAST(:intervencao_id AS uuid)"),
        {"intervencao_id": str(intervencao_id)},
    )
    row = result.mappings().one_or_none()
    return row_to_dict(row) if row else None
