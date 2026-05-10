import secrets
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.trip import Trip
from app.models.user import User
from app.models.trip_stop import TripStop
from app.models.trip_activity import TripActivity
from app.models.packing_item import PackingItem
from app.schemas.public import ShareToggleRequest, ShareLinkResponse, PublicTripResponse, PublicTripOverview, PublicStopWithActivities
from app.services import budget_service

def _validate_trip_ownership(db: Session, user: User, trip_id: str):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip

def generate_share_link(db: Session, user: User, trip_id: str, base_url: str):
    trip = _validate_trip_ownership(db, user, trip_id)
    
    if not trip.public_share_token:
        trip.public_share_token = secrets.token_urlsafe(16)
        trip.is_public = True
        db.commit()
        db.refresh(trip)
        
    return ShareLinkResponse(
        trip_id=trip.id,
        is_public=trip.is_public,
        public_share_token=trip.public_share_token,
        share_url=f"{base_url}/shared/{trip.public_share_token}" if trip.is_public else None
    )

def toggle_visibility(db: Session, user: User, trip_id: str, request: ShareToggleRequest, base_url: str):
    trip = _validate_trip_ownership(db, user, trip_id)
    
    trip.is_public = request.is_public
    if trip.is_public and not trip.public_share_token:
        trip.public_share_token = secrets.token_urlsafe(16)
        
    db.commit()
    db.refresh(trip)
    
    return ShareLinkResponse(
        trip_id=trip.id,
        is_public=trip.is_public,
        public_share_token=trip.public_share_token,
        share_url=f"{base_url}/shared/{trip.public_share_token}" if trip.is_public else None
    )

def get_public_trip(db: Session, share_token: str):
    trip = db.query(Trip).filter(Trip.public_share_token == share_token, Trip.is_public == True).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Public itinerary not found or has been disabled.")

    # 1. Overview
    overview = PublicTripOverview(
        id=trip.id,
        title=trip.title,
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        description=trip.description,
        cover_image=trip.cover_image
    )

    # 2. Stops with Activities
    stops_db = db.query(TripStop).filter(TripStop.trip_id == trip.id).order_by(TripStop.stop_order).all()
    stops = []
    for s in stops_db:
        # Get activities for this stop
        activities = db.query(TripActivity).filter(TripActivity.trip_stop_id == s.id).order_by(TripActivity.scheduled_time.asc().nulls_last()).all()
        stops.append(PublicStopWithActivities(
            id=s.id,
            trip_id=s.trip_id,
            city_id=s.city_id,
            city_name=s.city.city_name,
            country=s.city.country,
            arrival_date=s.arrival_date,
            departure_date=s.departure_date,
            stop_order=s.stop_order,
            activities=activities
        ))

    # 3. Budget Summary
    # We can reuse the budget service method directly because it takes `user`, 
    # wait, the budget service requires a User object for ownership validation!
    # Let's write a bypass for the public view or duplicate the logic briefly.
    # To keep it DRY, I'll bypass ownership inside a helper or just duplicate the aggregation safely here since it's read-only.
    # Actually, let's just duplicate the aggregation safely here to avoid modifying `budget_service`.
    from sqlalchemy import func
    from app.models.expense import Expense
    from app.models.activity import Activity
    
    manual_expenses = db.query(Expense.category, func.sum(Expense.amount).label("total")).filter(Expense.trip_id == trip.id).group_by(Expense.category).all()
    total_manual_expenses = 0.0
    category_breakdown = {}
    for row in manual_expenses:
        cat = row.category or "Uncategorized"
        amt = float(row.total or 0.0)
        total_manual_expenses += amt
        category_breakdown[cat] = category_breakdown.get(cat, 0.0) + amt

    stops_subquery = db.query(TripStop.id).filter(TripStop.trip_id == trip.id).subquery()
    activity_costs = db.query(Activity.category, func.sum(Activity.estimated_cost).label("total")).join(TripActivity, TripActivity.activity_id == Activity.id).filter(TripActivity.trip_stop_id.in_(stops_subquery)).group_by(Activity.category).all()
    
    total_activity_cost = 0.0
    for row in activity_costs:
        cat = row.category or "Activities"
        if not cat.strip(): cat = "Activities"
        amt = float(row.total or 0.0)
        total_activity_cost += amt
        category_breakdown[cat] = category_breakdown.get(cat, 0.0) + amt

    total_estimated_budget = trip.budget_limit or 0.0
    remaining_budget = total_estimated_budget - (total_manual_expenses + total_activity_cost)

    from app.schemas.budget import BudgetSummaryResponse
    budget_summary = BudgetSummaryResponse(
        trip_id=trip.id,
        total_estimated_budget=total_estimated_budget,
        total_manual_expenses=total_manual_expenses,
        total_activity_cost=total_activity_cost,
        remaining_budget=remaining_budget,
        category_breakdown=category_breakdown
    )

    # 4. Packing Progress
    packing_items = db.query(PackingItem).filter(PackingItem.trip_id == trip.id).all()
    total_items = len(packing_items)
    packed_items = sum(1 for item in packing_items if item.is_packed)
    progress_percentage = round((packed_items / total_items) * 100) if total_items > 0 else 0
    
    packing_progress = {
        "packed": packed_items,
        "total": total_items,
        "percentage": progress_percentage
    }

    return PublicTripResponse(
        overview=overview,
        stops=stops,
        budget_summary=budget_summary,
        packing_progress=packing_progress
    )
