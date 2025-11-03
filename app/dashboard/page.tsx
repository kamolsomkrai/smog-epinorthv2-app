import {
  getKpiData,
  getChartData,
  getTableData,
  getDiseaseGroups
} from "@/lib/data";
import DashboardContent from "./components/dashboard-content";

// ⭐️ แก้ไข Type - รับ searchParams เป็น Promise
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    disease_group?: string | string[];
  }>;
}) {

  // ⭐️ ใช้ await เพื่อ unwrap searchParams
  const params = await searchParams;

  // ดึงข้อมูลทั้งหมดใน Server Component
  const allDiseaseGroups = await getDiseaseGroups();

  // ใช้ params แทน searchParams
  const diseaseGroupParam = params.disease_group;
  const currentDiseaseGroup =
    (typeof diseaseGroupParam === 'string' ? diseaseGroupParam : allDiseaseGroups[0]?.value) || "all";

  const [kpiData, chartData, tableData] = await Promise.all([
    getKpiData(currentDiseaseGroup),
    getChartData(currentDiseaseGroup),
    getTableData(currentDiseaseGroup)
  ]);

  // ส่งข้อมูลทั้งหมดเป็น props ไปให้ Client Component
  return (
    <DashboardContent
      allDiseaseGroups={allDiseaseGroups}
      currentDiseaseGroup={currentDiseaseGroup}
      kpiData={kpiData}
      chartData={chartData}
      tableData={tableData}
    />
  );
}