"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCog,
  Users,
  UserSearch,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Users Management", icon: Users },
  { href: "/dashboard/technicians", label: "Technician Management", icon: UserCog },
  { href: "/dashboard/service-requests", label: "Service Request", icon: UserSearch },
  { href: "/dashboard/payments", label: "Payment History", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            className={cn(
              "flex h-13 items-center gap-3 rounded-2xl border px-4 text-[16px] font-medium transition",
              isActive
                ? "border-[#f4c542] bg-[#f4c542] text-white"
                : "border-transparent text-white hover:bg-[#232323]",
            )}
            href={item.href}
            onClick={onNavigate}
          >
            <Icon className="size-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
    enabled: !!session,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const displayName = profile?.user?.name || session?.user?.name || "Rain Altmann";
  const displayEmail = profile?.user?.email || session?.user?.email;
  const displayAvatar = profile?.user?.avatar || session?.user?.avatar;

  async function handleLogout() {
    setLogoutOpen(false);
    await signOut({ redirect: false });
    toast.success("Logged out");
    router.push("/sign-in");
  }

  return (
    <div className="app-shell min-h-screen text-white">
      <div className="flex min-h-screen">
        <aside className="panel-gradient sticky top-0 hidden h-screen w-[312px] shrink-0 self-start border-r border-[#202020] px-6 py-8 lg:flex lg:flex-col">
          <div className="flex items-center justify-center">
            <Image
              src="/assets/logo.png"
              alt="Spa Guys"
              width={118}
              height={102}
              priority
              unoptimized
            />
          </div>

          <div className="mt-14 flex-1 overflow-y-auto">
            <NavLinks pathname={pathname} />
          </div>

          <Button className="w-full justify-start gap-3" onClick={() => setLogoutOpen(true)} variant="danger">
            <LogOut className="size-5" />
            Log out
          </Button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-[100px] items-center justify-between border-b border-[#202020] bg-[#141414] px-4 md:px-8">
            <button
              className="rounded-xl border border-[#3a3a3a] p-3 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu className="size-5" />
            </button>

            <div className="ml-auto flex items-center gap-4">
              <div className="text-right">
                <p className="font-[family-name:var(--font-steki)] text-[16px] uppercase tracking-[0.02em] text-[#d5d5d5]">
                  {displayName}
                </p>
                <p className="text-xs text-[#7f7f7f]">{displayEmail}</p>
              </div>
              <Avatar
                className="size-12 border border-[#3a3a3a]"
                name={displayName}
                src={displayAvatar}
              />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      {sidebarOpen ? (
        <div className="glass-overlay fixed inset-0 z-50 lg:hidden">
          <aside className="panel-gradient flex h-full w-[300px] flex-col border-r border-[#202020] px-6 py-8">
            <div className="mb-10 flex items-center justify-between">
              <Image
                src="/assets/logo.png"
                alt="Spa Guys"
                width={100}
                height={86}
                priority
                unoptimized
              />
              <button onClick={() => setSidebarOpen(false)} type="button">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setSidebarOpen(false)} pathname={pathname} />
            </div>
            <Button
              className="mt-8 w-full justify-start gap-3"
              onClick={() => {
                setSidebarOpen(false);
                setLogoutOpen(true);
              }}
              variant="danger"
            >
              <LogOut className="size-5" />
              Log out
            </Button>
          </aside>
        </div>
      ) : null}

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        className="max-w-[592px] rounded-[24px] bg-white p-8 text-center text-black"
      >
        <h2 className="text-[26px] font-semibold text-white">Are you sure want to Log out?</h2>
        <p className="mt-3 text-[16px] text-white">Tap log out from the dashboard.</p>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Button className="border-[#ff3030] text-[#ff3030]" onClick={() => setLogoutOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button className="border-[#ff1938] bg-[#ff1938] text-white" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Modal>
    </div>
  );
}
