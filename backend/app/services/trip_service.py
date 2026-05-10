from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.models.trip import Trip
from app.models.user import User
from app.schemas.trip import TripCreate, TripUpdate
import os
import shutil

def create_trip(db: Session, user: User, trip_in: TripCreate, cover_image: UploadFile = None):
    db_trip = Trip(
        user_id=user.id,
        title=trip_in.title,
        description=trip_in.description,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        budget_limit=trip_in.budget_limit
    )
    
    # We add the object to session early so we can generate its ID for the filename
    db.add(db_trip)
    db.flush() # Flush to get the ID without fully committing
    
    if cover_image:
        filename = f"{db_trip.id}_{cover_image.filename}"
        filepath = os.path.join("uploads", filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(cover_image.file, buffer)
        db_trip.cover_image = f"/static/uploads/{filename}"

    db.commit()
    db.refresh(db_trip)
    return db_trip

def get_trips(db: Session, user: User, sort_by: str = "created_at"):
    query = db.query(Trip).filter(Trip.user_id == user.id)
    if sort_by == "start_date":
        query = query.order_by(Trip.start_date.asc())
    else:
        query = query.order_by(Trip.created_at.desc())
    return query.all()

def get_trip(db: Session, user: User, trip_id: str):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip

def update_trip(db: Session, user: User, trip_id: str, trip_in: TripUpdate, cover_image: UploadFile = None):
    db_trip = get_trip(db, user, trip_id)
    
    update_data = trip_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_trip, key, value)
        
    if cover_image:
        filename = f"{db_trip.id}_{cover_image.filename}"
        filepath = os.path.join("uploads", filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(cover_image.file, buffer)
        db_trip.cover_image = f"/static/uploads/{filename}"

    db.commit()
    db.refresh(db_trip)
    return db_trip

def delete_trip(db: Session, user: User, trip_id: str):
    db_trip = get_trip(db, user, trip_id)
    db.delete(db_trip)
    db.commit()
    return {"message": "Trip deleted successfully"}
