import { NextResponse, NextRequest } from "next/server";
import dbconnect from "@/lib/db/mongodb";
import DeclarationForm from "@/lib/models/DeclarationForm";

export async function GET(request: NextRequest) {
  try {
    await dbconnect();

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    console.log(
      "[Export Declaration] Query params - start:",
      start,
      "end:",
      end
    );

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects for comparison
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    console.log(
      "[Export Declaration] Date range:",
      startDate.toISOString(),
      "to",
      endDate.toISOString()
    );

    // Query documents in the date range
    const documents = await (DeclarationForm as any).find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    console.log("[Export Declaration] Found", documents.length, "documents");

    // Transform documents to export format with clean column names
    const exportData = documents.map((doc: any) => ({
      "Declaration ID": doc.declarationId,
      "Full Name": doc.fullName,
      Address: doc.address,
      "Country Code": doc.countryCode || "",
      Phone: doc.phone,
      "WhatsApp Number": `${doc.countryCode || ""}${doc.phone || ""}`,
      Email: doc.email,
      "Animal Type": doc.animalType,
      "Animal Age": doc.animalAge,
      "Animal Condition": doc.animalCondition,
      "Animal Notes": doc.animalNotes || "",
      Declaration: doc.declaration ? "Yes" : "No",
      Date: doc.date,
      Consent: doc.consent ? "Yes" : "No",
      "Created At": new Date(doc.createdAt).toLocaleString(),
      "Updated At": new Date(doc.updatedAt).toLocaleString(),
    }));

    console.log("[Export Declaration] Transformed to export format");

    return NextResponse.json({
      success: true,
      data: exportData,
      count: exportData.length,
    });
  } catch (error) {
    console.error("[Export Declaration] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export declaration data",
        details: (error as any)?.message,
      },
      { status: 500 }
    );
  }
}
