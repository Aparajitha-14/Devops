import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import DeclarationForm from "@/lib/models/DeclarationForm";
import { sendDeclarationNotification } from "@/lib/utils/whatsapp-notif";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    const {
      fullName,
      address,
      countryCode,
      phone,
      email,
      animalType,
      animalAge,
      animalCondition,
      declaration,
      date,
      signature,
      consent,
    } = body;

    if (
      !fullName ||
      !address ||
      !countryCode ||
      !phone ||
      !email ||
      !animalType ||
      !animalAge ||
      !animalCondition ||
      declaration === undefined ||
      !date ||
      !signature
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create new declaration form document
    const declarationForm = new DeclarationForm({
      fullName,
      address,
      countryCode,
      phone,
      email,
      animalType,
      animalAge,
      animalCondition,
      animalNotes: body.animalNotes || "",
      declaration,
      date,
      signature,
      consent: consent !== false,
    });

    // Attempt save with a few retries to handle rare duplicate declarationId races
    let savedDoc = null;
    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      try {
        savedDoc = await declarationForm.save();
        break;
      } catch (err: any) {
        // Detect duplicate key error (E11000) for the declarationId unique index
        const isDuplicateKey =
          err &&
          (err.code === 11000 ||
            (err.message &&
              typeof err.message === "string" &&
              err.message.includes("E11000")));
        if (!isDuplicateKey || attempts >= 3) {
          // Re-throw so outer catch handles it
          throw err;
        }
        // Small delay before retrying so counter increments
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 50));
        // create a fresh instance so pre-save runs again
        // (we reuse the same declarationForm variable; pre-save increments the counter)
      }
    }

    // Send WhatsApp notification (non-blocking)
    if (savedDoc?.declarationId) {
      try {
        await sendDeclarationNotification(
          phone,
          countryCode,
          fullName,
          animalType,
          savedDoc.declarationId
        );
      } catch (notifyError) {
        console.error("Failed to send WhatsApp notification:", notifyError);
        // Don't fail the submission if notification fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Declaration form submitted successfully",
        data: savedDoc,
        declarationId: savedDoc?.declarationId ?? null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting declaration form:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit declaration form" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const forms = await (DeclarationForm as any).find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "Declaration forms retrieved successfully",
        data: forms,
        count: forms.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching declaration forms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch declaration forms" },
      { status: 500 },
    );
  }
}
