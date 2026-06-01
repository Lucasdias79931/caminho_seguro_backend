from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.routes.common import gravidade_por_status, row_to_dict, tipo_obstaculo


router = APIRouter(prefix="/obstaculos", tags=["Obstáculos"])


@router.get("")
async def listar_obstaculos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT
                ob.id::text,
                ob.descricao,
                ob.status,
                ob.pavimentacao,
                ob.iluminacao,
                ob.saneamento,
                ob.zeladoria,
                ob.created_at,
                ob.updated_at,
                r.id::text AS rua_id,
                r.nome AS rua_nome,
                b.id::text AS bairro_id,
                b.nome AS bairro_nome
            FROM obstaculo ob
            JOIN rua r ON r.id = ob.id_rua
            JOIN bairro b ON b.id = r.id_bairro
            ORDER BY ob.created_at DESC
        """)
    )
    obstaculos = []
    for row in result.mappings().all():
        item = row_to_dict(row)
        tipo, valor = tipo_obstaculo(row)
        item["tipo_obstaculo"] = tipo
        item["valor_tipo_obstaculo"] = valor
        item["gravidade"] = gravidade_por_status(row.get("status"))
        obstaculos.append(item)
    return obstaculos
