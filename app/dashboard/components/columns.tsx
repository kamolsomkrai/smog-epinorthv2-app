"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

// นี่คือ Type ของข้อมูล (จาก lib/data.ts)
export type ProvinceData = {
  province: string;
  cases: number;
  rate: number;
};

export const columns: ColumnDef<ProvinceData>[] = [
  {
    accessorKey: "province",
    header: "จังหวัด",
  },
  {
    accessorKey: "cases",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          จำนวน (ราย)
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cases"));
      return <div className="text-right font-medium">{amount.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "rate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          อัตรา (ต่อแสน)
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("rate"));
      return <div className="text-right font-medium">{amount.toFixed(2)}</div>;
    },
  },
];