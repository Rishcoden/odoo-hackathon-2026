from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.models.trip import Trip
from app.schemas.dashboard import DashboardOverview, TripSummary, Recommendation

def get_dashboard_overview(db: Session, user: User) -> DashboardOverview:
    trips = db.query(Trip).filter(Trip.user_id == user.id).all()
    
    total_trips = len(trips)
    upcoming_trips = sum(1 for trip in trips if trip.start_date and trip.start_date > datetime.utcnow())
    total_budget = sum(trip.budget_limit for trip in trips if trip.budget_limit)
    
    recent_trip_count = min(5, total_trips)
    
    return DashboardOverview(
        user_name=user.name,
        total_trips=total_trips,
        upcoming_trips=upcoming_trips,
        total_budget=total_budget,
        recent_trip_count=recent_trip_count
    )

def get_recent_trips(db: Session, user: User):
    trips = db.query(Trip).filter(Trip.user_id == user.id).order_by(Trip.created_at.desc()).limit(5).all()
    return [
        TripSummary(
            trip_id=trip.id,
            title=trip.title,
            start_date=trip.start_date,
            end_date=trip.end_date,
            budget_limit=trip.budget_limit
        ) for trip in trips
    ]

def get_recommendations():
    # Placeholder data for future AI recommendations
    return [
        Recommendation(city_name="Tokyo", country="Japan", estimated_budget=1500.0),
        Recommendation(city_name="Paris", country="France", estimated_budget=1200.0),
        Recommendation(city_name="Bali", country="Indonesia", estimated_budget=800.0)
    ]
