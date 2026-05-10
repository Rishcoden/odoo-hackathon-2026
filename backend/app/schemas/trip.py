from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime

class TripBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget_limit: Optional[float] = Field(None, ge=0)

class TripCreate(TripBase):
    @model_validator(mode='after')
    def check_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError('End date cannot be before start date')
        return self

class TripUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget_limit: Optional[float] = Field(None, ge=0)
    
    @model_validator(mode='after')
    def check_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError('End date cannot be before start date')
        return self

class TripResponse(TripBase):
    id: str
    user_id: str
    cover_image: Optional[str] = None
    created_at: datetime
    destination_count: int = 0

    class Config:
        from_attributes = True
