from app.core.database import SessionLocal, engine, Base
from app.models.models import Unit, CaseMaster, Accused, Victim, HiddenAssociation, SocioEconomic

def seed_db():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding database...")

        # 1. Seed Units
        units = [
            Unit(id="U1", name="Majestic Police Station", type="Station", parent_unit_id="D1"),
            Unit(id="U2", name="Kuvempunagar Police Station", type="Station", parent_unit_id="D2"),
            Unit(id="U3", name="Koramangala Police Station", type="Station", parent_unit_id="D1"),
            Unit(id="U4", name="Cox Town Police Station", type="Station", parent_unit_id="D1"),
            Unit(id="U5", name="Kadri Police Station", type="Station", parent_unit_id="D3"),
        ]
        db.add_all(units)

        # 2. Seed Cases
        cases = [
            CaseMaster(
                id="C1", case_no="FIR/104/2026", date="07 Jan 2026",
                latitude=12.9774, longitude=77.5729, category="Theft",
                sub_category="Chain Snatching", severity="critical",
                status="Charge Sheet Filed", district="Bengaluru Urban", unit_id="U1"
            ),
            CaseMaster(
                id="C2", case_no="FIR/215/2025", date="22 Sep 2025",
                latitude=12.2958, longitude=76.6385, category="Theft",
                sub_category="Chain Snatching", severity="high",
                status="Investigation", district="Mysuru", unit_id="U2"
            ),
            CaseMaster(
                id="C3", case_no="FIR/501/2025", date="14 Nov 2025",
                latitude=12.9352, longitude=77.6244, category="Fraud",
                sub_category="ATM Fraud", severity="high",
                status="Under Trial", district="Bengaluru Urban", unit_id="U3"
            ),
            CaseMaster(
                id="C4", case_no="FIR/189/2024", date="03 Jun 2024",
                latitude=12.3120, longitude=76.6450, category="Burglary",
                sub_category="House Breaking", severity="medium",
                status="Charge Sheet Filed", district="Mysuru", unit_id="U2"
            ),
            # Spatiotemporal specific cases to populate heatmap/map
            CaseMaster(
                id="C5", case_no="FIR/022/2026", date="10 Jan 2026",
                latitude=12.9800, longitude=77.5800, category="Theft",
                sub_category="Pickpocket", severity="low",
                status="Investigation", district="Bengaluru Urban", unit_id="U1"
            ),
            CaseMaster(
                id="C6", case_no="FIR/110/2026", date="15 Feb 2026",
                latitude=17.3294, longitude=76.8343, category="Narcotics",
                sub_category="Drug Smuggling", severity="critical",
                status="Investigation", district="Kalaburagi", unit_id="U5"
            ),
            CaseMaster(
                id="C7", case_no="FIR/331/2026", date="01 Mar 2026",
                latitude=12.8710, longitude=74.8432, category="Cyber",
                sub_category="Identity Theft", severity="low",
                status="Investigation", district="Mangaluru", unit_id="U5"
            ),
        ]
        db.add_all(cases)

        # 3. Seed Accused
        accused = [
            Accused(
                id="A1", case_id="C1", name="Ravi Kumar B.", age=34, dob="14 Mar 1990",
                address="12, Gandhi Nagar, Bengaluru", prior_convictions=4, risk_score=91,
                mo_tags="Chain Snatching,Vehicle Theft,Pickpocket", jurisdictions="Bengaluru Urban,Mysuru,Mandya"
            ),
            Accused(
                id="A2", case_id="C2", name="Suresh M. Gowda", age=29, dob="08 Jun 1995",
                address="7A, Sudama Layout, Mysuru", prior_convictions=2, risk_score=76,
                mo_tags="Chain Snatching,House Breaking", jurisdictions="Mysuru,Mandya"
            ),
            Accused(
                id="A3", case_id="C3", name="Imran Pasha", age=41, dob="22 Nov 1982",
                address="34, Cox Town, Bengaluru", prior_convictions=6, risk_score=97,
                mo_tags="Extortion,Land Grab,Narcotics", jurisdictions="Bengaluru Urban,Kalaburagi,Hubballi-Dharwad"
            ),
            Accused(
                id="A4", case_id="C4", name="Prakash Shetty", age=26, dob="15 Jan 1998",
                address="22, Kadri Road, Mangaluru", prior_convictions=1, risk_score=55,
                mo_tags="ATM Fraud,Pickpocket", jurisdictions="Mangaluru,Udupi"
            ),
            Accused(
                id="A5", case_id="C4", name="Venkatesha D.", age=37, dob="03 Apr 1987",
                address="9, Devaraj Urs Road, Mysuru", prior_convictions=3, risk_score=83,
                mo_tags="Vehicle Theft,House Breaking", jurisdictions="Mysuru,Bengaluru Urban,Chamarajanagara"
            ),
        ]
        db.add_all(accused)

        # 4. Seed Victims
        victims = [
            Victim(id="V1", case_id="C1", name="Anil B. Rao", age=52, gender="Male", address="Majestic, Bengaluru"),
            Victim(id="V2", case_id="C2", name="Kavitha S.", age=38, gender="Female", address="Kuvempunagar, Mysuru"),
            Victim(id="V3", case_id="C3", name="Nagesh P.", age=44, gender="Male", address="Koramangala, Bengaluru"),
        ]
        db.add_all(victims)

        # 5. Seed Hidden Associations
        associations = [
            HiddenAssociation(entity_a="Ravi Kumar B.", entity_b="Suresh M. Gowda", method="Shared MO (Chain Snatching) + Victim overlap", confidence=94, shared_links=3, flag="high"),
            HiddenAssociation(entity_a="Imran Pasha", entity_b="Majestic Gang", method="Co-accused in FIR/104/2026 + Organization membership", confidence=99, shared_links=4, flag="high"),
            HiddenAssociation(entity_a="Suresh M. Gowda", entity_b="Venkatesha D.", method="Shared location (Mysuru City Market) + Linked FIRs", confidence=81, shared_links=2, flag="high"),
            HiddenAssociation(entity_a="Ravi Kumar B.", entity_b="Venkatesha D.", method="Indirect via FIR/189/2024 — same victim (Kavitha S.)", confidence=68, shared_links=2, flag="medium"),
            HiddenAssociation(entity_a="KA-09-AB-1234", entity_b="Majestic Bus Stand", method="Vehicle sighted at location in 3 independent FIRs", confidence=87, shared_links=3, flag="high"),
        ]
        db.add_all(associations)

        # 6. Seed SocioEconomic Index
        socio_data = [
            SocioEconomic(district="Bengaluru Urban", urbanization=94, poverty_idx=18, crime_rate=312, unemployment=6.2, pop=1300, literacy=88),
            SocioEconomic(district="Bengaluru Rural", urbanization=42, poverty_idx=34, crime_rate=98, unemployment=9.1, pop=110, literacy=72),
            SocioEconomic(district="Mysuru", urbanization=71, poverty_idx=24, crime_rate=194, unemployment=7.8, pop=400, literacy=80),
            SocioEconomic(district="Hubballi-Dharwad", urbanization=62, poverty_idx=30, crime_rate=152, unemployment=8.5, pop=290, literacy=75),
            SocioEconomic(district="Kalaburagi", urbanization=38, poverty_idx=52, crime_rate=134, unemployment=14.2, pop=210, literacy=58),
            SocioEconomic(district="Belagavi", urbanization=55, poverty_idx=38, crime_rate=118, unemployment=10.1, pop=245, literacy=68),
            SocioEconomic(district="Mangaluru", urbanization=74, poverty_idx=20, crime_rate=88, unemployment=5.8, pop=220, literacy=86),
            SocioEconomic(district="Shivamogga", urbanization=58, poverty_idx=28, crime_rate=82, unemployment=7.2, pop=180, literacy=78),
            SocioEconomic(district="Raichur", urbanization=32, poverty_idx=61, crime_rate=148, unemployment=16.4, pop=190, literacy=48),
            SocioEconomic(district="Vijayapura", urbanization=44, poverty_idx=45, crime_rate=126, unemployment=12.8, pop=200, literacy=61),
        ]
        db.add_all(socio_data)

        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
