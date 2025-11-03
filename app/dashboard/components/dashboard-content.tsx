"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DiseaseFilter from "./disease-filter";
import YearFilter from "./year-filter"; // ⭐️ 1. Import ฟิลเตอร์ปี
import { DataTable } from "./data-table";
import { columns } from "./columns";
import dynamic from "next/dynamic";
import { weeklyColumns } from "./weekly-columns";

// ⭐️ 1. ตรวจสอบว่า Import Type ครบ
import type { KpiData, ChartData, TableData, DiseaseGroup, WeeklyReportData } from "@/lib/data";

// 2. ตรวจสอบว่า prop 'weeklyReportData' มี Type ที่ถูกต้อง
interface DashboardContentProps {
  allYears: string[];
  currentYear: string;
  allDiseaseGroups: DiseaseGroup[];
  currentDiseaseGroup: string;
  kpiData: KpiData;
  chartData: ChartData[];
  tableData: TableData[];
  weeklyReportData: WeeklyReportData[];
}

// (โค้ดส่วน dynamic import ... )
const MonthlyChart = dynamic(
  () => import("./monthly-chart"),
  {
    ssr: false,
    loading: () => (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>แนวโน้มผู้ป่วยรายเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    )
  }
);

export default function DashboardContent({
  allYears,
  currentYear,
  allDiseaseGroups,
  currentDiseaseGroup,
  kpiData,
  chartData,
  tableData,
  weeklyReportData
}: DashboardContentProps) {

  const chartConfig = {
    cases: {
      label: "จำนวนผู้ป่วย (ราย)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* (ส่วนที่ 1: Filter - เหมือนเดิม) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          ภาพรวมสถานการณ์
        </h2>
        <DiseaseFilter
          currentGroup={currentDiseaseGroup}
          allGroups={allDiseaseGroups}
        />
      </div>

      {/* (ส่วนที่ 2: KPI Cards - เหมือนเดิม) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* ... (Cards) ... */}
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

      {/* (ส่วนที่ 3: Chart และ Table - เหมือนเดิม) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlyChart chartData={chartData} chartConfig={chartConfig as any} />
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>ข้อมูลรายจังหวัด (สรุปยอดรวม)</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={tableData} />
          </CardContent>
        </Card>
      </div>

      {/* (ส่วนที่ 4: ตารางรายสัปดาห์ - เหมือนเดิม) */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>รายงานรายสัปดาห์ (ทุกโรค ทุกจังหวัด)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ⭐️ ส่วนนี้จะใช้ 'weeklyColumns' (ที่มี rate) และ 'weeklyReportData' (ที่ถูกกรองแล้ว) */}
            <DataTable columns={weeklyColumns} data={weeklyReportData} />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}