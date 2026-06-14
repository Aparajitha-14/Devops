from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Department(Base):
    __tablename__ = "department"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dept_name = Column(String, nullable=False)
    dept_lead = Column(String, nullable=False)
    notes = Column(Text, nullable=True)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    categories_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    min_stock = Column(Integer, nullable=False)
    monthly_usage = Column(Integer, nullable=False)
    unit = Column(String, nullable=False)
    date_of_creation = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    category = relationship("Category", backref="inventory_items")
    allocated_departments = relationship("DepartmentAllocated", back_populates="inventory", cascade="all, delete-orphan")

class DepartmentAllocated(Base):
    __tablename__ = "departments_allocated"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("department.id"), nullable=False)

    # Relationships
    inventory = relationship("Inventory", back_populates="allocated_departments")
    department = relationship("Department")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    phone_no = Column(String, nullable=False) # string for phone to handle formats
    date_of_donation = Column(Date, nullable=False)

    # Relationships
    items = relationship("DonatedItem", back_populates="donation", cascade="all, delete-orphan")

class DonatedItem(Base):
    __tablename__ = "donated_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    donation_id = Column(Integer, ForeignKey("donations.id"), nullable=False)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    # Relationships
    donation = relationship("Donation", back_populates="items")
    inventory = relationship("Inventory")

