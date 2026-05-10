from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.connection import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    category = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False, default=0.0)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="expenses")
