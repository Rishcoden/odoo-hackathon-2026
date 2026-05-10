from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from datetime import datetime

class TripStopCreate(BaseModel):
    city_name: str = Field(..., min_length=1, max_length=100)
    country: str = Field(..., min_length=1, max_length=100)
    arrival_date: datetime
    departure_date: datetime

    @model_validator(mode='after')
    def check_dates(self):
        if self.departure_date < self.arrival_date:
            raise ValueError('Departure date cannot be before arrival date')
        return self

class TripStopUpdate(BaseModel):
    arrival_date: Optional[datetime] = None
    departure_date: Optional[datetime] = None

    @model_validator(mode='after')
    def check_dates(self):
        if self.arrival_date and self.departure_date and self.departure_date < self.arrival_date:
            raise ValueError('Departure date cannot be before arrival date')
        return self

class StopReorder(BaseModel):
    new_order: int = Field(..., ge=1)

class TripStopResponse(BaseModel):
    id: str
    trip_id: str
    city_id: str
    city_name: str
    country: str
    arrival_date: datetime
    departure_date: datetime
    stop_order: int

    class Config:
        from_attributes = True
