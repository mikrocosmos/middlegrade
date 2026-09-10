import { ChevronRight, Coins, Gem, LogOut } from "lucide-react";
import { Link } from "react-router";
import { ThemePicker } from "@/components/layout/ThemePicker";
import { MORE_LINKS } from "@/components/layout/nav";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Controls";
import { useLogout } from "@/hooks/useLogout";
import { useAuthStore } from "@/store/auth";
import { studentBalances } from "@/utils/studentBalances";

export const MorePage = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const { coins, gems } = studentBalances(user?.gaming_points);

  return (
    <div className="flex flex-col gap-6">
      {user ? (
        <section className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
          <Avatar
            name={user.full_name}
            src={user.photo}
            className="size-14 text-base"
          />
          <div className="min-w-0">
            <h1 className="text-base font-semibold break-words text-heading">
              {user.full_name}
            </h1>
            <p className="mt-0.5 text-sm break-words text-ink-400">
              {user.group_name}
            </p>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs text-ink-400">Топкоины</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xl font-semibold text-heading tabular-nums">
            {coins}
            <Coins className="size-4 text-amber-400" aria-hidden />
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs text-ink-400">Гемы</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xl font-semibold text-heading tabular-nums">
            {gems}
            <Gem className="size-4 text-emerald-400" aria-hidden />
          </p>
        </div>
      </section>

      <nav aria-label="Ещё" className="overflow-hidden rounded-2xl border border-line bg-surface">
        {MORE_LINKS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-0"
            >
              <Icon className="size-4.5 shrink-0 text-brand-accent" aria-hidden />
              <span className="min-w-0 flex-1 text-sm font-medium text-heading">
                {item.label}
              </span>
              <ChevronRight className="size-4 shrink-0 text-ink-500" aria-hidden />
            </Link>
          );
        })}
      </nav>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <ThemePicker label="Тема" />
      </section>

      <Button
        type="button"
        variant="outline"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="w-full text-bad"
      >
        <LogOut className="size-4" aria-hidden />
        Выйти
      </Button>
    </div>
  );
};
