from fastapi import FastAPI, Depends, HTTPException, status, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import models
import database
import schemas
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# Secret key for JWT
SECRET_KEY = "super_secret_key_for_development"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Setup CORS to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.on_event("startup")
def startup_event():
    # Insert a default admin user if one doesn't exist
    db = database.SessionLocal()
    admin = db.query(models.AdminUser).filter(models.AdminUser.username == "admin").first()
    if not admin:
        hashed_pwd = get_password_hash("admin")
        new_admin = models.AdminUser(username="admin", hashed_password=hashed_pwd)
        db.add(new_admin)
        db.commit()
    db.close()

@app.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.AdminUser).filter(models.AdminUser.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/verify")
def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"status": "ok", "user": username}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def get_current_user(authorization: str = Header(None), db: Session = Depends(database.get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = db.query(models.AdminUser).filter(models.AdminUser.username == username).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# --- Categories ---
@app.get("/api/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(database.get_db)):
    return db.query(models.Category).all()

@app.post("/api/categories", response_model=schemas.CategoryResponse)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.put("/api/categories/{category_id}", response_model=schemas.CategoryResponse)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db_category.name = category.name
    db_category.description = category.description
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"ok": True}

# --- Departments ---
@app.get("/api/departments", response_model=List[schemas.DepartmentResponse])
def get_departments(db: Session = Depends(database.get_db)):
    return db.query(models.Department).all()

@app.post("/api/departments", response_model=schemas.DepartmentResponse)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_department = models.Department(**department.dict())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

@app.put("/api/departments/{department_id}", response_model=schemas.DepartmentResponse)
def update_department(department_id: int, department: schemas.DepartmentCreate, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    for key, value in department.dict().items():
        setattr(db_department, key, value)
    db.commit()
    db.refresh(db_department)
    return db_department

@app.delete("/api/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(db_department)
    db.commit()
    return {"ok": True}

# --- Inventory ---
@app.get("/api/inventory", response_model=List[schemas.InventoryResponse])
def get_inventory(db: Session = Depends(database.get_db)):
    return db.query(models.Inventory).all()

@app.post("/api/inventory", response_model=schemas.InventoryResponse)
def create_inventory(inventory: schemas.InventoryCreate, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_inventory = models.Inventory(
        name=inventory.name,
        categories_id=inventory.categories_id,
        quantity=inventory.quantity,
        min_stock=inventory.min_stock,
        monthly_usage=inventory.monthly_usage,
        unit=inventory.unit
    )
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    
    for dept_id in inventory.department_ids:
        db_alloc = models.DepartmentAllocated(inventory_id=db_inventory.id, department_id=dept_id)
        db.add(db_alloc)
    
    if inventory.department_ids:
        db.commit()
        db.refresh(db_inventory)
        
    return db_inventory

@app.put("/api/inventory/{inventory_id}", response_model=schemas.InventoryResponse)
def update_inventory(inventory_id: int, inventory: schemas.InventoryCreate, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_inventory = db.query(models.Inventory).filter(models.Inventory.id == inventory_id).first()
    if not db_inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
        
    db_inventory.name = inventory.name
    db_inventory.categories_id = inventory.categories_id
    db_inventory.quantity = inventory.quantity
    db_inventory.min_stock = inventory.min_stock
    db_inventory.monthly_usage = inventory.monthly_usage
    db_inventory.unit = inventory.unit
    
    # Update departments allocated
    db.query(models.DepartmentAllocated).filter(models.DepartmentAllocated.inventory_id == inventory_id).delete()
    for dept_id in inventory.department_ids:
        db_alloc = models.DepartmentAllocated(inventory_id=db_inventory.id, department_id=dept_id)
        db.add(db_alloc)
        
    db.commit()
    db.refresh(db_inventory)
    return db_inventory

@app.delete("/api/inventory/{inventory_id}")
def delete_inventory(inventory_id: int, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_inventory = db.query(models.Inventory).filter(models.Inventory.id == inventory_id).first()
    if not db_inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    db.delete(db_inventory)
    db.commit()
    return {"ok": True}

# --- Donations ---
@app.get("/api/donations", response_model=List[schemas.DonationResponse])
def get_donations(db: Session = Depends(database.get_db)):
    # Sort by newest first
    return db.query(models.Donation).order_by(models.Donation.date_of_donation.desc(), models.Donation.id.desc()).all()

@app.post("/api/donations", response_model=schemas.DonationResponse)
def create_donation(donation: schemas.DonationCreate, db: Session = Depends(database.get_db), current_user: models.AdminUser = Depends(get_current_user)):
    db_donation = models.Donation(
        name=donation.name,
        phone_no=donation.phone_no,
        date_of_donation=donation.date_of_donation
    )
    db.add(db_donation)
    db.commit()
    db.refresh(db_donation)
    
    for item in donation.items:
        db_item = models.DonatedItem(
            donation_id=db_donation.id,
            inventory_id=item.inventory_id,
            quantity=item.quantity
        )
        db.add(db_item)
        
        # Update inventory quantity
        inv = db.query(models.Inventory).filter(models.Inventory.id == item.inventory_id).first()
        if inv:
            inv.quantity += item.quantity
            
    if donation.items:
        db.commit()
        db.refresh(db_donation)
        
    return db_donation
