from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class DeclarationForm(BaseModel):
    fullName: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    email: EmailStr
    animalType: str = Field(..., pattern="^(dog|cat|rabbit|bird|hamster|guinea-pig|other)$")
    animalAge: str = Field(..., min_length=1)
    animalCondition: str = Field(..., min_length=1)
    animalNotes: Optional[str] = None
    declaration: bool = Field(..., description="Must agree to declaration")
    date: str = Field(..., min_length=1)
    signature: str = Field(..., min_length=1)
    consent: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "fullName": "John Doe",
                "address": "123 Main St",
                "phone": "+1234567890",
                "email": "john@example.com",
                "animalType": "dog",
                "animalAge": "2 years",
                "animalCondition": "Healthy",
                "animalNotes": "Very friendly",
                "declaration": True,
                "date": "2026-04-23",
                "signature": "data:image/png;base64,...",
                "consent": True
            }
        }


class DeclarationFormResponse(DeclarationForm):
    id: Optional[str] = Field(None, alias="_id")
    declarationId: int
    createdAt: datetime
    updatedAt: datetime


class VisitorForm(BaseModel):
    fullName: str = Field(..., min_length=1)
    numberOfVisitors: int = Field(..., ge=1)
    address: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    email: EmailStr
    howHeardAbout: str = Field(..., pattern="^(social-media|word-of-mouth|website|advertisement|friend|other)$")
    date: str = Field(..., min_length=1)
    guide: Optional[str] = None
    signature: str = Field(..., min_length=1)
    consent: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "fullName": "Jane Smith",
                "numberOfVisitors": 3,
                "address": "456 Oak Ave",
                "phone": "+1987654321",
                "email": "jane@example.com",
                "howHeardAbout": "word-of-mouth",
                "date": "2026-04-23",
                "guide": "Optional guide name",
                "signature": "data:image/png;base64,...",
                "consent": True
            }
        }


class VisitorFormResponse(VisitorForm):
    id: Optional[str] = Field(None, alias="_id")
    createdAt: datetime
    updatedAt: datetime
