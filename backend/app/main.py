from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routes import auth, dashboard, trips, itinerary, activities, budget, packing, public, analytics, notes
from app.database.connection import engine, Base
from app.models.user import User
from app.models.trip import Trip
from app.models.city import City
from app.models.trip_stop import TripStop
from app.models.activity import Activity
from app.models.trip_activity import TripActivity
from app.models.expense import Expense
from app.models.packing_item import PackingItem
from app.models.trip_note import TripNote

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Traveloop AI Authentication API",
    description="Backend-first authentication module for Traveloop AI",
    version="1.0.0"
)

# Mount static files
os.makedirs("uploads", exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, update this to the exact frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Router
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(trips.router)
app.include_router(itinerary.router)
app.include_router(activities.router)
app.include_router(budget.router)
app.include_router(packing.router)
app.include_router(public.router)
app.include_router(analytics.router)
app.include_router(notes.router)

@app.get("/")
def root():
    return {"message": "Welcome to Traveloop AI API. Navigate to /docs for Swagger UI."}
