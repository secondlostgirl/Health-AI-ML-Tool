# services/session_store.py
"""
Simple in-memory session store.
Keyed by a session_id string sent by the frontend.
Stores the raw DataFrame, column mapping, and prepared splits.
"""
from typing import Dict, Any

_store: Dict[str, Dict[str, Any]] = {}


def get(session_id: str) -> Dict[str, Any]:
    return _store.get(session_id, {})


def set(session_id: str, key: str, value: Any) -> None:
    if session_id not in _store:
        _store[session_id] = {}
    _store[session_id][key] = value


def clear(session_id: str) -> None:
    _store.pop(session_id, None)


def has(session_id: str, key: str) -> bool:
    return key in _store.get(session_id, {})
