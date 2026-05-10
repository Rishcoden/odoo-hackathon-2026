from pydantic import BaseModel
from typing import Dict, List

class GlobalOverviewResponse(BaseModel):
    total_trips: int
    total_destinations: int
    total_activities_planned: int
    packing_completion_rate: float # 0 to 100

class BudgetBreakdownResponse(BaseModel):
    total_expenses: float
    average_trip_budget: float
    budget_category_breakdown: Dict[str, float]

class CityStat(BaseModel):
    city_name: str
    country: str
    visit_count: int

class TopCitiesResponse(BaseModel):
    most_visited_cities: List[CityStat]

class ActivityCategoryResponse(BaseModel):
    activity_distribution: Dict[str, int]
