import Link from "next/link";
import { Button } from "@/components/ui/button"; // [1]
import { ArrowRight } from "lucide-react";

// [1] อ้างอิงจาก component ที่คุณมีใน components/ui/button.tsx

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          ยินดีต้อนรับสู่
          <br />
          <span className="text-primary">
            ระบบรายงานข้อมูลระบาดวิทยา (Epi-North v2)
          </span>
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          โปรดเข้าสู่ระบบเพื่อจัดการและวิเคราะห์ข้อมูลกลุ่มโรค
          และตัวชี้วัดด้านสุขภาพ
        </p>
        <Button asChild size="lg">
          <Link href="/login">
            เข้าสู่ระบบ <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}