from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.budget import ExpenseCreate, ExpenseUpdate, ExpenseResponse, BudgetSummaryResponse
from app.services import budget_service

router = APIRouter(tags=["Budget"])

@router.post("/trips/{trip_id}/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def add_expense(
    trip_id: str,
    expense_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return budget_service.add_expense(db, current_user, trip_id, expense_in)

@router.get("/trips/{trip_id}/expenses", response_model=List[ExpenseResponse])
def get_trip_expenses(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return budget_service.get_trip_expenses(db, current_user, trip_id)

@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: str,
    expense_in: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return budget_service.update_expense(db, current_user, expense_id, expense_in)

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget_service.delete_expense(db, current_user, expense_id)
    return None

@router.get("/trips/{trip_id}/budget-summary", response_model=BudgetSummaryResponse)
def get_budget_summary(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return budget_service.get_budget_summary(db, current_user, trip_id)
