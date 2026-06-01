from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import row_to_dict


router = APIRouter(prefix="/fiscais", tags=["Fiscais"])


@router.get("")
async def listar_fiscais(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT
                id::text,
                matricula,
                nome,
                email,
                status,
                created_at,
                updated_at
            FROM fiscal
            WHERE COALESCE(status, 'ATIVO') <> 'INATIVO'
            ORDER BY nome
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]
