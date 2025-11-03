"use client"; // 👈 1. นี่คือ Client Component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DiseaseFilter from "./disease-filter";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import dynamic from "next/dynamic"; // 👈 2. Import 'dynamic' ที่นี่

// 3. Import Types จาก lib/data.ts (เพื่อให้รู้จัก props)
import type { KpiData, ChartData, TableData, DiseaseGroup } from "@/lib/data";

// ⭐️ 4. ใช้ dynamic import *ภายใน* Client Component นี้
const MonthlyChart = dynamic(
  () => import("./monthly-chart"),
  {
    ssr: false, // 👈 'ssr: false' ปลอดภัยแล้วใน Client Component
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

// 5. กำหนด props ที่จะรับจาก page.tsx
interface DashboardContentProps {
  allDiseaseGroups: DiseaseGroup[];
  currentDiseaseGroup: string;
  kpiData: KpiData;
  chartData: ChartData[];
  tableData: TableData[];
}

// 6. สร้าง Component ที่รับ props และแสดงผล UI ทั้งหมด
export default function DashboardContent({
  allDiseaseGroups,
  currentDiseaseGroup,
  kpiData,
  chartData,
  tableData
}: DashboardContentProps) {

  // ย้าย chartConfig มาไว้ที่นี่
  const chartConfig = {
    cases: {
      label: "จำนวนผู้ป่วย (ราย)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ส่วนที่ 1: Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          ภาพรวมสถานการณ์
        </h2>
        <DiseaseFilter
          currentGroup={currentDiseaseGroup}
          allGroups={allDiseaseGroups}
        />
      </div>

      {/* ส่วนที่ 2: KPI Cards */}
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
              {kpiData?.totalCases.toLocaleString()}
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

      {/* ส่วนที่ 3: Chart และ Table */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* 7. เรียกใช้กราฟ (ที่ import แบบ dynamic) */}
        <MonthlyChart chartData={chartData} chartConfig={chartConfig as any} />

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