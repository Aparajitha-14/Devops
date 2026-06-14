import { NextResponse, NextRequest } from "next/server";
import dbconnect from "@/lib/db/mongodb";
import visitorform from "@/lib/models/VisitorForm";

export async function GET(request: NextRequest) {
  try {
    await dbconnect();

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    console.log("[Visitor API] Query params - start:", start, "end:", end);

    // Helper to format Date to YYYY-MM-DD string
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Use provided dates or defaults (stored as strings in YYYY-MM-DD format)
    const startDate = start || formatDate(new Date("1970-01-01"));
    const endDate = end || formatDate(new Date());

    console.log(
      "[Visitor API] Date range (as strings):",
      startDate,
      "to",
      endDate,
    );

    // Count total documents
    const totalDocs = await visitorform.countDocuments();
    console.log("[Visitor API] Total docs in collection:", totalDocs);

    // Count docs in date range (string comparison)
    const docsInRange = await visitorform.countDocuments({
      date: { $gte: startDate, $lte: endDate },
    });
    console.log("[Visitor API] Docs in date range:", docsInRange);

    // Get time-series data grouped by date
    // Since date is stored as string, group directly by the date field
    const result = await visitorform.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$date", // Group by the string date directly
          visitors: { $sum: "$numberOfVisitors" },
          forms: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          visitors: 1,
          forms: 1,
          _id: 0,
        },
      },
    ]);

    console.log("[Visitor API] Aggregation returned", result.length, "records");
    if (result.length > 0) {
      console.log("[Visitor API] First record:", result[0]);
      console.log("[Visitor API] Last record:", result[result.length - 1]);
    }

    // Calculate totals
    const totals = result.reduce(
      (acc, item) => ({
        totalVisitors: acc.totalVisitors + item.visitors,
        totalForms: acc.totalForms + item.forms,
      }),
      { totalVisitors: 0, totalForms: 0 },
    );

    console.log("[Visitor API] Totals:", totals);

    const response = {
      success: true,
      data: result,
      totalVisitors: totals.totalVisitors,
      totalForms: totals.totalForms,
    };

    console.log(
      "[Visitor API] Sending response with",
      result.length,
      "data points",
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Visitor API] Error:", error);
    console.error("[Visitor API] Error message:", (error as any)?.message);
    console.error("[Visitor API] Error stack:", (error as any)?.stack);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch visitor stats",
        details: (error as any)?.message,
      },
      { status: 500 },
    );
  }
}
