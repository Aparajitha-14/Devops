import { NextResponse, NextRequest } from "next/server";
import dbconnect from "@/lib/db/mongodb";
import VisitorForm from "@/lib/models/VisitorForm";

export async function GET(request: NextRequest) {
  try {
    await dbconnect();

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    console.log("[Export Visitor] Query params - start:", start, "end:", end);

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    // Convert to string format (YYYY-MM-DD) for comparison
    const startStr = start;
    const endStr = end;

    console.log(
      "[Export Visitor] Date range (strings):",
      startStr,
      "to",
      endStr
    );

    // Query documents in the date range
    const documents = await (VisitorForm as any).find({
      date: { $gte: startStr, $lte: endStr },
    }).lean();

    console.log("[Export Visitor] Found", documents.length, "documents");

    // Transform documents to export format with clean column names
    const exportData = documents.map((doc: any) => ({
      "Full Name": doc.fullName,
      "Number of Visitors": doc.numberOfVisitors,
      Address: doc.address,
      "Country Code": doc.countryCode || "",
      Phone: doc.phone,
      "WhatsApp Number": `${doc.countryCode || ""}${doc.phone || ""}`,
      Email: doc.email,
      "How Heard About": doc.howHeardAbout,
      Date: doc.date,
      Guide: doc.guide || "",
      Consent: doc.consent ? "Yes" : "No",
      "Created At": new Date(doc.createdAt).toLocaleString(),
      "Updated At": new Date(doc.updatedAt).toLocaleString(),
    }));

    console.log("[Export Visitor] Transformed to export format");

    return NextResponse.json({
      success: true,
      data: exportData,
      count: exportData.length,
    });
  } catch (error) {
    console.error("[Export Visitor] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export visitor data",
        details: (error as any)?.message,
      },
      { status: 500 }
    );
  }
}
