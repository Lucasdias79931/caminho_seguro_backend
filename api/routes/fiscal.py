from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import buscar_ocorrencias


router = APIRouter(prefix="/fiscal", tags=["Fiscal"])


@router.get("/pendentes")
async def listar_ocorrencias_pendentes(db: AsyncSession = Depends(get_db)):
    return await buscar_ocorrencias(db, somente_pendentes=True)
