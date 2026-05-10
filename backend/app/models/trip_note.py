from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.connection import Base

def generate_uuid():
    return str(uuid.uuid4())

class TripNote(Base):
    __tablename__ = "trip_notes"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    trip_id = Column(String, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    trip_stop_id = Column(String, ForeignKey("trip_stops.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    note_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="notes")
    trip_stop = relationship("TripStop", back_populates="notes")
