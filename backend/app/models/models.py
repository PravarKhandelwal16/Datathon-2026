from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from ..core.database import Base

class Unit(Base):
    __tablename__ = "units"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50)) # e.g. "Station", "Circle", "SP Office"
    parent_unit_id = Column(String(50), nullable=True)

class CaseMaster(Base):
    __tablename__ = "case_master"
    id = Column(String(50), primary_key=True)
    case_no = Column(String(100), unique=True, nullable=False)
    date = Column(String(50), nullable=False) # Store formatted string for demo consistency
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    category = Column(String(100), nullable=False) # e.g. "Theft", "Assault"
    sub_category = Column(String(100))
    severity = Column(String(50)) # "critical", "high", "medium", "low"
    status = Column(String(100)) # "Charge Sheet Filed", "Investigation", etc.
    district = Column(String(100), nullable=False)
    unit_id = Column(String(50), ForeignKey("units.id"), nullable=True)
    
    # Relationships
    accused_list = relationship("Accused", back_populates="case", cascade="all, delete-orphan")
    victims = relationship("Victim", back_populates="case", cascade="all, delete-orphan")

class Accused(Base):
    __tablename__ = "accused"
    id = Column(String(50), primary_key=True)
    case_id = Column(String(50), ForeignKey("case_master.id"), nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    dob = Column(String(50), nullable=True)
    address = Column(String(200), nullable=True)
    prior_convictions = Column(Integer, default=0)
    risk_score = Column(Integer, default=50)
    mo_tags = Column(Text, nullable=True) # Comma-separated list e.g. "Chain Snatching,Vehicle Theft"
    jurisdictions = Column(Text, nullable=True) # Comma-separated list e.g. "Mysuru,Mandya"

    case = relationship("CaseMaster", back_populates="accused_list")

class Victim(Base):
    __tablename__ = "victims"
    id = Column(String(50), primary_key=True)
    case_id = Column(String(50), ForeignKey("case_master.id"), nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    address = Column(String(200), nullable=True)

    case = relationship("CaseMaster", back_populates="victims")

class HiddenAssociation(Base):
    __tablename__ = "hidden_associations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_a = Column(String(100), nullable=False)
    entity_b = Column(String(100), nullable=False)
    method = Column(String(200), nullable=False)
    confidence = Column(Integer, nullable=False)
    shared_links = Column(Integer, default=1)
    flag = Column(String(20), default="medium") # "high", "medium", "low"

class SocioEconomic(Base):
    __tablename__ = "socio_economic"
    id = Column(Integer, primary_key=True, autoincrement=True)
    district = Column(String(100), unique=True, nullable=False)
    urbanization = Column(Float)
    poverty_idx = Column(Float)
    crime_rate = Column(Float)
    unemployment = Column(Float)
    pop = Column(Float) # Population in thousands
    literacy = Column(Float)
