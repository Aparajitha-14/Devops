from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from typing import List
from app.models import VisitorForm, VisitorFormResponse
from app.database import get_collection
from app.services.whatsapp_notif import send_visitor_notification
from datetime import datetime

router = APIRouter(prefix="/api/visitors", tags=["visitors"])

COLLECTION_NAME = "visitor-form-data"


@router.post("/", response_model=dict)
async def create_visitor(form: VisitorForm):
    """Create a new visitor form submission"""
    try:
        collection = get_collection(COLLECTION_NAME)
        
        document = {
            **form.dict(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        
        result = collection.insert_one(document)
        
        # Send WhatsApp notification
        try:
            send_visitor_notification(
                phone=form.phone,
                country_code=form.countryCode,
                full_name=form.fullName,
                visit_date=form.date
            )
        except Exception as notify_error:
            # Log error but don't fail the submission
            print(f"WhatsApp notification failed: {str(notify_error)}")
        
        return {
            "success": True,
            "id": str(result.inserted_id),
            "message": "Visitor form submitted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{visitor_id}", response_model=VisitorFormResponse)
async def get_visitor(visitor_id: str):
    """Get a visitor form by ID"""
    try:
        if not ObjectId.is_valid(visitor_id):
            raise HTTPException(status_code=400, detail="Invalid visitor ID format")
        
        collection = get_collection(COLLECTION_NAME)
        document = collection.find_one({"_id": ObjectId(visitor_id)})
        
        if not document:
            raise HTTPException(status_code=404, detail="Visitor form not found")
        
        document["_id"] = str(document["_id"])
        return VisitorFormResponse(**document)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[VisitorFormResponse])
async def list_visitors(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100)):
    """List all visitor forms with pagination"""
    try:
        collection = get_collection(COLLECTION_NAME)
        documents = list(collection.find().skip(skip).limit(limit))
        
        results = []
        for doc in documents:
            doc["_id"] = str(doc["_id"])
            results.append(VisitorFormResponse(**doc))
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{visitor_id}")
async def delete_visitor(visitor_id: str):
    """Delete a visitor form"""
    try:
        if not ObjectId.is_valid(visitor_id):
            raise HTTPException(status_code=400, detail="Invalid visitor ID format")
        
        collection = get_collection(COLLECTION_NAME)
        result = collection.delete_one({"_id": ObjectId(visitor_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Visitor form not found")
        
        return {"success": True, "message": "Visitor form deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
