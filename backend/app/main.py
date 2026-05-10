from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, dashboard
from app.database.connection import engine, Base
from app.models.user import User
from app.models.trip import Trip

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Traveloop AI Authentication API",
    description="Backend-first authentication module for Traveloop AI",
    version="1.0.0"
)

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

@app.get("/")
def root():
    return {"message": "Welcome to Traveloop AI API. Navigate to /docs for Swagger UI."}
