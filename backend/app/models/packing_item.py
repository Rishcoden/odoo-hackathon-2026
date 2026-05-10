from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.connection import Base

class PackingItem(Base):
    __tablename__ = "packing_items"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    is_packed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="packing_items")
