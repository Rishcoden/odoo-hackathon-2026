from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.trip import Trip
from app.models.trip_note import TripNote
from app.models.user import User
from app.schemas.note import NoteCreate, NoteUpdate

def _validate_trip_ownership(db: Session, user: User, trip_id: str):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip

def create_note(db: Session, user: User, trip_id: str, note_in: NoteCreate):
    _validate_trip_ownership(db, user, trip_id)
    
    note = TripNote(
        trip_id=trip_id,
        trip_stop_id=note_in.trip_stop_id,
        title=note_in.title,
        content=note_in.content,
        note_date=note_in.note_date
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def get_notes(db: Session, user: User, trip_id: str, trip_stop_id: str = None):
    _validate_trip_ownership(db, user, trip_id)
    query = db.query(TripNote).filter(TripNote.trip_id == trip_id)
    
    if trip_stop_id:
        query = query.filter(TripNote.trip_stop_id == trip_stop_id)
        
    return query.order_by(TripNote.created_at.desc()).all()

def update_note(db: Session, user: User, note_id: str, note_in: NoteUpdate):
    note = db.query(TripNote).join(Trip).filter(TripNote.id == note_id, Trip.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    if note_in.title is not None: note.title = note_in.title
    if note_in.content is not None: note.content = note_in.content
    if note_in.trip_stop_id is not None: note.trip_stop_id = note_in.trip_stop_id
    if note_in.note_date is not None: note.note_date = note_in.note_date
    
    db.commit()
    db.refresh(note)
    return note

def delete_note(db: Session, user: User, note_id: str):
    note = db.query(TripNote).join(Trip).filter(TripNote.id == note_id, Trip.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}
