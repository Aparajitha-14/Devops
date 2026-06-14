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
      "[Animals API] Received request - start:",
      start,
      "end:",
      end
    );

    const startDate = start ? new Date(start) : new Date("1970-01-01");
    const endDate = end ? new Date(end) : new Date();

    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);

    console.log("[Animals API] Parsed dates - start:", startDate, "end:", endDate);

    // Get time-series data grouped by date
    const result = await DeclarationForm.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          animals: "$count",
          _id: 0,
        },
      },
    ]);

    console.log("[Animals API] Aggregation result:", result);

    // Calculate total
    const totalAnimals = result.reduce((acc, item) => acc + item.animals, 0);

    console.log("[Animals API] Total animals:", totalAnimals);

    return NextResponse.json(
      {
        success: true,
        data: result,
        totalAnimals,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Animals API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
