"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { WeeklyReportData } from "@/lib/data";

export const weeklyColumns: ColumnDef<WeeklyReportData>[] = [
  {
    accessorKey: "week",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        สัปดาห์ (ปี-สัปดาห์)
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-left">{row.getValue("week")}</div>,
  },
  {
    accessorKey: "province",
    header: "จังหวัด",
  },
  {
    accessorKey: "groupname",
    header: "กลุ่มโรค",
  },
  {
    accessorKey: "patient_count",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        จำนวนผู้ป่วย
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("patient_count"));
      return <div className="text-right font-medium">{amount.toLocaleString()}</div>;
    },
  },
  { // ⭐️ คอลัมน์ใหม่
    accessorKey: "rate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        อัตรา (ต่อแสน)
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("rate"));
      return <div className="text-right font-medium">{amount.toFixed(2)}</div>;
    },
  },
];