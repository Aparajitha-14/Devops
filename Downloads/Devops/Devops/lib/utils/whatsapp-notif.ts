import axios from "axios";

const WHAPI_URL = "https://gate.whapi.cloud/messages/text";
const WHAPI_TOKEN = process.env.WHAPI_TOKEN;

interface WhatsAppResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendVisitorNotification(
  phone: string,
  countryCode: string,
  fullName: string,
  visitDate: string
): Promise<WhatsAppResponse> {
  try {
    // Remove + from country code and combine with phone
    const fullPhone = countryCode.replace("+", "") + phone;

    const messageBody = `Hello ${fullName}! 👋

Your visit to CARE is confirmed! 🐾

📅 Visit Date: ${visitDate}

We can't wait to show you around and introduce you to our wonderful rescues. Please arrive 15 minutes early.

If you need to reschedule, reply RESCHEDULE.
Reply STOP to opt-out of updates.

Looking forward to seeing you! ❤️`;

    const response = await axios.post(
      WHAPI_URL,
      {
        to: fullPhone,
        body: messageBody,
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${WHAPI_TOKEN}`,
        },
      }
    );

    return {
      success: response.status === 200,
      message: "Visitor notification sent successfully",
    };
  } catch (error) {
    console.error("WhatsApp visitor notification error:", error);
    return {
      success: false,
      error: `Failed to send visitor notification: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function sendDeclarationNotification(
  phone: string,
  countryCode: string,
  fullName: string,
  animalType: string,
  declarationId: number
): Promise<WhatsAppResponse> {
  try {
    // Remove + from country code and combine with phone
    const fullPhone = countryCode.replace("+", "") + phone;

    const messageBody = `Hello ${fullName}! 📋

Your animal declaration has been received and processed. ✅

📌 Reference ID: ${declarationId}
🐾 Animal: ${animalType.toUpperCase()}

Our rescue team is reviewing your submission and will contact you shortly with next steps. Please keep your reference ID for future inquiries.

We're committed to ensuring your ${animalType} receives immediate medical attention and care.

Thank you for trusting CARE! ❤️`;

    const response = await axios.post(
      WHAPI_URL,
      {
        to: fullPhone,
        body: messageBody,
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${WHAPI_TOKEN}`,
        },
      }
    );

    return {
      success: response.status === 200,
      message: "Declaration notification sent successfully",
    };
  } catch (error) {
    console.error("WhatsApp declaration notification error:", error);
    return {
      success: false,
      error: `Failed to send declaration notification: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
