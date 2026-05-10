from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.trip import Trip
from app.models.expense import Expense
from app.models.trip_stop import TripStop
from app.models.trip_activity import TripActivity
from app.models.activity import Activity
from app.models.user import User
from app.schemas.budget import ExpenseCreate, ExpenseUpdate, ExpenseResponse, BudgetSummaryResponse

def _validate_trip_ownership(db: Session, user: User, trip_id: str):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip

def add_expense(db: Session, user: User, trip_id: str, expense_in: ExpenseCreate):
    _validate_trip_ownership(db, user, trip_id)
    expense = Expense(
        trip_id=trip_id,
        category=expense_in.category,
        title=expense_in.title,
        amount=expense_in.amount,
        notes=expense_in.notes
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

def get_trip_expenses(db: Session, user: User, trip_id: str):
    _validate_trip_ownership(db, user, trip_id)
    return db.query(Expense).filter(Expense.trip_id == trip_id).order_by(Expense.created_at.desc()).all()

def update_expense(db: Session, user: User, expense_id: str, expense_in: ExpenseUpdate):
    expense = db.query(Expense).join(Trip).filter(Expense.id == expense_id, Trip.user_id == user.id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    if expense_in.category is not None: expense.category = expense_in.category
    if expense_in.title is not None: expense.title = expense_in.title
    if expense_in.amount is not None: expense.amount = expense_in.amount
    if expense_in.notes is not None: expense.notes = expense_in.notes
    
    db.commit()
    db.refresh(expense)
    return expense

def delete_expense(db: Session, user: User, expense_id: str):
    expense = db.query(Expense).join(Trip).filter(Expense.id == expense_id, Trip.user_id == user.id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}

def get_budget_summary(db: Session, user: User, trip_id: str):
    trip = _validate_trip_ownership(db, user, trip_id)
    
    manual_expenses = db.query(
        Expense.category,
        func.sum(Expense.amount).label("total")
    ).filter(Expense.trip_id == trip_id).group_by(Expense.category).all()
    
    total_manual_expenses = 0.0
    category_breakdown = {}
    
    for row in manual_expenses:
        cat = row.category or "Uncategorized"
        amt = float(row.total or 0.0)
        total_manual_expenses += amt
        category_breakdown[cat] = category_breakdown.get(cat, 0.0) + amt

    stops_subquery = db.query(TripStop.id).filter(TripStop.trip_id == trip_id).subquery()
    
    activity_costs = db.query(
        Activity.category,
        func.sum(Activity.estimated_cost).label("total")
    ).join(TripActivity, TripActivity.activity_id == Activity.id)\
     .filter(TripActivity.trip_stop_id.in_(stops_subquery))\
     .group_by(Activity.category).all()

    total_activity_cost = 0.0
    for row in activity_costs:
        cat = row.category or "Activities"
        if not cat.strip():
            cat = "Activities"
        amt = float(row.total or 0.0)
        total_activity_cost += amt
        category_breakdown[cat] = category_breakdown.get(cat, 0.0) + amt

    total_estimated_budget = trip.budget_limit or 0.0
    remaining_budget = total_estimated_budget - (total_manual_expenses + total_activity_cost)

    return BudgetSummaryResponse(
        trip_id=trip_id,
        total_estimated_budget=total_estimated_budget,
        total_manual_expenses=total_manual_expenses,
        total_activity_cost=total_activity_cost,
        remaining_budget=remaining_budget,
        category_breakdown=category_breakdown
    )
