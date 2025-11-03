"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearFilterProps {
  currentYear: string;
  allYears: string[];
}

export default function YearFilter({ currentYear, allYears }: YearFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (selectedYear: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", selectedYear);

    // เมื่อเปลี่ยนปี ให้รีเซ็ตฟิลเตอร์กลุ่มโรคกลับไปเป็น "all"
    params.set("disease_group", "all");

    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <Select value={currentYear} onValueChange={handleSelect}>
      <SelectTrigger className="w-full max-w-xs">
        <SelectValue placeholder="เลือกปี" />
      </SelectTrigger>
      <SelectContent>
        {allYears.map((year) => (
          <SelectItem key={year} value={year}>
            ปี {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}