from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import SocioEconomic

router = APIRouter(prefix="/api/predictive", tags=["Predictive Analytics"])

@router.get("/socio")
def get_predictive_socio(db: Session = Depends(get_db)):
    db_socio = db.query(SocioEconomic).all()
    
    districts_list = [
        {
            "district": s.district,
            "urbanization": s.urbanization,
            "povertyIdx": s.poverty_idx,
            "crimeRate": s.crime_rate,
            "unemployment": s.unemployment,
            "pop": s.pop,
            "literacy": s.literacy
        }
        for s in db_socio
    ]
    
    # Growth overlay mockup
    growth_overlay = [
        {"year": 2018, "urban": 36, "crime": 1820, "poverty": 48},
        {"year": 2019, "urban": 38, "crime": 1940, "poverty": 45},
        {"year": 2020, "urban": 39, "crime": 1680, "poverty": 46},
        {"year": 2021, "urban": 40, "crime": 1920, "poverty": 44},
        {"year": 2022, "urban": 42, "crime": 2180, "poverty": 41},
        {"year": 2023, "urban": 44, "crime": 2340, "poverty": 38},
        {"year": 2024, "urban": 46, "crime": 2510, "poverty": 36},
        {"year": 2025, "urban": 48, "crime": 2680, "poverty": 34},
    ]
    
    return {
        "districts": districts_list,
        "overlay": growth_overlay
    }

@router.get("/forecast")
def get_predictive_forecast():
    risk_forecast = [
        {"month": "Jan", "actual": 1820, "predicted": 1850, "upper": 1970, "lower": 1730},
        {"month": "Feb", "actual": 1940, "predicted": 1910, "upper": 2040, "lower": 1780},
        {"month": "Mar", "actual": 2100, "predicted": 2080, "upper": 2210, "lower": 1950},
        {"month": "Apr", "actual": 1980, "predicted": 2020, "upper": 2160, "lower": 1880},
        {"month": "May", "actual": 2240, "predicted": 2200, "upper": 2350, "lower": 2050},
        {"month": "Jun", "actual": 2380, "predicted": 2350, "upper": 2500, "lower": 2200},
        {"month": "Jul", "actual": 2510, "predicted": 2480, "upper": 2640, "lower": 2320},
        {"month": "Aug", "actual": None, "predicted": 2620, "upper": 2800, "lower": 2440},
        {"month": "Sep", "actual": None, "predicted": 2750, "upper": 2950, "lower": 2550},
        {"month": "Oct", "actual": None, "predicted": 2900, "upper": 3110, "lower": 2690},
        {"month": "Nov", "actual": None, "predicted": 3040, "upper": 3270, "lower": 2810},
        {"month": "Dec", "actual": None, "predicted": 3180, "upper": 3420, "lower": 2940},
    ]
    
    district_scores = [
        {"district": "Bengaluru Urban", "current": 91, "predicted": 96, "trend": "up", "category": "critical"},
        {"district": "Kalaburagi", "current": 78, "predicted": 85, "trend": "up", "category": "high"},
        {"district": "Raichur", "current": 74, "predicted": 80, "trend": "up", "category": "high"},
        {"district": "Mysuru", "current": 69, "predicted": 72, "trend": "up", "category": "high"},
        {"district": "Vijayapura", "current": 64, "predicted": 66, "trend": "stable", "category": "medium"},
        {"district": "Belagavi", "current": 58, "predicted": 55, "trend": "down", "category": "medium"},
        {"district": "Hubballi-Dharwad", "current": 55, "predicted": 57, "trend": "stable", "category": "medium"},
        {"district": "Mangaluru", "current": 38, "predicted": 35, "trend": "down", "category": "low"},
        {"district": "Shivamogga", "current": 32, "predicted": 30, "trend": "down", "category": "low"},
        {"district": "Bengaluru Rural", "current": 44, "predicted": 46, "trend": "up", "category": "medium"},
    ]
    
    category_forecast = [
        {"category": "Theft", "current": 42, "q1": 44, "q2": 47, "q3": 51},
        {"category": "Assault", "current": 18, "q1": 17, "q2": 16, "q3": 15},
        {"category": "Fraud", "current": 15, "q1": 18, "q2": 22, "q3": 26},
        {"category": "Narcotics", "current": 12, "q1": 14, "q2": 16, "q3": 19},
        {"category": "Cyber", "current": 8, "q1": 12, "q2": 16, "q3": 22},
        {"category": "Burglary", "current": 5, "q1": 4, "q2": 4, "q3": 3},
    ]
    
    return {
        "forecast": risk_forecast,
        "districts": district_scores,
        "categories": category_forecast
    }

@router.get("/anomalies")
def get_predictive_anomalies():
    anomaly_timeseries = [
        {"time": "00:00", "rate": 12, "baseline": 14, "anomaly": None},
        {"time": "01:00", "rate": 8, "baseline": 10, "anomaly": None},
        {"time": "02:00", "rate": 6, "baseline": 8, "anomaly": None},
        {"time": "03:00", "rate": 5, "baseline": 7, "anomaly": None},
        {"time": "04:00", "rate": 4, "baseline": 6, "anomaly": None},
        {"time": "05:00", "rate": 7, "baseline": 8, "anomaly": None},
        {"time": "06:00", "rate": 18, "baseline": 16, "anomaly": None},
        {"time": "07:00", "rate": 38, "baseline": 35, "anomaly": None},
        {"time": "08:00", "rate": 52, "baseline": 50, "anomaly": None},
        {"time": "09:00", "rate": 48, "baseline": 46, "anomaly": None},
        {"time": "10:00", "rate": 44, "baseline": 42, "anomaly": None},
        {"time": "11:00", "rate": 41, "baseline": 40, "anomaly": None},
        {"time": "12:00", "rate": 55, "baseline": 44, "anomaly": 55},
        {"time": "13:00", "rate": 48, "baseline": 42, "anomaly": None},
        {"time": "14:00", "rate": 40, "baseline": 38, "anomaly": None},
        {"time": "15:00", "rate": 38, "baseline": 36, "anomaly": None},
        {"time": "16:00", "rate": 42, "baseline": 40, "anomaly": None},
        {"time": "17:00", "rate": 58, "baseline": 52, "anomaly": None},
        {"time": "18:00", "rate": 72, "baseline": 62, "anomaly": None},
        {"time": "19:00", "rate": 88, "baseline": 70, "anomaly": 88},
        {"time": "20:00", "rate": 138, "baseline": 76, "anomaly": 138},
        {"time": "21:00", "rate": 102, "baseline": 74, "anomaly": 102},
        {"time": "22:00", "rate": 64, "baseline": 58, "anomaly": None},
        {"time": "23:00", "rate": 28, "baseline": 30, "anomaly": None},
    ]
    
    events = [
        {"id": "A1", "time": "20:14", "district": "Bengaluru Urban", "category": "Chain Snatching", "deviation": 81, "confidence": 97, "severity": "critical", "description": "Activity rate 81% above 30-day baseline. 14 incidents in 45 min window near Majestic. Coordinated gang pattern suspected.", "linkedCases": 14},
        {"id": "A2", "time": "19:08", "district": "Mysuru", "category": "Vehicle Theft", "deviation": 26, "confidence": 84, "severity": "high", "description": "Cluster of 6 vehicle thefts in a 3km radius near Mysuru City Market. Same MO as FIR/189/2024 gang.", "linkedCases": 6},
        {"id": "A3", "time": "12:22", "district": "Bengaluru Urban", "category": "ATM Fraud", "deviation": 25, "confidence": 79, "severity": "high", "description": "Unusual spike in ATM fraud complaints (9 cases) during lunch hour — targets office-goers near CBD.", "linkedCases": 9},
        {"id": "A4", "time": "21:05", "district": "Kalaburagi", "category": "Narcotics", "deviation": 44, "confidence": 91, "severity": "critical", "description": "Border area activity 44% above norm. Suspected cross-state drug courier movement along NH-150A.", "linkedCases": 3},
    ]
    
    return {
        "timeseries": anomaly_timeseries,
        "events": events
    }

@router.get("/patterns")
def get_predictive_patterns():
    # Heatmap mockup
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    base_hour_pattern = [5, 3, 2, 2, 2, 3, 8, 28, 45, 40, 36, 34, 33, 31, 30, 32, 38, 52, 70, 95, 110, 82, 50, 22]
    
    heatmap = []
    for day in days:
        for hour, base in enumerate(base_hour_pattern):
            heatmap.append({"hour": hour, "day": day, "value": base})
            
    monthly_trend = [
        {"month": "Aug 24", "theft": 320, "assault": 140, "fraud": 95, "narcotics": 72, "cyber": 48},
        {"month": "Sep 24", "theft": 298, "assault": 128, "fraud": 108, "narcotics": 68, "cyber": 55},
        {"month": "Oct 24", "theft": 345, "assault": 152, "fraud": 112, "narcotics": 80, "cyber": 60},
        {"month": "Nov 24", "theft": 312, "assault": 135, "fraud": 125, "narcotics": 74, "cyber": 72},
        {"month": "Dec 24", "theft": 368, "assault": 164, "fraud": 118, "narcotics": 88, "cyber": 78},
        {"month": "Jan 25", "theft": 388, "assault": 158, "fraud": 140, "narcotics": 92, "cyber": 85},
        {"month": "Feb 25", "theft": 355, "assault": 142, "fraud": 155, "narcotics": 86, "cyber": 98},
        {"month": "Mar 25", "theft": 410, "assault": 172, "fraud": 162, "narcotics": 98, "cyber": 108},
        {"month": "Apr 25", "theft": 398, "assault": 168, "fraud": 172, "narcotics": 105, "cyber": 118},
        {"month": "May 25", "theft": 432, "assault": 180, "fraud": 185, "narcotics": 112, "cyber": 128},
        {"month": "Jun 25", "theft": 448, "assault": 185, "fraud": 198, "narcotics": 120, "cyber": 140},
        {"month": "Jul 25", "theft": 465, "assault": 188, "fraud": 212, "narcotics": 128, "cyber": 155},
    ]
    
    resource_gaps = [
        {"district": "Bengaluru Urban", "required": 112, "deployed": 88, "gap": 24},
        {"district": "Kalaburagi", "required": 52, "deployed": 34, "gap": 18},
        {"district": "Raichur", "required": 44, "deployed": 28, "gap": 16},
        {"district": "Mysuru", "required": 68, "deployed": 52, "gap": 16},
        {"district": "Vijayapura", "required": 40, "deployed": 30, "gap": 10},
        {"district": "Belagavi", "required": 48, "deployed": 44, "gap": 4},
        {"district": "Hubballi-Dharwad", "required": 44, "deployed": 42, "gap": 2},
        {"district": "Mangaluru", "required": 36, "deployed": 38, "gap": -2},
        {"district": "Shivamogga", "required": 28, "deployed": 30, "gap": -2},
    ]
    
    return {
        "heatmap": heatmap,
        "trends": monthly_trend,
        "gaps": resource_gaps
    }

@router.get("/behavioral")
def get_predictive_behavioral():
    mo_trend = [
        {"month": "Sep 24", "chainSnatch": 48, "vehicleTheft": 62, "pickpocket": 38, "houseBrk": 22, "atmFraud": 15, "narcotics": 28},
        {"month": "Oct 24", "chainSnatch": 55, "vehicleTheft": 58, "pickpocket": 42, "houseBrk": 25, "atmFraud": 18, "narcotics": 32},
        {"month": "Nov 24", "chainSnatch": 62, "vehicleTheft": 65, "pickpocket": 40, "houseBrk": 28, "atmFraud": 24, "narcotics": 38},
        {"month": "Dec 24", "chainSnatch": 70, "vehicleTheft": 72, "pickpocket": 52, "houseBrk": 32, "atmFraud": 28, "narcotics": 42},
        {"month": "Jan 25", "chainSnatch": 65, "vehicleTheft": 68, "pickpocket": 45, "houseBrk": 30, "atmFraud": 35, "narcotics": 48},
        {"month": "Feb 25", "chainSnatch": 72, "vehicleTheft": 75, "pickpocket": 50, "houseBrk": 35, "atmFraud": 42, "narcotics": 52},
        {"month": "Mar 25", "chainSnatch": 80, "vehicleTheft": 80, "pickpocket": 58, "houseBrk": 38, "atmFraud": 50, "narcotics": 58},
        {"month": "Apr 25", "chainSnatch": 88, "vehicleTheft": 85, "pickpocket": 62, "houseBrk": 40, "atmFraud": 60, "narcotics": 64},
        {"month": "May 25", "chainSnatch": 95, "vehicleTheft": 92, "pickpocket": 68, "houseBrk": 44, "atmFraud": 72, "narcotics": 70},
        {"month": "Jun 25", "chainSnatch": 102, "vehicleTheft": 98, "pickpocket": 75, "houseBrk": 48, "atmFraud": 84, "narcotics": 78},
    ]
    
    radar_traits = [
        {"trait": "Recidivism", "value": 82},
        {"trait": "Gang Affiliation", "value": 68},
        {"trait": "Cross-District", "value": 74},
        {"trait": "Weapon Use", "value": 45},
        {"trait": "Cyber Overlay", "value": 38},
        {"trait": "Night Activity", "value": 71},
        {"trait": "Victim Profile", "value": 60},
    ]
    
    org_networks = [
        {"name": "Majestic Gang (BNG)", "members": 7, "activeCases": 12, "riskScore": 96, "trend": "up", "moTags": ["Chain Snatching", "Pickpocket", "Vehicle Theft"]},
        {"name": "NH-150A Cartel", "members": 12, "activeCases": 8, "riskScore": 91, "trend": "up", "moTags": ["Narcotics", "Extortion", "Land Grab"]},
        {"name": "Mysuru Market Crew", "members": 4, "activeCases": 6, "riskScore": 78, "trend": "stable", "moTags": ["Vehicle Theft", "House Breaking"]},
        {"name": "Digital Fraud Ring", "members": 9, "activeCases": 18, "riskScore": 85, "trend": "up", "moTags": ["ATM Fraud", "Cyber", "Identity Theft"]},
        {"name": "Coastal Smugglers", "members": 15, "activeCases": 4, "riskScore": 72, "trend": "down", "moTags": ["Narcotics", "Smuggling"]},
    ]
    
    jxn_matrix = [
        {"district": "BNG Urban", "chainSnatch": 95, "vehicleTheft": 78, "fraud": 68, "narcotics": 48, "burglary": 32},
        {"district": "Mysuru", "chainSnatch": 60, "vehicleTheft": 88, "fraud": 42, "narcotics": 38, "burglary": 75},
        {"district": "Kalaburagi", "chainSnatch": 30, "vehicleTheft": 45, "fraud": 35, "narcotics": 92, "burglary": 28},
        {"district": "Hubballi", "chainSnatch": 50, "vehicleTheft": 62, "fraud": 55, "narcotics": 44, "burglary": 38},
        {"district": "Belagavi", "chainSnatch": 42, "vehicleTheft": 58, "fraud": 48, "narcotics": 52, "burglary": 30},
    ]
    
    return {
        "moTrend": mo_trend,
        "radar": radar_traits,
        "networks": org_networks,
        "matrix": jxn_matrix
    }
