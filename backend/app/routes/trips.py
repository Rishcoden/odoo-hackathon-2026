from fastapi import APIRouter, Depends, status, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.trip import TripResponse, TripCreate, TripUpdate
from app.services import trip_service

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    start_date: Optional[datetime] = Form(None),
    end_date: Optional[datetime] = Form(None),
    budget_limit: Optional[float] = Form(None),
    cover_image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip_in = TripCreate(
        title=title,
        description=description,
        start_date=start_date,
        end_date=end_date,
        budget_limit=budget_limit
    )
    return trip_service.create_trip(db, current_user, trip_in, cover_image)

@router.get("", response_model=List[TripResponse])
def get_all_trips(
    sort_by: Optional[str] = "created_at",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return trip_service.get_trips(db, current_user, sort_by)

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip_details(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return trip_service.get_trip(db, current_user, trip_id)

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    start_date: Optional[datetime] = Form(None),
    end_date: Optional[datetime] = Form(None),
    budget_limit: Optional[float] = Form(None),
    cover_image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip_in = TripUpdate(
        title=title,
        description=description,
        start_date=start_date,
        end_date=end_date,
        budget_limit=budget_limit
    )
    return trip_service.update_trip(db, current_user, trip_id, trip_in, cover_image)

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip_service.delete_trip(db, current_user, trip_id)
    return None
