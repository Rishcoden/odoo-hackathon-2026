from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.activity import ActivityCreate, ActivityResponse, TripActivityCreate, TripActivityUpdate, TripActivityResponse
from app.services import activity_service

router = APIRouter(tags=["Activities"])

@router.get("/cities/{city_id}/activities", response_model=List[ActivityResponse])
def get_city_activities(
    city_id: str,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return activity_service.get_city_activities(db, city_id, category)

@router.post("/cities/{city_id}/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_city_activity(
    city_id: str,
    activity_in: ActivityCreate,
    db: Session = Depends(get_db)
):
    # This is a utility endpoint to allow manual seeding of activities
    return activity_service.create_activity(db, city_id, activity_in)

@router.post("/stops/{stop_id}/activities", response_model=TripActivityResponse, status_code=status.HTTP_201_CREATED)
def assign_activity_to_stop(
    stop_id: str,
    assignment_in: TripActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return activity_service.assign_activity(db, current_user, stop_id, assignment_in)

@router.get("/stops/{stop_id}/activities", response_model=List[TripActivityResponse])
def get_stop_activities(
    stop_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return activity_service.get_assigned_activities(db, current_user, stop_id)

@router.put("/trip-activities/{id}", response_model=TripActivityResponse)
def update_trip_activity(
    id: str,
    update_in: TripActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return activity_service.update_trip_activity(db, current_user, id, update_in)

@router.delete("/trip-activities/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip_activity(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity_service.delete_trip_activity(db, current_user, id)
    return None
