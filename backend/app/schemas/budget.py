from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class ExpenseCreate(BaseModel):
    category: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., ge=0)
    notes: Optional[str] = None

class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: str
    trip_id: str
    category: str
    title: str
    amount: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetSummaryResponse(BaseModel):
    trip_id: str
    total_estimated_budget: float
    total_manual_expenses: float
    total_activity_cost: float
    remaining_budget: float
    category_breakdown: Dict[str, float]
