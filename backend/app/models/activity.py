from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.connection import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=True)
    estimated_cost = Column(Float, nullable=False, default=0.0)
    duration_hours = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    city = relationship("City", back_populates="activities")
    trip_assignments = relationship("TripActivity", back_populates="activity")
