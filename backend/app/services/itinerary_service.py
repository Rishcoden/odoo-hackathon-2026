from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.trip import Trip
from app.models.trip_stop import TripStop
from app.models.city import City
from app.models.user import User
from app.schemas.itinerary import TripStopCreate, TripStopUpdate, StopReorder, TripStopResponse
from datetime import datetime

def _validate_trip_ownership(db: Session, user: User, trip_id: str):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip

def _validate_dates_within_trip(trip: Trip, arrival_date: datetime, departure_date: datetime):
    # Truncate time for accurate day comparison if needed, but simple compare is fine for now
    if trip.start_date and arrival_date < trip.start_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Arrival date cannot be before trip start date")
    if trip.end_date and departure_date > trip.end_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Departure date cannot be after trip end date")

def get_or_create_city(db: Session, city_name: str, country: str):
    city_name_lower = city_name.strip().lower()
    country_lower = country.strip().lower()
    
    city = db.query(City).filter(City.city_name.ilike(city_name_lower), City.country.ilike(country_lower)).first()
    if not city:
        city = City(city_name=city_name.strip(), country=country.strip())
        db.add(city)
        db.commit()
        db.refresh(city)
    return city

def add_trip_stop(db: Session, user: User, trip_id: str, stop_in: TripStopCreate):
    trip = _validate_trip_ownership(db, user, trip_id)
    _validate_dates_within_trip(trip, stop_in.arrival_date, stop_in.departure_date)

    city = get_or_create_city(db, stop_in.city_name, stop_in.country)

    current_stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).count()
    new_order = current_stops + 1

    trip_stop = TripStop(
        trip_id=trip_id,
        city_id=city.id,
        arrival_date=stop_in.arrival_date,
        departure_date=stop_in.departure_date,
        stop_order=new_order
    )
    db.add(trip_stop)
    db.commit()
    db.refresh(trip_stop)

    return TripStopResponse(
        id=trip_stop.id,
        trip_id=trip_stop.trip_id,
        city_id=city.id,
        city_name=city.city_name,
        country=city.country,
        arrival_date=trip_stop.arrival_date,
        departure_date=trip_stop.departure_date,
        stop_order=trip_stop.stop_order
    )

def get_trip_stops(db: Session, user: User, trip_id: str):
    _validate_trip_ownership(db, user, trip_id)
    stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).order_by(TripStop.stop_order.asc()).all()
    
    return [TripStopResponse(
        id=s.id,
        trip_id=s.trip_id,
        city_id=s.city_id,
        city_name=s.city.city_name,
        country=s.city.country,
        arrival_date=s.arrival_date,
        departure_date=s.departure_date,
        stop_order=s.stop_order
    ) for s in stops]

def update_trip_stop(db: Session, user: User, stop_id: str, stop_in: TripStopUpdate):
    stop = db.query(TripStop).filter(TripStop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found")
        
    trip = _validate_trip_ownership(db, user, stop.trip_id)

    new_arrival = stop_in.arrival_date if stop_in.arrival_date else stop.arrival_date
    new_departure = stop_in.departure_date if stop_in.departure_date else stop.departure_date

    _validate_dates_within_trip(trip, new_arrival, new_departure)

    if stop_in.arrival_date: stop.arrival_date = stop_in.arrival_date
    if stop_in.departure_date: stop.departure_date = stop_in.departure_date
    
    db.commit()
    db.refresh(stop)

    return TripStopResponse(
        id=stop.id,
        trip_id=stop.trip_id,
        city_id=stop.city_id,
        city_name=stop.city.city_name,
        country=stop.city.country,
        arrival_date=stop.arrival_date,
        departure_date=stop.departure_date,
        stop_order=stop.stop_order
    )

def delete_trip_stop(db: Session, user: User, stop_id: str):
    stop = db.query(TripStop).filter(TripStop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found")
        
    _validate_trip_ownership(db, user, stop.trip_id)
    
    trip_id = stop.trip_id
    deleted_order = stop.stop_order
    
    db.delete(stop)
    
    subsequent_stops = db.query(TripStop).filter(TripStop.trip_id == trip_id, TripStop.stop_order > deleted_order).all()
    for s in subsequent_stops:
        s.stop_order -= 1
        
    db.commit()
    return {"message": "Stop deleted successfully"}

def reorder_trip_stop(db: Session, user: User, stop_id: str, reorder_in: StopReorder):
    stop = db.query(TripStop).filter(TripStop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found")
        
    _validate_trip_ownership(db, user, stop.trip_id)

    trip_id = stop.trip_id
    current_order = stop.stop_order
    new_order = reorder_in.new_order

    if current_order == new_order:
        return {"message": "Order unchanged"}

    total_stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).count()
    if new_order < 1 or new_order > total_stops:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid new order")

    if new_order > current_order:
        stops_to_shift = db.query(TripStop).filter(
            TripStop.trip_id == trip_id, 
            TripStop.stop_order > current_order, 
            TripStop.stop_order <= new_order
        ).all()
        for s in stops_to_shift:
            s.stop_order -= 1
    else:
        stops_to_shift = db.query(TripStop).filter(
            TripStop.trip_id == trip_id, 
            TripStop.stop_order >= new_order, 
            TripStop.stop_order < current_order
        ).all()
        for s in stops_to_shift:
            s.stop_order += 1

    stop.stop_order = new_order
    db.commit()
    return {"message": "Order updated successfully"}
