from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CaseMaster

router = APIRouter(prefix="/api/map", tags=["Geospatial Map"])

# Static coordinates fallback for KSP districts
DISTRICT_COORDS = {
    "Bengaluru Urban": {"lat": 12.9716, "lng": 77.5946},
    "Mysuru": {"lat": 12.2958, "lng": 76.6385},
    "Kalaburagi": {"lat": 17.3294, "lng": 76.8343},
    "Hubballi-Dharwad": {"lat": 15.3647, "lng": 75.1240},
    "Belagavi": {"lat": 15.8497, "lng": 74.4977},
    "Bengaluru Rural": {"lat": 13.2291, "lng": 77.5746},
    "Mangaluru": {"lat": 12.9141, "lng": 74.8560},
    "Shivamogga": {"lat": 13.9299, "lng": 75.5681},
}

@router.get("/districts")
def get_map_districts(
    category: str = Query("all", description="Filter by category"),
    hour: int = Query(None, description="Spatiotemporal hour filter (0-23)"),
    db: Session = Depends(get_db)
):
    query = db.query(CaseMaster)
    if category != "all":
        query = query.filter(CaseMaster.category == category)
        
    cases = query.all()
    
    # Calculate counts per district
    counts = {}
    for c in cases:
        counts[c.district] = counts.get(c.district, 0) + 1
        
    # Build district response matching the frontend expectations
    # Karnataka Police Theme scale
    districts_data = []
    
    # Base configuration for standard list
    base_districts = [
        {"name": "Bengaluru Urban", "firs": 284, "severity": "critical", "alerts": True, "stations": 42, "patrols": 18, "trend": 14},
        {"name": "Mysuru", "firs": 112, "severity": "high", "alerts": True, "stations": 18, "patrols": 9, "trend": 8},
        {"name": "Kalaburagi", "firs": 96, "severity": "high", "alerts": True, "stations": 14, "patrols": 6, "trend": -2},
        {"name": "Hubballi-Dharwad", "firs": 68, "severity": "medium", "alerts": False, "stations": 12, "patrols": 5, "trend": 4},
        {"name": "Belagavi", "firs": 55, "severity": "medium", "alerts": False, "stations": 15, "patrols": 6, "trend": 1},
        {"name": "Bengaluru Rural", "firs": 48, "severity": "medium", "alerts": False, "stations": 11, "patrols": 4, "trend": 3},
        {"name": "Mangaluru", "firs": 38, "severity": "low", "alerts": False, "stations": 10, "patrols": 5, "trend": -5},
        {"name": "Shivamogga", "firs": 32, "severity": "low", "alerts": False, "stations": 9, "patrols": 3, "trend": 0},
    ]
    
    for bd in base_districts:
        name = bd["name"]
        coords = DISTRICT_COORDS.get(name, {"lat": 12.9, "lng": 77.5})
        
        # Adjust base FIR count if active category filters exist
        firs_count = bd["firs"]
        if category != "all":
            # Just a mock factor to show change based on category filter
            cat_weights = {"Theft": 0.4, "Assault": 0.25, "Fraud": 0.15, "Narcotics": 0.1, "Cyber": 0.15, "Burglary": 0.08}
            weight = cat_weights.get(category, 0.2)
            firs_count = max(2, int(firs_count * weight))
            
        # Adjust spatiotemporal hour scale
        if hour is not None:
            # Shift radius to mimic spatiotemporal hotspots
            # Base diurnal cycle: peaks at evening (19-21), lowest at early morning (3-5)
            if 18 <= hour <= 22:
                multiplier = 1.6 if name in ["Bengaluru Urban", "Mysuru"] else 1.1
            elif 3 <= hour <= 6:
                multiplier = 0.3
            else:
                multiplier = 0.8
            firs_count = max(1, int(firs_count * multiplier))
            
        districts_data.append({
            "name": name,
            "lat": coords["lat"],
            "lng": coords["lng"],
            "firs": firs_count,
            "severity": "critical" if firs_count > 150 else "high" if firs_count > 80 else "medium" if firs_count > 40 else "low",
            "alerts": bd["alerts"],
            "stations": bd["stations"],
            "patrols": bd["patrols"],
            "trend": bd["trend"]
        })
        
    return districts_data

@router.get("/drilldown/{district}")
def get_map_drilldown(district: str):
    # Simulated detail payload matching frontend expectations
    # 24h distribution mockup
    hours_24 = [
        {"hour": "00:00", "count": 12}, {"hour": "02:00", "count": 6},
        {"hour": "04:00", "count": 4},  {"hour": "06:00", "count": 18},
        {"hour": "08:00", "count": 35}, {"hour": "10:00", "count": 44},
        {"hour": "12:00", "count": 48}, {"hour": "14:00", "count": 40},
        {"hour": "16:00", "count": 42}, {"hour": "18:00", "count": 58},
        {"hour": "20:00", "count": 95}, {"hour": "22:00", "count": 64}
    ]
    
    # 7-day trend
    trend_7d = [
        {"day": "Mon", "firs": 22}, {"day": "Tue", "firs": 28},
        {"day": "Wed", "firs": 20}, {"day": "Thu", "firs": 35},
        {"day": "Fri", "firs": 48}, {"day": "Sat", "firs": 62},
        {"day": "Sun", "firs": 55}
    ]
    
    # Categories breakdown
    categories = [
        {"category": "Theft", "pct": 42},
        {"category": "Assault", "pct": 22},
        {"category": "Fraud", "pct": 14},
        {"category": "Narcotics", "pct": 10},
        {"category": "Cyber", "pct": 8},
        {"category": "Burglary", "pct": 4}
    ]
    
    return {
        "district": district,
        "firs": 284 if district == "Bengaluru Urban" else 112 if district == "Mysuru" else 85,
        "delta": "+14%" if district == "Bengaluru Urban" else "+8%" if district == "Mysuru" else "-2%",
        "topCategory": "Theft (Chain Snatching)" if district in ["Bengaluru Urban", "Mysuru"] else "Narcotics",
        "stations": 42 if district == "Bengaluru Urban" else 18 if district == "Mysuru" else 12,
        "patrols": 18 if district == "Bengaluru Urban" else 9 if district == "Mysuru" else 6,
        "hours": hours_24,
        "trend": trend_7d,
        "categories": categories
    }
