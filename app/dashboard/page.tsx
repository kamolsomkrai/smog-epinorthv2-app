import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getKpiData,
  getChartData,
  getTableData,
  getDiseaseGroups
} from "@/lib/data";
import DiseaseFilter from "./components/disease-filter";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import MonthlyChart from "./components/monthly-chart";

export default async function DashboardPage({
  searchParams,
}: {
  // ⭐️ 1. แก้ไข Type ตรงนี้
  // ลบ '?' ออกจาก 'searchParams?:'
  // และเพิ่ม 'string[]' เพื่อความถูกต้อง
  searchParams: {
    disease_group?: string | string[];
  };
}) {

  const allDiseaseGroups = await getDiseaseGroups();

  // ⭐️ 2. แก้ไขการดึงค่า currentDiseaseGroup
  const diseaseGroupParam = searchParams.disease_group;
  const currentDiseaseGroup =
    (typeof diseaseGroupParam === 'string' ? diseaseGroupParam : allDiseaseGroups[0]?.value) || "all";

  // 3. ดึงข้อมูล 3 ส่วนพร้อมกัน (เหมือนเดิม)
  const [kpiData, chartData, tableData] = await Promise.all([
    getKpiData(currentDiseaseGroup),
    getChartData(currentDiseaseGroup),
    getTableData(currentDiseaseGroup)
  ]);

  // 4. ตั้งค่า Chart (เหมือนเดิม)
  const chartConfig = {
    cases: {
      label: "จำนวนผู้ป่วย (ราย)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ส่วนที่ 1: Filter (เหมือนเดิม) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          ภาพรวมสถานการณ์
        </h2>
        <DiseaseFilter
          currentGroup={currentDiseaseGroup}
          allGroups={allDiseaseGroups}
        />
      </div>

      {/* ส่วนที่ 2: KPI Cards (เหมือนเดิม) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>กลุ่มโรคที่เลือก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.diseaseName}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ผู้ป่วยสะสม (ปีนี้)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.totalCases.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>อัตราป่วย (ต่อแสน)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.ratePer100k}</div>
          </CardContent>
        </Card>
      </div>

      {/* ส่วนที่ 3: Chart และ Table (เหมือนเดิม) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <MonthlyChart chartData={chartData} chartConfig={chartConfig} />

        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>ข้อมูลรายจังหวัด</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={tableData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}