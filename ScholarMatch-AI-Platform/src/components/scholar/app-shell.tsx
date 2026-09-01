import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarClock,
  Route as RouteIcon,
  FolderCheck,
  Wallet,
  UserRound,
  Bell,
  Search,
  GraduationCap,
  X,
  CircleAlert,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications, scholarships, student } from "@/lib/scholarship-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/deadlines", label: "Deadlines", icon: CalendarClock },
  { to: "/roadmap", label: "Roadmap", icon: RouteIcon },
  { to: "/documents", label: "Documents", icon: FolderCheck },
  { to: "/funding", label: "Funding", icon: Wallet },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

const groupIcon = {
  Deadline: CalendarClock,
  Document: CircleAlert,
  Match: Sparkles,
};

const readNotificationsKey = "scholarmatch-read-notifications";

function getStoredReadNotifications() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(readNotificationsKey);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) && parsed.every((id) => typeof id === "string") ? parsed : [];
  } catch {
    return [];
  }
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>(getStoredReadNotifications);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter(
    (notification) => notification.unread && !readNotifications.includes(notification.id),
  ).length;

  const markAllAsRead = () => {
    const nextReadNotifications = notifications
      .filter((notification) => notification.unread)
      .map((notification) => notification.id);
    setReadNotifications(nextReadNotifications);
    window.localStorage.setItem(readNotificationsKey, JSON.stringify(nextReadNotifications));
  };

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    if (q.includes("dashboard") || q.includes("home")) {
      navigate({ to: "/" });
      return;
    }
    if (q.includes("deadline")) {
      navigate({ to: "/deadlines" });
      return;
    }
    if (q.includes("roadmap")) {
      navigate({ to: "/roadmap" });
      return;
    }
    if (q.includes("document")) {
      navigate({ to: "/documents" });
      return;
    }
    if (q.includes("funding") || q.includes("cost") || q.includes("budget")) {
      navigate({ to: "/funding" });
      return;
    }
    if (q.includes("profile")) {
      navigate({ to: "/profile" });
      return;
    }

    const matchedScholarship = scholarships.find(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.fundingType.toLowerCase().includes(q) ||
        s.documents.some((d) => d.name.toLowerCase().includes(q)),
    );

    if (matchedScholarship) {
      navigate({ to: "/scholarship/$id", params: { id: matchedScholarship.id } });
      return;
    }

    navigate({ to: "/" });
  };

  return (
    <div className="aurora hero-grid min-h-screen">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/60 bg-brand-50/38 px-3 py-5 shadow-[8px_0_30px_rgba(13,14,7,0.04)] backdrop-blur-2xl lg:flex">
          <Link to="/" className="mb-8 flex items-center gap-2.5 px-2">
            <span className="grid size-9 place-items-center rounded-xl bg-leaf-500 text-leaf-900">
              <GraduationCap className="size-5" />
            </span>
            <span>
              <span className="block text-sm leading-tight font-extrabold text-brand-900">
                ScholarMatch AI
              </span>
              <span className="block text-[11px] text-brand-500">Scholarship matching</span>
            </span>
          </Link>

          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-leaf-200 text-leaf-900"
                      : "text-brand-600 hover:bg-brand-200/60 hover:text-brand-900",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Card className="mt-auto border-brand-200/90 bg-brand-50/85 shadow-card">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-brand-800">Profile strength</p>
              <p className="metric mt-1 text-2xl text-leaf-700">78%</p>
              <p className="mt-1 text-[11px] text-brand-500">
                Add community service entries to improve matching.
              </p>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/60 bg-brand-50/38 shadow-[0_8px_30px_rgba(13,14,7,0.04)] backdrop-blur-2xl">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <Link to="/" className="lg:hidden">
                <span className="grid size-9 place-items-center rounded-xl bg-leaf-500 text-leaf-900">
                  <GraduationCap className="size-5" />
                </span>
              </Link>
              <form onSubmit={onSearch} className="hidden max-w-sm flex-1 sm:block">
                <label className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-3 size-4 text-brand-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search scholarships, countries, documents"
                    className="h-10 rounded-[10px] border-brand-200/90 bg-brand-50/95 pr-3 pl-9 text-sm text-brand-900 placeholder:text-brand-400"
                    aria-label="Search scholarships, countries, documents"
                  />
                </label>
              </form>

              <Button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open notifications"
                variant="outline"
                size="icon"
                className="relative ml-auto size-9 border-brand-200 bg-brand-50/95 text-brand-700 hover:bg-brand-200/60"
              >
                <Bell className="size-4" />
                {unread > 0 ? (
                  <Badge className="metric absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border-0 bg-flare-500 p-0 text-[10px] text-white">
                    {unread}
                  </Badge>
                ) : null}
              </Button>

              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-[10px] px-1.5 py-1 hover:bg-brand-200/60"
              >
                <span className="grid size-9 place-items-center rounded-full bg-brand-800 text-xs font-bold text-brand-50">
                  {student.initials}
                </span>
                <span className="hidden text-sm font-semibold text-brand-800 sm:block">
                  {student.name}
                </span>
              </Link>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-brand-900">{title}</h1>
                {subtitle ? <p className="mt-1 text-brand-500">{subtitle}</p> : null}
              </div>
              {children}
            </div>
          </main>

          <nav className="sticky bottom-0 z-20 flex justify-between border-t border-white/70 bg-brand-50/60 px-2 py-2 shadow-[0_-8px_30px_rgba(13,14,7,0.06)] backdrop-blur-2xl lg:hidden">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-[10px] py-1.5 text-[10px] font-medium",
                    active ? "bg-leaf-200 text-leaf-900" : "text-brand-500",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-950/30 backdrop-blur-[2px]"
          />
          <aside className="glass-card absolute top-0 right-0 flex h-full w-full max-w-sm flex-col rounded-none border-y-0 border-r-0 border-l-white/70 bg-brand-50/78 shadow-elevated">
            <div className="flex items-center justify-between border-b border-brand-200 px-5 py-4">
              <h2 className="text-lg font-bold text-brand-900">Notifications</h2>
              <Button
                onClick={() => setOpen(false)}
                aria-label="Close"
                variant="ghost"
                size="icon"
                className="size-8 rounded-[10px] text-brand-500 hover:bg-brand-200/60"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {(["Deadline", "Document", "Match"] as const).map((group) => {
                const items = notifications.filter((n) => n.group === group);
                const Icon = groupIcon[group];
                return (
                  <section key={group} className="mb-5">
                    <p className="mb-2 text-[11px] font-semibold tracking-wide text-brand-500 uppercase">
                      {group} alerts
                    </p>
                    <div className="flex flex-col gap-2">
                      {items.map((n) => (
                        <div
                          key={n.id}
                          className="flex gap-3 rounded-[12px] border border-brand-200 bg-brand-50 p-3"
                        >
                          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-200 text-brand-700">
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-brand-900">{n.title}</p>
                            <p className="mt-0.5 text-xs text-brand-500">{n.detail}</p>
                            <p className="mt-1 text-[11px] text-brand-400">{n.time}</p>
                          </div>
                          {n.unread && !readNotifications.includes(n.id) ? (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-flare-500" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
            <div className="border-t border-brand-200 p-4">
              <Button
                onClick={markAllAsRead}
                className="h-10 w-full rounded-[10px] text-sm font-semibold"
              >
                Mark all as read
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
