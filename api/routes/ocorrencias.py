from typing import Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import PROBLEMA_DEFAULTS, buscar_ocorrencias


router = APIRouter(prefix="/ocorrencias", tags=["Ocorrências"])


TipoProblema = Literal["pavimentacao", "iluminacao", "saneamento", "zeladoria"]


class OcorrenciaCreate(BaseModel):
    id_rua: UUID
    descricao: str = Field(min_length=5)
    nome_cidadao: str = Field(default="Cidadão Demo", min_length=2)
    email_cidadao: EmailStr = "cidadao.demo@caminhoseguro.local"
    id_orgao: UUID | None = None
    tipo_problema: TipoProblema = "pavimentacao"
    valor_problema: str | None = None
    descricao_obstaculo: str | None = None


@router.get("")
async def listar_ocorrencias(db: AsyncSession = Depends(get_db)):
    return await buscar_ocorrencias(db)


@router.get("/{ocorrencia_id}")
async def obter_ocorrencia(ocorrencia_id: UUID, db: AsyncSession = Depends(get_db)):
    ocorrencias = await buscar_ocorrencias(db, ocorrencia_id=ocorrencia_id)
    if not ocorrencias:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ocorrência não encontrada")
    return ocorrencias[0]


@router.post("", status_code=status.HTTP_201_CREATED)
async def criar_ocorrencia(payload: OcorrenciaCreate, db: AsyncSession = Depends(get_db)):
    orgao_id = payload.id_orgao or await _buscar_primeiro_orgao(db)
    if not orgao_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cadastre ou execute o seed demo para existir ao menos um órgão responsável.",
        )

    rua_existe = await db.scalar(
        text("SELECT EXISTS (SELECT 1 FROM rua WHERE id = CAST(:id_rua AS uuid))"),
        {"id_rua": str(payload.id_rua)},
    )
    if not rua_existe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rua informada não existe.")

    tipo_coluna = payload.tipo_problema
    valor_problema = payload.valor_problema or PROBLEMA_DEFAULTS[tipo_coluna]
    cidadao_id = uuid4()
    obstaculo_id = uuid4()
    ocorrencia_id = uuid4()

    problema_values = {
        "pavimentacao": None,
        "iluminacao": None,
        "saneamento": None,
        "zeladoria": None,
    }
    problema_values[tipo_coluna] = valor_problema

    try:
        cidadao_id = await db.scalar(
            text("""
                INSERT INTO cidadao(id, nome, email, senha, status, created_at, updated_at)
                VALUES (:id, :nome, :email, 'demo123', 'ATIVO', now(), now())
                ON CONFLICT (email)
                DO UPDATE SET nome = EXCLUDED.nome, updated_at = now()
                RETURNING id
            """),
            {
                "id": cidadao_id,
                "nome": payload.nome_cidadao,
                "email": str(payload.email_cidadao),
            },
        )

        await db.execute(
            text("""
                INSERT INTO obstaculo(
                    id, id_rua, descricao, status, created_at, updated_at,
                    pavimentacao, iluminacao, saneamento, zeladoria
                )
                VALUES (
                    :id, CAST(:id_rua AS uuid), :descricao, 'ATIVO', now(), now(),
                    :pavimentacao, :iluminacao, :saneamento, :zeladoria
                )
            """),
            {
                "id": obstaculo_id,
                "id_rua": str(payload.id_rua),
                "descricao": payload.descricao_obstaculo or payload.descricao,
                **problema_values,
            },
        )

        await db.execute(
            text("""
                INSERT INTO ocorrencia(
                    id, id_obstaculo, id_cidadao, id_orgao,
                    descricao, status, created_at, updated_at
                )
                VALUES (
                    :id,
                    :id_obstaculo,
                    :id_cidadao,
                    CAST(:id_orgao AS uuid),
                    :descricao,
                    'PENDENTE',
                    now(),
                    now()
                )
            """),
            {
                "id": ocorrencia_id,
                "id_obstaculo": obstaculo_id,
                "id_cidadao": cidadao_id,
                "id_orgao": str(orgao_id),
                "descricao": payload.descricao,
            },
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    ocorrencias = await buscar_ocorrencias(db, ocorrencia_id=ocorrencia_id)
    return ocorrencias[0]


async def _buscar_primeiro_orgao(db: AsyncSession) -> str | None:
    orgao_id = await db.scalar(
        text("""
            SELECT id::text
            FROM orgao
            WHERE COALESCE(status, 'ATIVO') <> 'INATIVO'
            ORDER BY created_at
            LIMIT 1
        """)
    )
    return orgao_id
