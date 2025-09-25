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


@router.get("/{feature_name}")
def get_feature(feature_name: str) -> Dict[str, Any]:
    return {feature_name: _FLAGS.get(feature_name)}


@router.put("/{feature_name}")
def put_feature(feature_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    value = payload.get("value")
    if value is not None:
        _FLAGS[feature_name] = value
    return {feature_name: _FLAGS.get(feature_name)}

