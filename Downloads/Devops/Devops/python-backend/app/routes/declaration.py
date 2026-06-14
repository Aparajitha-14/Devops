from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from typing import List
from app.models import DeclarationForm, DeclarationFormResponse
from app.database import get_collection
from app.services.whatsapp_notif import send_declaration_notification
from datetime import datetime

router = APIRouter(prefix="/api/declarations", tags=["declarations"])

COLLECTION_NAME = "declaration-form-data"


def _get_next_declaration_id():
    """Get the next declaration ID by finding the max ID + 1"""
    collection = get_collection(COLLECTION_NAME)
    try:
        last_record = collection.find_one(sort=[("declarationId", -1)])
        if last_record and "declarationId" in last_record:
            return last_record["declarationId"] + 1
        return 1
    except Exception:
        return 1


@router.post("/", response_model=dict)
async def create_declaration(form: DeclarationForm):
    """Create a new declaration form submission"""
    try:
        collection = get_collection(COLLECTION_NAME)
        
        declaration_id = _get_next_declaration_id()
        
        document = {
            **form.dict(),
            "declarationId": declaration_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        
        result = collection.insert_one(document)
        
        # Send WhatsApp notification
        try:
            send_declaration_notification(
                phone=form.phone,
                country_code=form.countryCode,
                full_name=form.fullName,
                animal_type=form.animalType,
                declaration_id=declaration_id
            )
        except Exception as notify_error:
            # Log error but don't fail the submission
            print(f"WhatsApp notification failed: {str(notify_error)}")
        
        return {
            "success": True,
            "id": str(result.inserted_id),
            "declarationId": declaration_id,
            "message": "Declaration submitted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{declaration_id}", response_model=DeclarationFormResponse)
async def get_declaration(declaration_id: int):
    """Get a declaration form by declaration ID"""
    try:
        collection = get_collection(COLLECTION_NAME)
        document = collection.find_one({"declarationId": declaration_id})
        
        if not document:
            raise HTTPException(status_code=404, detail="Declaration not found")
        
        document["_id"] = str(document["_id"])
        return DeclarationFormResponse(**document)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[DeclarationFormResponse])
async def list_declarations(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100)):
    """List all declarations with pagination"""
    try:
        collection = get_collection(COLLECTION_NAME)
        documents = list(collection.find().skip(skip).limit(limit))
        
        results = []
        for doc in documents:
            doc["_id"] = str(doc["_id"])
            results.append(DeclarationFormResponse(**doc))
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{declaration_id}")
async def delete_declaration(declaration_id: int):
    """Delete a declaration form"""
    try:
        collection = get_collection(COLLECTION_NAME)
        result = collection.delete_one({"declarationId": declaration_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Declaration not found")
        
        return {"success": True, "message": "Declaration deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
