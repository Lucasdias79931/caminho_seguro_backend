from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import row_to_dict


router = APIRouter(prefix="/vistorias", tags=["Vistorias"])


class VistoriaCreate(BaseModel):
    id_ocorrencia: UUID
    laudo: str = Field(min_length=5)
    id_fiscal: UUID | None = None
    prazo_adequacao: str | None = None
    descricao: str | None = None


@router.get("")
async def listar_vistorias(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT
                v.id::text,
                v.id_ocorrencia::text,
                v.id_fiscal::text,
                v.laudo,
                v.prazo_adequacao,
                v.descricao,
                v.status,
                v.created_at,
                f.nome AS fiscal_nome,
                f.matricula AS fiscal_matricula,
                o.descricao AS ocorrencia_descricao
            FROM vistoria v
            JOIN fiscal f ON f.id = v.id_fiscal
            JOIN ocorrencia o ON o.id = v.id_ocorrencia
            ORDER BY v.created_at DESC
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def criar_vistoria(payload: VistoriaCreate, db: AsyncSession = Depends(get_db)):
    fiscal_id = payload.id_fiscal or await _buscar_primeiro_fiscal(db)
    if not fiscal_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cadastre ou execute o seed demo para existir ao menos um fiscal.",
        )

    ocorrencia_existe = await db.scalar(
        text("SELECT EXISTS (SELECT 1 FROM ocorrencia WHERE id = CAST(:id AS uuid))"),
        {"id": str(payload.id_ocorrencia)},
    )
    if not ocorrencia_existe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ocorrência informada não existe.")

    vistoria_id = uuid4()
    try:
        await db.execute(
            text("""
                INSERT INTO vistoria(
                    id, id_ocorrencia, id_fiscal, laudo, prazo_adequacao,
                    descricao, status, created_at, updated_at
                )
                VALUES (
                    :id,
                    CAST(:id_ocorrencia AS uuid),
                    CAST(:id_fiscal AS uuid),
                    :laudo,
                    COALESCE(CAST(:prazo_adequacao AS timestamptz), now() + interval '10 days'),
                    :descricao,
                    'ATIVO',
                    now(),
                    now()
                )
            """),
            {
                "id": vistoria_id,
                "id_ocorrencia": str(payload.id_ocorrencia),
                "id_fiscal": str(fiscal_id),
                "laudo": payload.laudo,
                "prazo_adequacao": payload.prazo_adequacao,
                "descricao": payload.descricao,
            },
        )
        await db.execute(
            text("""
                UPDATE ocorrencia
                SET status = 'ATIVO', updated_at = now()
                WHERE id = CAST(:id_ocorrencia AS uuid)
                  AND status <> 'INATIVO'
            """),
            {"id_ocorrencia": str(payload.id_ocorrencia)},
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    result = await db.execute(
        text("""
            SELECT
                v.id::text,
                v.id_ocorrencia::text,
                v.id_fiscal::text,
                v.laudo,
                v.prazo_adequacao,
                v.descricao,
                v.status,
                v.created_at,
                f.nome AS fiscal_nome,
                f.matricula AS fiscal_matricula
            FROM vistoria v
            JOIN fiscal f ON f.id = v.id_fiscal
            WHERE v.id = :id
        """),
        {"id": vistoria_id},
    )
    return row_to_dict(result.mappings().one())


async def _buscar_primeiro_fiscal(db: AsyncSession) -> str | None:
    fiscal_id = await db.scalar(
        text("""
            SELECT id::text
            FROM fiscal
            WHERE COALESCE(status, 'ATIVO') <> 'INATIVO'
            ORDER BY created_at
            LIMIT 1
        """)
    )
    return fiscal_id
