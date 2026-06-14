import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import VisitorForm from "@/lib/models/VisitorForm";
import DeclarationForm from "@/lib/models/DeclarationForm";
import {
  decodeSignatureBlob,
  sanitizeFileSegment,
} from "@/lib/utils/signature-export";
import { toCSV } from "@/lib/utils/server-csv";
import { createZipArchive } from "@/lib/utils/zip";

type SignatureExportRow = {
  "Form Type": string;
  "Record ID": string;
  "Full Name": string;
  "Country Code": string;
  Phone: string;
  "WhatsApp Number": string;
  Email: string;
  "Form Date": string;
  "Submitted At": string;
  "Image File": string;
};

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: "Start and end dates are required" },
        { status: 400 },
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date range" },
        { status: 400 },
      );
    }

    const [visitors, declarations] = await Promise.all([
      (VisitorForm as any).find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .sort({ createdAt: 1 })
        .lean(),
      (DeclarationForm as any).find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const csvRows: SignatureExportRow[] = [];
    const zipFiles: { name: string; content: Buffer }[] = [];

    for (const visitor of visitors) {
      const decodedSignature = decodeSignatureBlob(visitor.signature);
      if (!decodedSignature) {
        continue;
      }

      const fileName = `signatures/visitor_${String(visitor._id)}_${sanitizeFileSegment(visitor.fullName)}.${decodedSignature.extension}`;
      zipFiles.push({
        name: fileName,
        content: decodedSignature.buffer,
      });

      csvRows.push({
        "Form Type": "visitor",
        "Record ID": String(visitor._id),
        "Full Name": visitor.fullName || "",
        "Country Code": visitor.countryCode || "",
        Phone: visitor.phone || "",
        "WhatsApp Number": `${visitor.countryCode || ""}${visitor.phone || ""}`,
        Email: visitor.email || "",
        "Form Date": visitor.date || "",
        "Submitted At": visitor.createdAt
          ? new Date(visitor.createdAt).toISOString()
          : "",
        "Image File": fileName,
      });
    }

    for (const declaration of declarations) {
      const decodedSignature = decodeSignatureBlob(declaration.signature);
      if (!decodedSignature) {
        continue;
      }

      const recordId =
        declaration.declarationId !== undefined
          ? String(declaration.declarationId)
          : String(declaration._id);
      const fileName = `signatures/declaration_${recordId}_${sanitizeFileSegment(declaration.fullName)}.${decodedSignature.extension}`;
      zipFiles.push({
        name: fileName,
        content: decodedSignature.buffer,
      });

      csvRows.push({
        "Form Type": "declaration",
        "Record ID": recordId,
        "Full Name": declaration.fullName || "",
        "Country Code": declaration.countryCode || "",
        Phone: declaration.phone || "",
        "WhatsApp Number": `${declaration.countryCode || ""}${declaration.phone || ""}`,
        Email: declaration.email || "",
        "Form Date": declaration.date || "",
        "Submitted At": declaration.createdAt
          ? new Date(declaration.createdAt).toISOString()
          : "",
        "Image File": fileName,
      });
    }

    const csvContent = toCSV(csvRows);
    zipFiles.unshift({
      name: "signatures.csv",
      content: Buffer.from(csvContent, "utf8"),
    });

    const zipBuffer = createZipArchive(zipFiles);
    const archiveName = `signatures_${start}_${end}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${archiveName}"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error("[Export Signatures] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export signatures",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
