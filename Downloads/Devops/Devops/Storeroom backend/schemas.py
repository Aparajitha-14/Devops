from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

# --- Admin User ---
class AdminUserBase(BaseModel):
    username: str

class AdminUserCreate(AdminUserBase):
    password: str

class AdminUserResponse(AdminUserBase):
    id: int

    class Config:
        from_attributes = True

# --- Category ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# --- Department ---
class DepartmentBase(BaseModel):
    dept_name: str
    dept_lead: str
    notes: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int

    class Config:
        from_attributes = True

# --- Department Allocated ---
class DepartmentAllocatedBase(BaseModel):
    department_id: int

class DepartmentAllocatedResponse(DepartmentAllocatedBase):
    id: int
    inventory_id: int

    class Config:
        from_attributes = True

# --- Inventory ---
class InventoryBase(BaseModel):
    name: str
    categories_id: int
    quantity: int
    min_stock: int
    monthly_usage: int
    unit: str

class InventoryCreate(InventoryBase):
    department_ids: List[int] = []

class InventoryResponse(InventoryBase):
    id: int
    date_of_creation: datetime
    allocated_departments: List[DepartmentAllocatedResponse] = []

    class Config:
        from_attributes = True

# --- Donated Item ---
class DonatedItemBase(BaseModel):
    inventory_id: int
    quantity: int

class DonatedItemCreate(DonatedItemBase):
    pass

class DonatedItemResponse(DonatedItemBase):
    id: int
    donation_id: int

    class Config:
        from_attributes = True

# --- Donation ---
class DonationBase(BaseModel):
    name: str
    phone_no: str
    date_of_donation: date

class DonationCreate(DonationBase):
    items: List[DonatedItemCreate]

class DonationResponse(DonationBase):
    id: int
    items: List[DonatedItemResponse] = []

    class Config:
        from_attributes = True
