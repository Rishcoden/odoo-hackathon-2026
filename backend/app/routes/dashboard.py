from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.dashboard import DashboardOverview, TripSummary, Recommendation
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverview)
def get_overview(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return dashboard_service.get_dashboard_overview(db, current_user)

@router.get("/recent-trips", response_model=List[TripSummary])
def get_recent_trips(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return dashboard_service.get_recent_trips(db, current_user)

@router.get("/recommendations", response_model=List[Recommendation])
def get_recommendations(current_user: User = Depends(get_current_user)):
    return dashboard_service.get_recommendations()
