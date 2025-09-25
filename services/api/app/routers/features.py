from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter


router = APIRouter(prefix="/features", tags=["features"])


_FLAGS: Dict[str, Any] = {
    "reconcile": True,
    "controls": True,
    "flux": True,
    "forecast": True,
    "spend": True,
    "treasury": True,
    "dq": True,
}


@router.get("")
def get_features() -> Dict[str, Any]:
    return {"flags": _FLAGS}


@router.put("")
def put_features(payload: Dict[str, Any]) -> Dict[str, Any]:
    flags = payload.get("flags")
    if isinstance(flags, dict):
        _FLAGS.update(flags)
    return {"flags": _FLAGS}


