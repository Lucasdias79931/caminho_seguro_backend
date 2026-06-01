from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import row_to_dict


router = APIRouter(prefix="/bd", tags=["BD Demo"])


@router.get("/views/bairros-criticos")
async def consultar_view_bairros_criticos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT bairro, total_ocorrencias
            FROM v_dashboard_bairros_criticos
            ORDER BY total_ocorrencias DESC, bairro
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]


@router.get("/views/resumo-financeiro")
async def consultar_view_resumo_financeiro(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT orgao, total_intervencoes, investimento_total
            FROM v_resumo_financeiro_orgao
            ORDER BY investimento_total DESC NULLS LAST, orgao
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]


@router.get("/views/eficiencia-fiscais")
async def consultar_view_eficiencia_fiscais(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT fiscal, matricula, vistorias_realizadas
            FROM v_eficiencia_fiscais
            ORDER BY vistorias_realizadas DESC, fiscal
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]


@router.get("/functions/total-ocorrencias-bairro/{bairro_id}")
async def consultar_func_total_ocorrencias_bairro(
    bairro_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text("""
            SELECT f_total_ocorrencias_bairro(CAST(:bairro_id AS uuid)) AS total_ocorrencias
        """),
        {"bairro_id": str(bairro_id)},
    )
    return {
        "bairro_id": str(bairro_id),
        **row_to_dict(result.mappings().one()),
    }


@router.get("/functions/custo-total-orgao/{orgao_id}")
async def consultar_func_custo_total_orgao(
    orgao_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text("""
            SELECT f_custo_total_intervencoes_orgao(CAST(:orgao_id AS uuid)) AS custo_total
        """),
        {"orgao_id": str(orgao_id)},
    )
    return {
        "orgao_id": str(orgao_id),
        **row_to_dict(result.mappings().one()),
    }
