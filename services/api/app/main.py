from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health
from .routers import receipts
from .routers import ingest
from .routers import agents
from .routers import kpi
from .routers import matches
from .routers import controls
from .routers import flux as flux_router
from .routers import forecast as forecast_router
from .routers import exceptions as exceptions_router
from .routers import spend as spend_router
from .routers import policies as policies_router
from .routers import features as features_router


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
    application.include_router(controls.router)
    application.include_router(flux_router.router)
    application.include_router(forecast_router.router)
    application.include_router(exceptions_router.router)
    application.include_router(spend_router.router)
    application.include_router(policies_router.router)
    application.include_router(features_router.router)

    return application


app = create_app()


