from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.services import note_service

router = APIRouter(tags=["Trip Notes"])

@router.post("/trips/{trip_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    trip_id: str,
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return note_service.create_note(db, current_user, trip_id, note_in)

@router.get("/trips/{trip_id}/notes", response_model=List[NoteResponse])
def get_notes(
    trip_id: str,
    trip_stop_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return note_service.get_notes(db, current_user, trip_id, trip_stop_id)

@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: str,
    note_in: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return note_service.update_note(db, current_user, note_id, note_in)

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note_service.delete_note(db, current_user, note_id)
    return None
