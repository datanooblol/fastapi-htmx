from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.dependencies import get_note_repo, get_connection_repo, get_ai_provider
from app.services.synapse_service import find_connections, find_connections_bulk

router = APIRouter(prefix="/synapse")
USER_ID = settings.DEFAULT_USER_ID


class SynapseRequest(BaseModel):
    note_id: str


class SynapseBulkRequest(BaseModel):
    note_ids: list[str]


class ConnectionAction(BaseModel):
    node_a_id: str
    node_a_type: str
    node_b_id: str
    node_b_type: str
    strength: str
    relationship_type: str
    ai_reason: str


@router.post("/single")
def synapse_single(
    body: SynapseRequest,
    note_repo=Depends(get_note_repo),
    conn_repo=Depends(get_connection_repo),
    ai=Depends(get_ai_provider),
):
    focus_note = note_repo.get_by_id(body.note_id)
    if not focus_note:
        raise HTTPException(status_code=404, detail="Note not found")

    suggestions = find_connections(USER_ID, body.note_id, ai, note_repo, conn_repo)

    if suggestions and "error" in suggestions[0]:
        raise HTTPException(status_code=500, detail=suggestions[0]["error"])

    return {
        "focus_note": {
            "id": focus_note.id,
            "title": focus_note.title,
        },
        "suggestions": suggestions,
        "total_scanned": note_repo.count(USER_ID) - 1,
    }


@router.post("/bulk")
def synapse_bulk(
    body: SynapseBulkRequest,
    note_repo=Depends(get_note_repo),
    conn_repo=Depends(get_connection_repo),
    ai=Depends(get_ai_provider),
):
    suggestions = find_connections_bulk(USER_ID, body.note_ids, ai, note_repo, conn_repo)

    errors = [s for s in suggestions if "error" in s]
    valid = [s for s in suggestions if "error" not in s]

    return {
        "suggestions": valid,
        "errors": errors,
        "notes_scanned": len(body.note_ids),
    }


@router.post("/accept")
def accept_connection(
    body: ConnectionAction,
    conn_repo=Depends(get_connection_repo),
):
    conn = conn_repo.create(USER_ID, {
        "node_a_id": body.node_a_id,
        "node_a_type": body.node_a_type,
        "node_b_id": body.node_b_id,
        "node_b_type": body.node_b_type,
        "strength": body.strength,
        "relationship_type": body.relationship_type,
        "ai_reason": body.ai_reason,
        "status": "confirmed",
    })
    return conn


@router.post("/reject")
def reject_connection(
    body: ConnectionAction,
    conn_repo=Depends(get_connection_repo),
):
    conn = conn_repo.create(USER_ID, {
        "node_a_id": body.node_a_id,
        "node_a_type": body.node_a_type,
        "node_b_id": body.node_b_id,
        "node_b_type": body.node_b_type,
        "strength": body.strength,
        "relationship_type": body.relationship_type,
        "ai_reason": body.ai_reason,
        "status": "rejected",
    })
    return {"ok": True}


@router.get("/connections")
def list_connections(
    conn_repo=Depends(get_connection_repo),
):
    return conn_repo.list_all(USER_ID, status="confirmed")


@router.delete("/connections/{conn_id}")
def delete_connection(
    conn_id: str,
    conn_repo=Depends(get_connection_repo),
):
    conn_repo.delete(conn_id)
    return {"ok": True}
