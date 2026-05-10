from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.analytics import GlobalOverviewResponse, BudgetBreakdownResponse, TopCitiesResponse, ActivityCategoryResponse
from app.services import analytics_service

router = APIRouter(tags=["Analytics Dashboard"])

@router.get("/analytics/overview", response_model=GlobalOverviewResponse)
def get_global_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return analytics_service.get_global_overview(db, current_user)

@router.get("/analytics/budget-breakdown", response_model=BudgetBreakdownResponse)
def get_budget_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return analytics_service.get_budget_breakdown(db, current_user)

@router.get("/analytics/top-cities", response_model=TopCitiesResponse)
def get_top_cities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return analytics_service.get_top_cities(db, current_user)

@router.get("/analytics/activity-categories", response_model=ActivityCategoryResponse)
def get_activity_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return analytics_service.get_activity_categories(db, current_user)
