from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.trip import Trip
from app.models.trip_stop import TripStop
from app.models.city import City
from app.models.trip_activity import TripActivity
from app.models.activity import Activity
from app.models.expense import Expense
from app.models.packing_item import PackingItem
from app.schemas.analytics import GlobalOverviewResponse, BudgetBreakdownResponse, TopCitiesResponse, CityStat, ActivityCategoryResponse

def get_global_overview(db: Session, user: User) -> GlobalOverviewResponse:
    total_trips = db.query(func.count(Trip.id)).filter(Trip.user_id == user.id).scalar() or 0
    
    total_destinations = db.query(func.count(TripStop.id)).join(Trip).filter(Trip.user_id == user.id).scalar() or 0
    
    total_activities = db.query(func.count(TripActivity.id)).join(TripStop).join(Trip).filter(Trip.user_id == user.id).scalar() or 0

    packing_stats = db.query(
        func.count(PackingItem.id).label('total'),
        func.sum(func.cast(PackingItem.is_packed, func.integer())).label('packed')
    ).join(Trip).filter(Trip.user_id == user.id).first()
    
    total_items = packing_stats.total or 0
    packed_items = packing_stats.packed or 0
    packing_completion_rate = round((packed_items / total_items) * 100, 1) if total_items > 0 else 0.0

    return GlobalOverviewResponse(
        total_trips=total_trips,
        total_destinations=total_destinations,
        total_activities_planned=total_activities,
        packing_completion_rate=packing_completion_rate
    )

def get_budget_breakdown(db: Session, user: User) -> BudgetBreakdownResponse:
    # 1. Total Manual Expenses + Category Breakdown
    manual_expenses = db.query(
        Expense.category,
        func.sum(Expense.amount).label("total")
    ).join(Trip).filter(Trip.user_id == user.id).group_by(Expense.category).all()
    
    total_expenses = 0.0
    category_breakdown = {}
    
    for row in manual_expenses:
        cat = row.category or "Uncategorized"
        amt = float(row.total or 0.0)
        total_expenses += amt
        category_breakdown[cat] = category_breakdown.get(cat, 0.0) + amt

    # 2. Add Activity Costs
    activity_costs = db.query(
        Activity.category,
        func.sum(Activity.estimated_cost).label("total")
    ).join(TripActivity, TripActivity.activity_id == Activity.id)\
     .join(TripStop, TripStop.id == TripActivity.trip_stop_id)\
     .join(Trip, Trip.id == TripStop.trip_id)\
     .filter(Trip.user_id == user.id)\
     .group_by(Activity.category).all()

    for row in activity_costs:
        cat = row.category or "Activities"
        if not cat.strip(): cat = "Activities"
        amt = float(row.total or 0.0)
        total_expenses += amt
        category_breakdown[cat] = category_breakdown.get(cat, 0.0) + amt

    # 3. Average Trip Budget Limit
    avg_budget = db.query(func.avg(Trip.budget_limit)).filter(Trip.user_id == user.id, Trip.budget_limit != None).scalar() or 0.0

    return BudgetBreakdownResponse(
        total_expenses=total_expenses,
        average_trip_budget=float(avg_budget),
        budget_category_breakdown=category_breakdown
    )

def get_top_cities(db: Session, user: User) -> TopCitiesResponse:
    # Group by city_id, count how many times user has a trip_stop there
    results = db.query(
        City.city_name,
        City.country,
        func.count(TripStop.id).label('visit_count')
    ).join(TripStop, TripStop.city_id == City.id)\
     .join(Trip, Trip.id == TripStop.trip_id)\
     .filter(Trip.user_id == user.id)\
     .group_by(City.id, City.city_name, City.country)\
     .order_by(func.count(TripStop.id).desc())\
     .limit(5).all()

    cities = [CityStat(city_name=r.city_name, country=r.country, visit_count=r.visit_count) for r in results]
    
    return TopCitiesResponse(most_visited_cities=cities)

def get_activity_categories(db: Session, user: User) -> ActivityCategoryResponse:
    results = db.query(
        Activity.category,
        func.count(TripActivity.id).label('count')
    ).join(TripActivity, TripActivity.activity_id == Activity.id)\
     .join(TripStop, TripStop.id == TripActivity.trip_stop_id)\
     .join(Trip, Trip.id == TripStop.trip_id)\
     .filter(Trip.user_id == user.id)\
     .group_by(Activity.category).all()

    distribution = {}
    for row in results:
        cat = row.category or "Uncategorized"
        if not cat.strip(): cat = "Uncategorized"
        distribution[cat] = distribution.get(cat, 0) + int(row.count)

    return ActivityCategoryResponse(activity_distribution=distribution)
