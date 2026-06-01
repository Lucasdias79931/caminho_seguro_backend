from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import row_to_dict


router = APIRouter(prefix="/equipes", tags=["Equipes"])


@router.get("")
async def listar_equipes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT
                eq.id::text,
                eq.id_orgao::text,
                eq.nome,
                eq.especialidade,
                eq.quantidade_membros,
                eq.status,
                eq.created_at,
                eq.updated_at,
                org.nome AS orgao_nome
            FROM equipe_manutencao eq
            JOIN orgao org ON org.id = eq.id_orgao
            WHERE COALESCE(eq.status, 'ATIVO') <> 'INATIVO'
            ORDER BY eq.nome
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]
