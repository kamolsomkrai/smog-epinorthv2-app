import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut } from "lucide-react";

// --- UserMenu (Client Component) ---
// (ส่วนนี้เหมือนเดิม)
function UserMenu({ user }: { user: { name?: string | null; email?: string | null } }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full">
          <Avatar className="size-8">
            <AvatarImage src="#" alt={user.name || "User"} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/api/auth/signout">
            <LogOut className="mr-2 size-4" />
            <span>ออกจากระบบ</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- Main Layout (Server Component) ---
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- ⬇️ 1. COMMENT OUT การตรวจสอบ session จริง ---
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/login");
  // }
  // --- จบส่วนที่ 1 ---


  // --- ⬇️ 2. สร้าง MOCK SESSION สำหรับการพัฒนา ---
  const session = {
    user: {
      name: "Developer",
      email: "dev@example.com"
    }
  };
  // --- จบส่วนที่ 2 ---

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-1">
          <Link href="/dashboard" className="text-lg font-semibold text-primary">
            Epi-North Dashboard
          </Link>
        </nav>
        {/* ส่วนนี้จะยังทำงานได้ เพราะเรามี mock session */}
        <UserMenu user={session.user} />
      </header>
      <main className="flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}