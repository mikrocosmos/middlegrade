import { useQuery } from "@tanstack/react-query";
import { Coins, Gem, LogOut, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { NavLink, Outlet } from "react-router";
import { NAV_ITEMS } from "./nav";
import { TabBar } from "./TabBar";
import { ThemePicker } from "./ThemePicker";
import { Avatar } from "@/components/ui/Avatar";
import { Counter } from "@/components/ui/Controls";
import { useLogout } from "@/hooks/useLogout";
import { useStoredState } from "@/hooks/useStoredState";
import { cn } from "@/lib/cn";
import { homeworkCountsQuery } from "@/lib/queries";
import { useAuthStore } from "@/store/auth";
import { studentBalances } from "@/utils/studentBalances";
import { sumHomeworkBadgeCounts } from "@/utils/sumHomeworkBadgeCounts";
import { FeedBackButton } from "../ui/FeedBackButton";

const Brand = ({ collapsed }: { collapsed: boolean }) => (
  <div className={cn("flex items-center gap-2.5", collapsed ? "justify-center px-0" : "px-2")}>
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
      <Sparkles className="size-4.5" aria-hidden />
    </span>
    {collapsed ? null : (
      <span className="text-base font-semibold tracking-tight text-heading">
        MiddleGrade
      </span>
    )}
  </div>
);

type NavListProps = {
  badges: Record<string, number>;
  collapsed: boolean;
};

const NavList = ({ badges, collapsed }: NavListProps) => (
  <nav aria-label="Разделы" className="flex flex-col gap-1">
    {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
      const badge = badges[to] ?? 0;

      return (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              "flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-0" : "gap-3 px-3",
              isActive
                ? "bg-brand-600/15 text-heading"
                : "text-ink-400 hover:bg-overlay hover:text-heading",
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative shrink-0">
                <Icon
                  className={cn("size-4.5", isActive && "text-brand-accent")}
                  aria-hidden
                />
                {badge ? (
                  <span className="absolute -top-2 -right-2.5">
                    <Counter value={badge} label={`Новых заданий: ${badge}`} />
                  </span>
                ) : null}
              </span>
              <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
            </>
          )}
        </NavLink>
      );
    })}
  </nav>
);

export const AppLayout = () => {
  const user = useAuthStore((state) => state.user);
  const homeworkCounts = useQuery(homeworkCountsQuery());
  const logout = useLogout();
  const { coins, gems } = studentBalances(user?.gaming_points);
  const [collapsed, setCollapsed] = useStoredState("mg-sidebar-collapsed", false);

  const badges = useMemo(
    () => ({ "/homework": sumHomeworkBadgeCounts(homeworkCounts.data) }),
    [homeworkCounts.data],
  );

  return (
    <div className="flex min-h-full">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col gap-6 border-r border-line py-5 lg:flex",
          collapsed ? "w-[4.5rem] px-2" : "w-60 px-3",
        )}
      >
        <div className={cn("flex gap-1", collapsed ? "flex-col items-center" : "items-center justify-between")}>
          <Brand collapsed={collapsed} />
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
            onClick={() => setCollapsed((current) => !current)}
            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-overlay hover:text-heading"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4.5" aria-hidden />
            ) : (
              <PanelLeftClose className="size-4.5" aria-hidden />
            )}
          </button>
        </div>
        <NavList badges={badges} collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pt-[env(safe-area-inset-top)]">
        <header className="sticky top-[env(safe-area-inset-top)] z-20 flex items-center justify-between border-b border-line bg-canvas px-4 py-3 lg:hidden">
          <span className="text-base font-semibold tracking-tight text-heading">
            MiddleGrade
          </span>
          <FeedBackButton variant="header" />
        </header>

        <header className="sticky top-[env(safe-area-inset-top)] z-20 items-center gap-3 border-b border-line bg-canvas px-4 py-3 sm:px-6 max-lg:hidden lg:flex">
          <div className="ml-auto flex items-center gap-3">
            {coins > 0 || gems > 0 ? (
              <span className="inline-flex items-center gap-3 rounded-full border border-line px-3 py-1.5 text-sm text-ink-200 tabular-nums">
                {coins > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span>{coins}</span>
                    <Coins
                      className="size-4 text-amber-400"
                      aria-label="Топкоины"
                    />
                  </span>
                ) : null}
                {gems > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span>{gems}</span>
                    <Gem
                      className="size-4 text-emerald-400"
                      aria-label="Гемы"
                    />
                  </span>
                ) : null}
              </span>
            ) : null}

            {user ? (
              <div className="flex items-center gap-2.5">
                <Avatar name={user.full_name} src={user.photo} />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-medium text-heading">
                    {user.full_name}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {user.group_name}
                  </p>
                </div>
              </div>
            ) : null}

            <ThemePicker className="w-44" />

            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Выйти"
              className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-overlay hover:text-heading disabled:opacity-50"
            >
              <LogOut className="size-4.5" aria-hidden />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 py-5 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-8 lg:pb-8">
          <Outlet />
        </main>
        <FeedBackButton />
      </div>

      <TabBar badges={badges} />
    </div>
  );
};
