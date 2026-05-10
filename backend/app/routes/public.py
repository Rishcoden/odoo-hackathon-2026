from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.public import ShareToggleRequest, ShareLinkResponse, PublicTripResponse
from app.services import public_service
import os

router = APIRouter(tags=["Shared Itinerary"])

# We'll construct the base URL using the Request object, or a fallback if running behind a proxy.
# Since this is a React SPA, the share URL should point to the frontend domain.
# For simplicity, we can pass a hardcoded frontend origin or let the frontend construct the full URL.
# Let's pass a placeholder base_url, the frontend will replace it.
FRONTEND_BASE_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

@router.post("/trips/{trip_id}/share", response_model=ShareLinkResponse)
def generate_share_link(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return public_service.generate_share_link(db, current_user, trip_id, FRONTEND_BASE_URL)

@router.patch("/trips/{trip_id}/visibility", response_model=ShareLinkResponse)
def toggle_visibility(
    trip_id: str,
    request: ShareToggleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return public_service.toggle_visibility(db, current_user, trip_id, request, FRONTEND_BASE_URL)

@router.get("/public/trips/{share_token}", response_model=PublicTripResponse)
def get_public_trip(
    share_token: str,
    db: Session = Depends(get_db)
):
    # Notice: NO get_current_user dependency here! This is purely public.
    return public_service.get_public_trip(db, share_token)
