from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal
from app.models.models import Unit
from app.seed import seed_db

# Core routers
from app.api.dashboard import router as dashboard_router
from app.api.map import router as map_router
from app.api.network import router as network_router
from app.api.predictive import router as predictive_router

app = FastAPI(
    title="CIAP API", 
    description="Crime Intelligence & Analytical Platform API for Karnataka State Police"
)

# CORS configuration to allow local frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this. For datathon/local dev, * is perfect.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables and seed if empty
@app.on_event("startup")
def startup_event():
    print("Verifying database configuration...")
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed if database is completely empty
    db = SessionLocal()
    try:
        unit_count = db.query(Unit).count()
        if unit_count == 0:
            print("Database is empty. Running auto-seeding...")
            db.close()
            seed_db()
        else:
            print("Database already contains data. Skipping seeding.")
    except Exception as e:
        print(f"Error during startup DB check: {e}")
    finally:
        db.close()

# Include routers
app.include_router(dashboard_router)
app.include_router(map_router)
app.include_router(network_router)
app.include_router(predictive_router)

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "platform": "Crime Intelligence & Analytical Platform (CIAP)",
        "agency": "Karnataka State Police / State Crime Records Bureau"
    }
