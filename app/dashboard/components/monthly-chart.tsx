"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

export default function MonthlyChart({ chartData, chartConfig }: MonthlyChartProps) {
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
            <Bar dataKey="cases" fill="var(--color-cases)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}