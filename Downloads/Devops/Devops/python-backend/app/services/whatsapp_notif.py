import requests
import os
from dotenv import load_dotenv

load_dotenv()

WHAPI_URL = "https://gate.whapi.cloud/messages/text"
WHAPI_TOKEN = os.getenv("WHAPI_TOKEN")

def send_visitor_notification(phone: str, country_code: str, full_name: str, visit_date: str) -> dict:
    """
    Send WhatsApp notification to a visitor after form submission.
    
    Args:
        phone: Phone number (without country code)
        country_code: Country code (e.g., "+91")
        full_name: Visitor's full name
        visit_date: Date of the scheduled visit
    
    Returns:
        Response from WhatsApp API
    """
    # Combine country code and phone number
    full_phone = country_code.replace("+", "") + phone
    
    message_body = f"""Hello {full_name}! 👋

Your visit to CARE is confirmed! 🐾

📅 Visit Date: {visit_date}

We can't wait to show you around and introduce you to our wonderful rescues. Please arrive 15 minutes early.

If you need to reschedule, reply RESCHEDULE.
Reply STOP to opt-out of updates.

Looking forward to seeing you! ❤️"""
    
    payload = {
        "to": full_phone,
        "body": message_body,
    }
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"Bearer {WHAPI_TOKEN}"
    }
    
    try:
        response = requests.post(WHAPI_URL, json=payload, headers=headers)
        return {"success": response.status_code == 200, "response": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}


def send_declaration_notification(phone: str, country_code: str, full_name: str, animal_type: str, declaration_id: int) -> dict:
    """
    Send WhatsApp notification to user after animal declaration form submission.
    
    Args:
        phone: Phone number (without country code)
        country_code: Country code (e.g., "+91")
        full_name: Owner's full name
        animal_type: Type of animal (dog, cat, etc.)
        declaration_id: Unique declaration reference ID
    
    Returns:
        Response from WhatsApp API
    """
    # Combine country code and phone number
    full_phone = country_code.replace("+", "") + phone
    
    message_body = f"""Hello {full_name}! 📋

Your animal declaration has been received and processed. ✅

📌 Reference ID: {declaration_id}
🐾 Animal: {animal_type.upper()}

Our rescue team is reviewing your submission and will contact you shortly with next steps. Please keep your reference ID for future inquiries.

We're committed to ensuring your {animal_type} receives immediate medical attention and care.

Thank you for trusting CARE! ❤️"""
    
    payload = {
        "to": full_phone,
        "body": message_body,
    }
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"Bearer {WHAPI_TOKEN}"
    }
    
    try:
        response = requests.post(WHAPI_URL, json=payload, headers=headers)
        return {"success": response.status_code == 200, "response": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}