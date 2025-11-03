"use client"; // 👈 1. แปะป้ายนี้! บอก Next.js ว่านี่คือ Client Component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";

// 2. กำหนด Type ของ props ที่จะรับมาจาก page.tsx
// (คัดลอก Type มาจาก lib/data.ts)
type ChartData = {
  month: string;
  cases: number;
};

type ChartConfig = {
  cases: {
    label: string;
    color: string;
  };
};

interface MonthlyChartProps {
  chartData: ChartData[];
  chartConfig: ChartConfig;
}

// 3. สร้าง Component ที่รับ props
export default function MonthlyChart({ chartData, chartConfig }: MonthlyChartProps) {
  // 4. ย้ายโค้ด JSX ส่วน <Card> ของกราฟมาไว้ที่นี่
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>แนวโน้มผู้ป่วยรายเดือน</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegend content={undefined} />} />
            <Bar dataKey="cases" fill="var(--color-cases)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}