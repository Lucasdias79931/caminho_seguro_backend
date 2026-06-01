from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import row_to_dict


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/resumo")
async def resumo_dashboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT
                (SELECT COUNT(*) FROM bairro) AS total_bairros,
                (SELECT COUNT(*) FROM rua) AS total_ruas,
                (SELECT COUNT(*) FROM obstaculo) AS total_obstaculos,
                (SELECT COUNT(*) FROM ocorrencia) AS total_ocorrencias,
                (
                    SELECT COUNT(*)
                    FROM ocorrencia o
                    WHERE NOT EXISTS (
                        SELECT 1 FROM vistoria v WHERE v.id_ocorrencia = o.id
                    )
                ) AS abertas,
                (
                    SELECT COUNT(*)
                    FROM ocorrencia o
                    WHERE EXISTS (
                        SELECT 1 FROM vistoria v WHERE v.id_ocorrencia = o.id
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM vistoria v
                        JOIN intervencao i ON i.id_vistoria = v.id
                        WHERE v.id_ocorrencia = o.id
                          AND i.data_conclusao IS NOT NULL
                    )
                ) AS em_vistoria,
                (
                    SELECT COUNT(*)
                    FROM ocorrencia o
                    WHERE EXISTS (
                        SELECT 1
                        FROM vistoria v
                        JOIN intervencao i ON i.id_vistoria = v.id
                        WHERE v.id_ocorrencia = o.id
                          AND i.data_conclusao IS NOT NULL
                    )
                ) AS resolvidas,
                (SELECT COUNT(*) FROM vistoria) AS total_vistorias,
                (SELECT COUNT(*) FROM intervencao) AS total_intervencoes,
                COALESCE((SELECT SUM(custo_estimado) FROM intervencao), 0) AS investimento_total
        """)
    )
    resumo = row_to_dict(result.mappings().one())
    total = resumo["total_ocorrencias"] or 0
    resolvidas = resumo["resolvidas"] or 0
    resumo["indice_resolucao"] = round((resolvidas / total) * 100, 2) if total else 0
    return resumo


@router.get("/bairros-criticos")
async def bairros_criticos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT bairro, total_ocorrencias
            FROM v_dashboard_bairros_criticos
            ORDER BY total_ocorrencias DESC, bairro
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]
