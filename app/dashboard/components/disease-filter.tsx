"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DiseaseGroup } from "@/lib/data"; // ⭐️ Import Type

// ⭐️ รับ props 2 ตัว
interface DiseaseFilterProps {
  currentGroup: string;
  allGroups: DiseaseGroup[]; // รายชื่อกลุ่มโรคที่ดึงจาก DB
}

export default function DiseaseFilter({
  currentGroup,
  allGroups
}: DiseaseFilterProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (currentValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("disease_group", currentValue);

    // อัปเดต URL -> Next.js จะ re-render หน้า page.tsx (Server Component)
    router.push(`/dashboard?${params.toString()}`);
    setOpen(false);
  };

  const currentLabel =
    allGroups.find((group) => group.value === currentGroup)?.label ||
    "เลือกกลุ่มโรค...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-xs justify-between" // ปรับปรุงความกว้าง
        >
          <span className="truncate">{currentLabel}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-xs p-0">
        <Command>
          <CommandInput placeholder="ค้นหากลุ่มโรค..." />
          <CommandList>
            <CommandEmpty>ไม่พบกลุ่มโรค</CommandEmpty>
            <CommandGroup>
              {/* ⭐️ ลบ Hardcode ทิ้ง แล้ว Map จาก props แทน */}
              {allGroups.map((group) => (
                <CommandItem
                  key={group.value}
                  value={group.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      currentGroup === group.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {group.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}