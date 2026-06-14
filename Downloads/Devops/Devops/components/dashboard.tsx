"use client";

import { useState, useEffect } from "react";
import VisitorChart from "./visitor-chart";
import AnimalsChart from "./animals-chart";
import HealthCard from "./health-card";
import ExportSection from "./export-section";
import PreviewTable from "./preview-table";

type Period = "week" | "month" | "year";

interface VisitorChartData {
  date: string;
  visitors: number;
  forms: number;
}

interface AnimalChartData {
  date: string;
  animals: number;
}

function getDateRange(period: Period): { start: string; end: string } {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === "week") {
    const dayOfWeek = today.getDay();
    const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate = new Date(today);
    startDate.setDate(today.getDate() - daysBack);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else if (period === "month") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  } else {
    startDate = new Date(today.getFullYear(), 0, 1);
    endDate = new Date(today.getFullYear(), 11, 31);
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const result = { start: formatDate(startDate), end: formatDate(endDate) };
  console.log(`[Dashboard] ${period} range:`, result);
  return result;
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("week");

  // Visitor chart state
  const [visitorData, setVisitorData] = useState<VisitorChartData[]>([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalForms, setTotalForms] = useState(0);

  // Animals chart state
  const [animalData, setAnimalData] = useState<AnimalChartData[]>([]);
  const [totalAnimals, setTotalAnimals] = useState(0);

  // Preview data for export preview table
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("[Dashboard] Fetching data for period:", period);
      setLoading(true);
      setError(null);

      try {
        const { start, end } = getDateRange(period);
        console.log(`[Dashboard] Date range: ${start} to ${end}`);

        // Fetch visitor data
        console.log("[Dashboard] Fetching visitor data...");
        const visitorRes = await fetch(
          `/api/forms/dashboard/visitor?start=${start}&end=${end}`,
        );
        console.log("[Dashboard] Visitor response status:", visitorRes.status);

        if (!visitorRes.ok) {
          throw new Error(`Visitor API returned ${visitorRes.status}`);
        }

        const visitorJson = await visitorRes.json();
        console.log("[Dashboard] Visitor response:", visitorJson);

        if (visitorJson.success) {
          setVisitorData(visitorJson.data || []);
          setTotalVisitors(visitorJson.totalVisitors || 0);
          setTotalForms(visitorJson.totalForms || 0);
          console.log("[Dashboard] Visitor data updated");
        } else {
          console.error("[Dashboard] Visitor API error:", visitorJson.error);
          setError(visitorJson.error || "Failed to fetch visitor data");
        }

        // Fetch animals data
        console.log("[Dashboard] Fetching animals data...");
        const animalsRes = await fetch(
          `/api/forms/dashboard/animals?start=${start}&end=${end}`,
        );
        console.log("[Dashboard] Animals response status:", animalsRes.status);

        if (!animalsRes.ok) {
          throw new Error(`Animals API returned ${animalsRes.status}`);
        }

        const animalsJson = await animalsRes.json();
        console.log("[Dashboard] Animals response:", animalsJson);

        if (animalsJson.success) {
          setAnimalData(animalsJson.data || []);
          setTotalAnimals(animalsJson.totalAnimals || 0);
          console.log("[Dashboard] Animals data updated");
        } else {
          console.error("[Dashboard] Animals API error:", animalsJson.error);
          setError(animalsJson.error || "Failed to fetch animals data");
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("[Dashboard] Error:", errorMsg);
        setError(errorMsg);
        setVisitorData([]);
        setTotalVisitors(0);
        setTotalForms(0);
        setAnimalData([]);
        setTotalAnimals(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // Handler passed to ExportSection to receive preview data
  const handlePreviewChange = (data: Record<string, any>[]) => {
    console.log("[Dashboard] Received preview data:", data?.length ?? 0);
    setPreviewData(data || []);
  };

  return (
    <div className="w-full h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
           <h2 className="text-4xl lg:text-5xl font-black text-[#1E314D] mb-3 tracking-tight drop-shadow-sm">
             Dashboard
           </h2>
           <p className="text-lg text-muted-foreground font-medium max-w-xl">
             Live telemetry of facility operations, visitor influx, and sanctuary population metrics.
           </p>
        </div>

        {/* PERIOD TOGGLE */}
        <div className="bg-white border-2 border-border/40 p-1.5 rounded-full flex shadow-sm">
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as Period)}
              className={`px-8 py-3 rounded-full text-sm font-bold capitalize transition-all duration-300 ${
                period === p
                  ? "bg-primary text-[#1E314D] shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:text-[#1E314D] hover:bg-black/5"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <VisitorChart
          data={visitorData}
          totalVisitors={totalVisitors}
          totalForms={totalForms}
          loading={loading}
        />

        <AnimalsChart
          data={animalData}
          totalAnimals={totalAnimals}
          loading={loading}
        />
      </div>

      {/* HEALTH CARD */}
      <div className="mb-12">
        <HealthCard />
      </div>

      {/* EXPORT + PREVIEW */}
      <div className="grid lg:grid-cols-3 gap-12">
        <ExportSection onPreviewChange={handlePreviewChange} />
        <PreviewTable data={previewData} />
      </div>
    </div>
  );
}
