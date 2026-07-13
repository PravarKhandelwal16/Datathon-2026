from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CaseMaster, Accused

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    district: str = Query("all", description="Filter by district (all, bng, mys)"),
    db: Session = Depends(get_db)
):
    # Base query
    query = db.query(CaseMaster)
    if district == "bng":
        query = query.filter(CaseMaster.district == "Bengaluru Urban")
    elif district == "mys":
        query = query.filter(CaseMaster.district == "Mysuru")
        
    cases = query.all()
    
    # Simple aggregations
    incidents_count = len(cases)
    risk_zones = 8 if district == "bng" else 4 if district == "mys" else 14
    repeat_offenders = 52 if district == "bng" else 24 if district == "mys" else 89
    clearance_rate = "71%" if district == "bng" else "64%" if district == "mys" else "68%"
    
    # 7-day trend
    # Dynamic generation based on district values
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    trend_data = []
    
    crimes_pattern = {
        "all": [45, 52, 38, 65, 85, 110, 95],
        "bng": [25, 30, 20, 38, 50, 68, 55],
        "mys": [12, 14, 10, 18, 22, 28, 24]
    }[district]
    
    clearance_pattern = {
        "all": [32, 38, 28, 42, 58, 72, 64],
        "bng": [18, 22, 15, 24, 35, 48, 38],
        "mys": [8, 10, 8, 12, 16, 18, 15]
    }[district]

    for idx, day in enumerate(days):
        trend_data.append({
            "name": day,
            "crimes": crimes_pattern[idx],
            "clearance": clearance_pattern[idx]
        })

    # Categories breakdown
    categories = ["Theft", "Assault", "Fraud", "Narcotics", "Cyber"]
    colors = ["#dc2626", "#ea580c", "#d97706", "#7c3aed", "#0284c7"]
    cat_pattern = {
        "all": [120, 85, 45, 35, 58],
        "bng": [70, 42, 28, 18, 45],
        "mys": [32, 28, 12, 9, 8]
    }[district]
    
    cat_data = []
    for idx, cat in enumerate(categories):
        cat_data.append({
            "name": cat,
            "count": cat_pattern[idx],
            "color": colors[idx]
        })

    return {
        "incidents": str(incidents_count + 300 if district == "all" else incidents_count + 150), # seeded + offset for visual realism
        "riskZones": str(risk_zones),
        "repeatOffenders": str(repeat_offenders),
        "clearance": clearance_rate,
        "trend": trend_data,
        "categories": cat_data
    }

@router.get("/alerts")
def get_dashboard_alerts():
    return [
        { "id": "1", "time": "10 mins ago", "district": "Bengaluru Urban", "msg": "Spike in Chain Snatching activity near Majestic (Confidence 97%)", "severity": "critical" },
        { "id": "2", "time": "45 mins ago", "district": "Mysuru", "msg": "Cluster of Vehicle Thefts reported near City Market area", "severity": "high" },
        { "id": "3", "time": "2 hours ago", "district": "Kalaburagi", "msg": "Cross-border drug courier movement anomaly detected on NH-150A", "severity": "high" },
        { "id": "4", "time": "3 hours ago", "district": "Bengaluru Urban", "msg": "ATM Fraud pattern flagged targeting IT park employees", "severity": "medium" }
    ]

@router.get("/dispatches")
def get_dashboard_dispatches():
    return [
        { "id": "D10", "unit": "Patrol 14 (Majestic)", "status": "On Route", "destination": "KSR Majestic Bus Stand", "eta": "3 mins" },
        { "id": "D12", "unit": "Interceptor 3 (Koramangala)", "status": "Responding", "destination": "80 Feet Rd Junction", "eta": "5 mins" },
        { "id": "D15", "unit": "Patrol 9 (Mysuru Market)", "status": "On Scene", "destination": "Devaraja Market", "eta": "Active" },
        { "id": "D18", "unit": "Cyber Response Unit 2", "status": "Investigating", "destination": "Digital Fraud Center", "eta": "N/A" }
    ]
