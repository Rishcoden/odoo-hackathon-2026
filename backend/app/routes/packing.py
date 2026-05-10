from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.packing import PackingItemCreate, PackingItemUpdate, PackingItemToggle, PackingItemResponse
from app.services import packing_service

router = APIRouter(tags=["Packing Checklist"])

@router.post("/trips/{trip_id}/packing-items", response_model=PackingItemResponse, status_code=status.HTTP_201_CREATED)
def add_packing_item(
    trip_id: str,
    item_in: PackingItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return packing_service.add_packing_item(db, current_user, trip_id, item_in)

@router.get("/trips/{trip_id}/packing-items", response_model=List[PackingItemResponse])
def get_packing_items(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return packing_service.get_packing_items(db, current_user, trip_id)

@router.put("/packing-items/{item_id}", response_model=PackingItemResponse)
def update_packing_item(
    item_id: str,
    item_in: PackingItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return packing_service.update_packing_item(db, current_user, item_id, item_in)

@router.patch("/packing-items/{item_id}/toggle", response_model=PackingItemResponse)
def toggle_packing_item(
    item_id: str,
    toggle_in: PackingItemToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return packing_service.toggle_packing_item(db, current_user, item_id, toggle_in)

@router.delete("/packing-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_packing_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    packing_service.delete_packing_item(db, current_user, item_id)
    return None
