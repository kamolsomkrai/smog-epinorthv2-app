import {
  getKpiData,
  getChartData,
  getTableData,
  getDiseaseGroups,
  getWeeklyProvincialReport,
  getAvailableYears
} from "@/lib/data";
import DashboardContent from "./components/dashboard-content";
import { Suspense } from "react";

// ⭐️ 1. เพิ่มบรรทัดนี้ เพื่อบังคับให้ Next.js ดึงข้อมูลใหม่ทุกครั้ง
export const dynamic = "force-dynamic";

function DashboardLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <p className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</p>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    disease_group?: string | string[];
    year?: string | string[];
  };
}) {

  const allYears = await getAvailableYears();
  const yearParam = searchParams.year;
  const currentYear =
    (typeof yearParam === 'string' ? yearParam : allYears[0]) || new Date().getFullYear().toString();

  const allDiseaseGroups = await getDiseaseGroups(currentYear);
  const diseaseGroupParam = searchParams.disease_group;
  const currentDiseaseGroup =
    (typeof diseaseGroupParam === 'string' ? diseaseGroupParam : allDiseaseGroups[0]?.value) || "all";

  const [
    kpiData,
    chartData,
    tableData,
    weeklyReportData
  ] = await Promise.all([
    getKpiData(currentDiseaseGroup, currentYear),
    getChartData(currentDiseaseGroup, currentYear),
    getTableData(currentDiseaseGroup, currentYear),
    getWeeklyProvincialReport(currentDiseaseGroup, currentYear)
  ]);

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent
        allYears={allYears}
        currentYear={currentYear}
        allDiseaseGroups={allDiseaseGroups}
        currentDiseaseGroup={currentDiseaseGroup}
        kpiData={kpiData}
        chartData={chartData}
        tableData={tableData}
        weeklyReportData={weeklyReportData}
      />
    </Suspense>
  );
}