from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health
from .routers import receipts
from .routers import ingest
from .routers import agents
from .routers import kpi
from .routers import matches


def create_app() -> FastAPI:
    application = FastAPI(title="DeepChief API", version="0.1.0")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(health.router)
    application.include_router(receipts.router, prefix="/receipts", tags=["receipts"])
    application.include_router(ingest.router)
    application.include_router(agents.router)
    application.include_router(kpi.router)
    application.include_router(matches.router)

    return application


app = create_app()


