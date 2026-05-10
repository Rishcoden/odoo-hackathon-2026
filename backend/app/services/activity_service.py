from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.activity import Activity
from app.models.trip_activity import TripActivity
from app.models.trip_stop import TripStop
from app.models.city import City
from app.models.trip import Trip
from app.models.user import User
from app.schemas.activity import ActivityCreate, TripActivityCreate, TripActivityUpdate

def _validate_stop_ownership(db: Session, user: User, stop_id: str):
    stop = db.query(TripStop).join(Trip).filter(TripStop.id == stop_id, Trip.user_id == user.id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip stop not found")
    return stop

def get_city_activities(db: Session, city_id: str, category: str = None):
    query = db.query(Activity).filter(Activity.city_id == city_id)
    if category:
        query = query.filter(Activity.category.ilike(category))
    return query.all()

def create_activity(db: Session, city_id: str, activity_in: ActivityCreate):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found")
        
    activity = Activity(
        city_id=city_id,
        title=activity_in.title,
        description=activity_in.description,
        category=activity_in.category,
        estimated_cost=activity_in.estimated_cost,
        duration_hours=activity_in.duration_hours
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

def assign_activity(db: Session, user: User, stop_id: str, assignment_in: TripActivityCreate):
    stop = _validate_stop_ownership(db, user, stop_id)
    
    activity = db.query(Activity).filter(Activity.id == assignment_in.activity_id, Activity.city_id == stop.city_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Activity not found or does not belong to this city")

    trip_activity = TripActivity(
        trip_stop_id=stop_id,
        activity_id=assignment_in.activity_id,
        scheduled_time=assignment_in.scheduled_time,
        notes=assignment_in.notes
    )
    db.add(trip_activity)
    db.commit()
    db.refresh(trip_activity)
    return trip_activity

def get_assigned_activities(db: Session, user: User, stop_id: str):
    _validate_stop_ownership(db, user, stop_id)
    return db.query(TripActivity).filter(TripActivity.trip_stop_id == stop_id).order_by(TripActivity.scheduled_time.asc().nulls_last()).all()

def update_trip_activity(db: Session, user: User, trip_activity_id: str, update_in: TripActivityUpdate):
    trip_activity = db.query(TripActivity).join(TripStop).join(Trip).filter(TripActivity.id == trip_activity_id, Trip.user_id == user.id).first()
    if not trip_activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned activity not found")

    if update_in.scheduled_time is not None:
        trip_activity.scheduled_time = update_in.scheduled_time
    if update_in.notes is not None:
        trip_activity.notes = update_in.notes
        
    db.commit()
    db.refresh(trip_activity)
    return trip_activity

def delete_trip_activity(db: Session, user: User, trip_activity_id: str):
    trip_activity = db.query(TripActivity).join(TripStop).join(Trip).filter(TripActivity.id == trip_activity_id, Trip.user_id == user.id).first()
    if not trip_activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned activity not found")

    db.delete(trip_activity)
    db.commit()
    return {"message": "Assigned activity removed successfully"}
