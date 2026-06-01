from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import row_to_dict


router = APIRouter(prefix="/intervencoes", tags=["Intervenções"])


@router.get("")
async def listar_intervencoes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
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
            ORDER BY i.data_registro DESC
        """)
    )
    return [row_to_dict(row) for row in result.mappings().all()]
