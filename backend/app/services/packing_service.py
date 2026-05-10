from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.trip import Trip
from app.models.packing_item import PackingItem
from app.models.user import User
from app.schemas.packing import PackingItemCreate, PackingItemUpdate, PackingItemToggle

def _validate_trip_ownership(db: Session, user: User, trip_id: str):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip

def add_packing_item(db: Session, user: User, trip_id: str, item_in: PackingItemCreate):
    _validate_trip_ownership(db, user, trip_id)
    item = PackingItem(
        trip_id=trip_id,
        item_name=item_in.item_name,
        category=item_in.category,
        is_packed=item_in.is_packed
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def get_packing_items(db: Session, user: User, trip_id: str):
    _validate_trip_ownership(db, user, trip_id)
    return db.query(PackingItem).filter(PackingItem.trip_id == trip_id).order_by(PackingItem.created_at.desc()).all()

def update_packing_item(db: Session, user: User, item_id: str, item_in: PackingItemUpdate):
    item = db.query(PackingItem).join(Trip).filter(PackingItem.id == item_id, Trip.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Packing item not found")

    if item_in.item_name is not None: item.item_name = item_in.item_name
    if item_in.category is not None: item.category = item_in.category
    
    db.commit()
    db.refresh(item)
    return item

def toggle_packing_item(db: Session, user: User, item_id: str, toggle_in: PackingItemToggle):
    item = db.query(PackingItem).join(Trip).filter(PackingItem.id == item_id, Trip.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Packing item not found")

    item.is_packed = toggle_in.is_packed
    db.commit()
    db.refresh(item)
    return item

def delete_packing_item(db: Session, user: User, item_id: str):
    item = db.query(PackingItem).join(Trip).filter(PackingItem.id == item_id, Trip.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Packing item not found")

    db.delete(item)
    db.commit()
    return {"message": "Packing item deleted successfully"}
