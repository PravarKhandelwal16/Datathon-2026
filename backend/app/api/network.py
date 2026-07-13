from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Accused, HiddenAssociation

router = APIRouter(prefix="/api/network", tags=["Link & Network Analysis"])

@router.get("/graph")
def get_network_graph(
    groups: List[str] = Query(["suspect", "victim", "location", "case", "vehicle", "organization"]),
    links: List[str] = Query(["accused_in", "victim_in", "occurred_at", "linked_case", "derived_mo", "associate", "uses_vehicle", "member_of"]),
    db: Session = Depends(get_db)
):
    # Static master nodes representing seed + auxiliary relationships
    nodes = [
        # Suspects
        {"id": "S1", "name": "Ravi Kumar B.", "group": "suspect", "val": 28, "age": 34, "dob": "14 Mar 1990", "address": "12, Gandhi Nagar, Bengaluru", "district": "Bengaluru Urban", "priorConvictions": 4, "firs": ["FIR/104/2026", "FIR/215/2025"], "moTags": ["Chain Snatching", "Vehicle Theft", "Pickpocket"], "riskScore": 91, "jurisdictions": ["Bengaluru Urban", "Mysuru", "Mandya"]},
        {"id": "S2", "name": "Suresh M. Gowda", "group": "suspect", "val": 22, "age": 29, "dob": "08 Jun 1995", "address": "7A, Sudama Layout, Mysuru", "district": "Mysuru", "priorConvictions": 2, "firs": ["FIR/215/2025", "FIR/189/2024"], "moTags": ["Chain Snatching", "House Breaking"], "riskScore": 76, "jurisdictions": ["Mysuru", "Mandya"]},
        {"id": "S3", "name": "Imran Pasha", "group": "suspect", "val": 20, "age": 41, "dob": "22 Nov 1982", "address": "34, Cox Town, Bengaluru", "district": "Bengaluru Urban", "priorConvictions": 6, "firs": ["FIR/104/2026", "FIR/501/2025"], "moTags": ["Extortion", "Land Grab", "Narcotics"], "riskScore": 97, "jurisdictions": ["Bengaluru Urban", "Kalaburagi", "Hubballi-Dharwad"]},
        {"id": "S4", "name": "Prakash Shetty", "group": "suspect", "val": 16, "age": 26, "dob": "15 Jan 1998", "address": "22, Kadri Road, Mangaluru", "district": "Mangaluru", "priorConvictions": 1, "firs": ["FIR/331/2026"], "moTags": ["ATM Fraud", "Pickpocket"], "riskScore": 55, "jurisdictions": ["Mangaluru", "Udupi"]},
        {"id": "S5", "name": "Venkatesha D.", "group": "suspect", "val": 18, "age": 37, "dob": "03 Apr 1987", "address": "9, Devaraj Urs Road, Mysuru", "district": "Mysuru", "priorConvictions": 3, "firs": ["FIR/189/2024"], "moTags": ["Vehicle Theft", "House Breaking"], "riskScore": 83, "jurisdictions": ["Mysuru", "Bengaluru Urban"]},
        # Victims
        {"id": "V1", "name": "Anil B. Rao", "group": "victim", "val": 12, "age": 52, "address": "Majestic, Bengaluru", "district": "Bengaluru Urban", "firs": ["FIR/104/2026"]},
        {"id": "V2", "name": "Kavitha S.", "group": "victim", "val": 10, "age": 38, "address": "Kuvempunagar, Mysuru", "district": "Mysuru", "firs": ["FIR/215/2025"]},
        {"id": "V3", "name": "Nagesh P.", "group": "victim", "val": 10, "age": 44, "address": "Koramangala, Bengaluru", "district": "Bengaluru Urban", "firs": ["FIR/501/2025"]},
        # Locations
        {"id": "L1", "name": "Majestic Bus Stand", "group": "location", "val": 32, "locationType": "Transit Hub", "crimeCount": 38, "district": "Bengaluru Urban"},
        {"id": "L2", "name": "Lalbagh Road", "group": "location", "val": 18, "locationType": "Public Road", "crimeCount": 14, "district": "Bengaluru Urban"},
        {"id": "L3", "name": "Mysuru City Market", "group": "location", "val": 22, "locationType": "Commercial", "crimeCount": 22, "district": "Mysuru"},
        # Cases
        {"id": "C1", "name": "FIR/104/2026", "group": "case", "val": 14, "firNo": "FIR/104/2026", "ipcSections": ["IPC 379", "IPC 392"], "date": "07 Jan 2026", "status": "Charge Sheet Filed", "district": "Bengaluru Urban"},
        {"id": "C2", "name": "FIR/215/2025", "group": "case", "val": 12, "firNo": "FIR/215/2025", "ipcSections": ["IPC 379"], "date": "22 Sep 2025", "status": "Investigation", "district": "Mysuru"},
        {"id": "C3", "name": "FIR/501/2025", "group": "case", "val": 12, "firNo": "FIR/501/2025", "ipcSections": ["IPC 384", "IPC 506"], "date": "14 Nov 2025", "status": "Under Trial", "district": "Bengaluru Urban"},
        {"id": "C4", "name": "FIR/189/2024", "group": "case", "val": 10, "firNo": "FIR/189/2024", "ipcSections": ["IPC 454", "IPC 380"], "date": "03 Jun 2024", "status": "Charge Sheet Filed", "district": "Mysuru"},
        # Vehicles
        {"id": "VH1", "name": "KA-09-AB-1234", "group": "vehicle", "val": 12, "regNo": "KA-09-AB-1234", "vehicleType": "Motorcycle", "district": "Bengaluru Urban"},
        {"id": "VH2", "name": "KA-55-MC-7890", "group": "vehicle", "val": 10, "regNo": "KA-55-MC-7890", "vehicleType": "Hatchback", "district": "Mysuru"},
        # Organization
        {"id": "O1", "name": "Majestic Gang", "group": "organization", "val": 24, "orgType": "Organized Crime Unit", "members": 7, "district": "Bengaluru Urban", "moTags": ["Chain Snatching", "Pickpocket", "Vehicle Theft"]}
    ]

    links_list = [
        {"source": "S1", "target": "C1", "type": "accused_in", "strength": 3},
        {"source": "S3", "target": "C1", "type": "accused_in", "strength": 3},
        {"source": "V1", "target": "C1", "type": "victim_in", "strength": 2},
        {"source": "L1", "target": "C1", "type": "occurred_at", "strength": 2},
        {"source": "S1", "target": "C2", "type": "accused_in", "strength": 3},
        {"source": "S2", "target": "C2", "type": "accused_in", "strength": 3},
        {"source": "V2", "target": "C2", "type": "victim_in", "strength": 2},
        {"source": "L3", "target": "C2", "type": "occurred_at", "strength": 2},
        {"source": "S3", "target": "C3", "type": "accused_in", "strength": 3},
        {"source": "V3", "target": "C3", "type": "victim_in", "strength": 2},
        {"source": "L2", "target": "C3", "type": "occurred_at", "strength": 2},
        {"source": "S2", "target": "C4", "type": "accused_in", "strength": 3},
        {"source": "S5", "target": "C4", "type": "accused_in", "strength": 3},
        {"source": "V2", "target": "C4", "type": "victim_in", "strength": 2},
        {"source": "L3", "target": "C4", "type": "occurred_at", "strength": 2},
        {"source": "C1", "target": "C2", "type": "linked_case", "label": "Same MO Pattern", "strength": 2},
        {"source": "C2", "target": "C4", "type": "linked_case", "label": "Shared Location", "strength": 1},
        {"source": "S1", "target": "S2", "type": "derived_mo", "label": "Shared MO: Chain Snatching", "strength": 3},
        {"source": "S1", "target": "S3", "type": "associate", "label": "Known Associate", "strength": 3},
        {"source": "S2", "target": "S5", "type": "associate", "label": "Known Associate", "strength": 2},
        {"source": "S3", "target": "O1", "type": "member_of", "label": "Gang Leader", "strength": 3},
        {"source": "S1", "target": "O1", "type": "member_of", "label": "Gang Member", "strength": 2},
        {"source": "S1", "target": "VH1", "type": "uses_vehicle", "label": "Primary Vehicle", "strength": 2},
        {"source": "S3", "target": "VH2", "type": "uses_vehicle", "label": "Getaway Vehicle", "strength": 2},
        {"source": "O1", "target": "VH2", "type": "uses_vehicle", "label": "Gang Vehicle", "strength": 1}
    ]
    
    # Filter nodes
    filtered_nodes = [n for n in nodes if n["group"] in groups]
    filtered_node_ids = {n["id"] for n in filtered_nodes}
    
    # Filter links
    filtered_links = [
        l for l in links_list 
        if l["type"] in links and l["source"] in filtered_node_ids and l["target"] in filtered_node_ids
    ]
    
    return {
        "nodes": filtered_nodes,
        "links": filtered_links
    }

@router.get("/offenders")
def get_offenders(db: Session = Depends(get_db)):
    accused = db.query(Accused).all()
    offenders_list = []
    for a in accused:
        offenders_list.append({
            "id": a.id,
            "name": a.name,
            "age": a.age,
            "dob": a.dob,
            "address": a.address,
            "priorConvictions": a.prior_convictions,
            "riskScore": a.risk_score,
            "moTags": [tag.strip() for tag in a.mo_tags.split(",")] if a.mo_tags else [],
            "jurisdictions": [j.strip() for j in a.jurisdictions.split(",")] if a.jurisdictions else [],
            "district": a.address.split(",")[-1].strip() if a.address else "Unknown"
        })
    # Sort by riskScore descending
    offenders_list.sort(key=lambda x: x["riskScore"], reverse=True)
    return offenders_list

@router.get("/associations")
def get_associations(db: Session = Depends(get_db)):
    assocs = db.query(HiddenAssociation).all()
    return [
        {
            "entityA": a.entity_a,
            "entityB": a.entity_b,
            "method": a.method,
            "confidence": a.confidence,
            "sharedLinks": a.shared_links,
            "flag": a.flag
        }
        for a in assocs
    ]
