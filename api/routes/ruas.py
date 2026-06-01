from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import row_to_dict


router = APIRouter(prefix="/ruas", tags=["Ruas"])


@router.get("")
async def listar_ruas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT
                r.id::text,
                r.nome,
                trim(r.cep) AS cep,
                r.descricao,
                r.status,
                r.created_at,
                r.updated_at,
                b.id::text AS bairro_id,
                b.nome AS bairro_nome
            FROM rua r
            JOIN bairro b ON b.id = r.id_bairro
            ORDER BY b.nome, r.nome
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]
