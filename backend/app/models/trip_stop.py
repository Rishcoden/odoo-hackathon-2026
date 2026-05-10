from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.connection import Base

class TripStop(Base):
    __tablename__ = "trip_stops"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    arrival_date = Column(DateTime, nullable=False)
    departure_date = Column(DateTime, nullable=False)
    stop_order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City", back_populates="trip_stops")
