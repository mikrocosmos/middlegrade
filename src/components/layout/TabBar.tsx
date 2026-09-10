import { NavLink, useLocation } from "react-router";
import { isMorePath, TAB_ITEMS } from "./nav";
import { Counter } from "@/components/ui/Controls";
import { cn } from "@/lib/cn";

type TabBarProps = {
  badges: Record<string, number>;
};

export const TabBar = ({ badges }: TabBarProps) => {
  const location = useLocation();
  const moreActive = isMorePath(location.pathname);

  return (
    <nav
      aria-label="Основная навигация"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {TAB_ITEMS.map((item) => {
          const badge = badges[item.to] ?? 0;

          return (
            <li key={item.to} className="min-w-0">
              <NavLink
                to={item.to}
                end={item.to === "/" || item.to === "/more"}
                aria-current={
                  item.to === "/more" ? (moreActive ? "page" : false) : undefined
                }
                className={({ isActive }) => {
                  const active = item.to === "/more" ? moreActive : isActive;

                  return cn(
                    "flex h-16 min-w-0 flex-col items-center justify-end gap-1 px-1 pb-2",
                    active ? "text-heading" : "text-ink-400",
                    item.featured && "text-brand-accent",
                  );
                }}
              >
                {({ isActive }) => {
                  const active = item.to === "/more" ? moreActive : isActive;
                  const Icon = item.icon;

                  return (
                    <>
                      <span
                        className={cn(
                          "relative grid size-10 shrink-0 place-items-center",
                          item.featured &&
                            "rounded-2xl bg-brand-600 text-white shadow-[0_8px_20px_rgb(112_36_247_/_0.4)]",
                        )}
                      >
                        <Icon
                          className={cn(
                            item.featured
                              ? "size-5 text-white"
                              : "size-5",
                            !item.featured &&
                              (active ? "text-heading" : "text-ink-400"),
                          )}
                          aria-hidden
                        />
                        {badge ? (
                          <span className="absolute -top-1 -right-1">
                            <Counter
                              value={badge}
                              label={`Новых заданий: ${badge}`}
                            />
                          </span>
                        ) : null}
                      </span>
                      <span className="h-3 w-full truncate text-center text-[10px] leading-3 font-medium">
                        {item.label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
