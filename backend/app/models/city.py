from sqlalchemy import Column, String, DateTime, Float
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.connection import Base

class City(Base):
    __tablename__ = "cities"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    city_name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False)
    avg_cost_per_day = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trip_stops = relationship("TripStop", back_populates="city")
