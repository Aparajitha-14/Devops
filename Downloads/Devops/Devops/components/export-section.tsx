"use client";

import { useState } from "react";
import { downloadCSV } from "@/lib/utils/csv-export";
import { Calendar as CalendarIcon, Download, Eye, FileSpreadsheet, Loader2, FileDown, Archive } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type ExportType = "visitors" | "declarations";

interface ExportSectionProps {
  onPreviewChange?: (data: Record<string, any>[]) => void;
}

export default function ExportSection({ onPreviewChange }: ExportSectionProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [actionLabel, setActionLabel] = useState<string>("");
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [error, setError] = useState<string | null>(null);

  const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
  const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

  function validateRange(): string | null {
    if (!start || !end) return "Please pick both a Start date and End date.";
    if (start > end) return "Start date cannot be after End date.";
    return null;
  }

  async function fetchExportData(type: ExportType, actionDesc: string) {
    setError(null);
    const validation = validateRange();
    if (validation) {
      setError(validation);
      return null;
    }

    setLoading(true);
    setActionLabel(actionDesc);
    try {
      const url =
        type === "visitors"
          ? `/api/export/visitor?start=${start}&end=${end}`
          : `/api/export/declaration?start=${start}&end=${end}`;

      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server returned ${res.status}: ${txt}`);
      }

      const json = await res.json();
      if (!json?.success) {
        throw new Error(json?.error || "Failed to fetch export data");
      }

      return json.data as Record<string, any>[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
      setActionLabel("");
    }
  }

  async function handlePreview(type: ExportType) {
    const data = await fetchExportData(type, `Previewing ${type}...`);
    if (!data) {
      setPreviewData([]);
      onPreviewChange?.([]);
      return;
    }

    const preview = data.slice(0, 25);
    setPreviewData(preview);
    onPreviewChange?.(preview);
  }

  async function handleExport(type: ExportType) {
    const data = await fetchExportData(type, `Exporting ${type}...`);
    if (!data) return;

    const filenameBase = type === "visitors" ? "visitors" : "declarations";
    const filename = `${filenameBase}_${start}_${end}.csv`;

    try {
      downloadCSV(data, filename);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to download CSV";
      setError(msg);
    }
  }

  async function handleSignatureExport() {
    setError(null);
    const validation = validateRange();
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setActionLabel("Exporting signatures...");

    try {
      const res = await fetch(`/api/export/signatures?start=${start}&end=${end}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server returned ${res.status}: ${txt}`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename=\"?([^"]+)\"?/i);
      const filename = filenameMatch?.[1] || `signatures_${start}_${end}.zip`;

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to export signatures";
      setError(msg);
    } finally {
      setLoading(false);
      setActionLabel("");
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-border/40 shadow-xl shadow-black/[0.02] flex flex-col h-full relative overflow-hidden group">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -mr-10 -mt-10 pointer-events-none"></div>

      <div className="flex items-center gap-4 mb-2 relative z-10">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <FileSpreadsheet size={24} />
        </div>
        <h3 className="text-3xl font-black text-[#1E314D] tracking-tight">
          Export Data
        </h3>
      </div>
      
      <p className="text-muted-foreground font-medium mb-8 relative z-10">
        Generate custom CSV reports directly from the database schema.
      </p>

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <label className="flex flex-col gap-2 group/input">
          <span className="text-sm font-bold text-[#1E314D] ml-1 flex items-center gap-2">
             Start Date
          </span>
          <div className="relative">
             <Popover>
               <PopoverTrigger asChild>
                 <button className={`w-full flex items-center justify-between bg-[#F8FAFC] px-5 py-3.5 rounded-2xl border-2 border-border/60 hover:border-border transition-all font-medium text-foreground outline-none shadow-sm cursor-pointer ${!startDate && "text-muted-foreground"}`}>
                   {startDate ? format(startDate, "PPP") : "Pick a date"}
                   <CalendarIcon size={18} className="text-muted-foreground" />
                 </button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                 <Calendar
                   mode="single"
                   captionLayout="dropdown"
                   fromYear={2020}
                   toYear={2050}
                   selected={startDate}
                   onSelect={setStartDate}
                   initialFocus
                 />
               </PopoverContent>
             </Popover>
          </div>
        </label>

        <label className="flex flex-col gap-2 group/input">
          <span className="text-sm font-bold text-[#1E314D] ml-1 flex items-center gap-2">
             End Date
          </span>
          <div className="relative">
             <Popover>
               <PopoverTrigger asChild>
                 <button className={`w-full flex items-center justify-between bg-[#F8FAFC] px-5 py-3.5 rounded-2xl border-2 border-border/60 hover:border-border transition-all font-medium text-foreground outline-none shadow-sm cursor-pointer ${!endDate && "text-muted-foreground"}`}>
                   {endDate ? format(endDate, "PPP") : "Pick a date"}
                   <CalendarIcon size={18} className="text-muted-foreground" />
                 </button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                 <Calendar
                   mode="single"
                   captionLayout="dropdown"
                   fromYear={2020}
                   toYear={2050}
                   selected={endDate}
                   onSelect={setEndDate}
                   initialFocus
                 />
               </PopoverContent>
             </Popover>
          </div>
        </label>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/20 text-destructive font-semibold rounded-2xl animate-in zoom-in-95 duration-200">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto flex flex-col gap-6 relative z-10">
        
        {/* Visitors */}
        <div className="bg-[#F8FAFC] border border-border/50 p-5 rounded-[2rem] flex flex-col gap-3">
          <p className="text-sm font-bold text-[#1E314D] mb-1 px-2">Visitor Logs</p>
          <button
            onClick={() => handlePreview("visitors")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-border/60 hover:border-border hover:bg-gray-50 text-[#1E314D] py-4 rounded-2xl font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {loading && actionLabel.includes('visitors') ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
            Preview Visitors
          </button>
          <button
            onClick={() => handleExport("visitors")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#1E314D] hover:bg-[#1E314D]/90 text-white py-4 rounded-2xl font-bold shadow-md transition-all disabled:opacity-50"
          >
            {loading && actionLabel.includes('visitors') ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
            Export Visitors
          </button>
        </div>

        {/* Declarations */}
        <div className="bg-primary/5 border border-primary/20 p-5 rounded-[2rem] flex flex-col gap-3">
          <p className="text-sm font-bold text-[#1E314D] mb-1 px-2">Legal Declarations</p>
          <button
            onClick={() => handlePreview("declarations")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-primary/20 hover:border-primary/40 text-primary py-4 rounded-2xl font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {loading && actionLabel.includes('declarations') ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
            Preview Docs
          </button>
          <button
            onClick={() => handleExport("declarations")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-bold shadow-[0_4px_10px_rgba(251,203,4,0.3)] transition-all disabled:opacity-50"
          >
            {loading && actionLabel.includes('declarations') ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Export Docs
          </button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-[2rem] flex flex-col gap-3">
          <p className="text-sm font-bold text-[#1E314D] mb-1 px-2">Signature Archive</p>
          <p className="text-xs text-muted-foreground px-2">
            Downloads a ZIP with reconstructed signature images and a CSV manifest for the selected submission range.
          </p>
          <button
            onClick={handleSignatureExport}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-md transition-all disabled:opacity-50"
          >
            {loading && actionLabel.includes("signatures") ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
            Export Signatures ZIP
          </button>
        </div>
      </div>
    </div>
  );
}
