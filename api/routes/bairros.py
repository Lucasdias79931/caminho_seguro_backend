from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import row_to_dict


router = APIRouter(prefix="/bairros", tags=["Bairros"])


@router.get("")
async def listar_bairros(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT id::text, nome, descricao, status, created_at, updated_at
            FROM bairro
            ORDER BY nome
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]
