from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.itinerary import TripStopCreate, TripStopUpdate, StopReorder, TripStopResponse
from app.services import itinerary_service

router = APIRouter(tags=["Itinerary"])

@router.post("/trips/{trip_id}/stops", response_model=TripStopResponse, status_code=status.HTTP_201_CREATED)
def add_trip_stop(
    trip_id: str,
    stop_in: TripStopCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return itinerary_service.add_trip_stop(db, current_user, trip_id, stop_in)

@router.get("/trips/{trip_id}/stops", response_model=List[TripStopResponse])
def get_trip_stops(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return itinerary_service.get_trip_stops(db, current_user, trip_id)

@router.put("/stops/{stop_id}", response_model=TripStopResponse)
def update_trip_stop(
    stop_id: str,
    stop_in: TripStopUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return itinerary_service.update_trip_stop(db, current_user, stop_id, stop_in)

@router.delete("/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip_stop(
    stop_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary_service.delete_trip_stop(db, current_user, stop_id)
    return None

@router.put("/stops/{stop_id}/reorder")
def reorder_trip_stop(
    stop_id: str,
    reorder_in: StopReorder,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return itinerary_service.reorder_trip_stop(db, current_user, stop_id, reorder_in)
