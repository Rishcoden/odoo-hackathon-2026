from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.connection import Base

class TripActivity(Base):
    __tablename__ = "trip_activities"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    trip_stop_id = Column(String, ForeignKey("trip_stops.id"), nullable=False)
    activity_id = Column(String, ForeignKey("activities.id"), nullable=False)
    scheduled_time = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trip_stop = relationship("TripStop", back_populates="assigned_activities")
    activity = relationship("Activity", back_populates="trip_assignments")
