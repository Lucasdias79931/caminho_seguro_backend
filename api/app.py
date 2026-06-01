from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.bairros import router as bairros_router
from api.routes.bd_demo import router as bd_demo_router
from api.routes.dashboard import router as dashboard_router
from api.routes.equipes import router as equipes_router
from api.routes.fiscal import router as fiscal_router
from api.routes.fiscais import router as fiscais_router
from api.routes.intervencoes import router as intervencoes_router
from api.routes.obstaculos import router as obstaculos_router
from api.routes.ocorrencias import router as ocorrencias_router
from api.routes.ruas import router as ruas_router
from api.routes.vistorias import router as vistorias_router


app = FastAPI(
    title="Caminho Seguro API",
    description=(
        "API acadêmica para demonstrar persistência e consultas sobre o banco "
        "PostgreSQL do projeto Caminho Seguro, com foco em acessibilidade urbana "
        "e calçadas hostis."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Sistema"])
async def root():
    return {
        "mensagem": "Caminho Seguro API",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health", tags=["Sistema"])
async def healthcheck():
    return {"status": "ok"}


app.include_router(bairros_router, prefix="/api")
app.include_router(bd_demo_router, prefix="/api")
app.include_router(ruas_router, prefix="/api")
app.include_router(obstaculos_router, prefix="/api")
app.include_router(ocorrencias_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(fiscal_router, prefix="/api")
app.include_router(fiscais_router, prefix="/api")
app.include_router(equipes_router, prefix="/api")
app.include_router(vistorias_router, prefix="/api")
app.include_router(intervencoes_router, prefix="/api")
