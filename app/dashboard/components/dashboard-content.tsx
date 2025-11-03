"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DiseaseFilter from "./disease-filter";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import MonthlyChart from "./monthly-chart";

// กำหนด types สำหรับ props
interface DashboardContentProps {
  allDiseaseGroups: any[];
  currentDiseaseGroup: string;
  kpiData: {
    diseaseName: string;
    totalCases: number;
    ratePer100k: string;
  };
  chartData: any[];
  tableData: any[];
}

export default function DashboardContent({
  allDiseaseGroups,
  currentDiseaseGroup,
  kpiData,
  chartData,
  tableData
}: DashboardContentProps) {

  const chartConfig = {
    cases: {
      label: "จำนวนผู้ป่วย (ราย)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          ภาพรวมสถานการณ์
        </h2>
        <DiseaseFilter
          currentGroup={currentDiseaseGroup}
          allGroups={allDiseaseGroups}
        />
      </div>

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