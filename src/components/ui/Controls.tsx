import { Check, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export const Button = ({
  variant = "primary",
  className,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
      "disabled:cursor-not-allowed disabled:opacity-50",
      variant === "primary" &&
        "bg-brand-fill text-white hover:bg-brand-fill-hover active:bg-brand-fill-active",
      variant === "outline" &&
        "border border-line text-ink-200 hover:border-line hover:bg-overlay hover:text-heading",
      variant === "ghost" && "text-ink-300 hover:bg-overlay hover:text-heading",
      className,
    )}
  />
);

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const TextField = ({
  label,
  error,
  className,
  type,
  ...props
}: TextFieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-300">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={isPassword && passwordVisible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink-50",
            "placeholder:text-ink-500",
            "focus:border-brand-400 focus:outline-none",
            isPassword && "pr-11",
            error && "border-bad",
            className,
          )}
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={passwordVisible ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={passwordVisible}
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 transition-colors hover:text-ink-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            {passwordVisible ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
};

type Option<T extends string | number> = {
  value: T;
  label: string;
  badge?: number;
};

type SegmentedProps<T extends string | number> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex w-full flex-wrap gap-1 rounded-xl border border-line bg-canvas p-1 sm:flex-nowrap",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={String(option.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex flex-1 basis-[calc(50%-0.125rem)] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:basis-0",
              active
                ? "bg-brand-fill text-white hover:bg-brand-fill-hover active:bg-brand-fill-active"
                : "text-ink-400 hover:bg-overlay hover:text-ink-100",
            )}
          >
            <span>{option.label}</span>
            {option.badge ? <Counter value={option.badge} /> : null}
          </button>
        );
      })}
    </div>
  );
}

export const Counter = ({
  value,
  label,
}: {
  value: number;
  label?: string;
}) => (
  <span
    aria-label={label}
    className="inline-flex min-w-5 items-center justify-center rounded-full bg-bad px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white tabular-nums"
  >
    {value > 99 ? "99+" : value}
  </span>
);

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
};

export const Checkbox = ({ label, checked, onChange, hint }: CheckboxProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    title={hint}
    onClick={() => onChange(!checked)}
    className="inline-flex max-w-full items-center gap-2.5 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-left text-sm text-ink-200 transition-colors hover:border-line"
  >
    <span
      aria-hidden
      className={cn(
        "grid size-4.5 shrink-0 place-items-center rounded-md border transition-colors",
        checked ? "border-brand-500 bg-brand-600 text-white" : "border-line",
      )}
    >
      {checked ? <Check className="size-3.5" /> : null}
    </span>
    {label}
  </button>
);

type SelectProps<T extends string | number> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

export function Select<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink-100 transition-colors hover:border-line"
      >
        <span className="truncate">{selected?.label ?? "—"}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-ink-400 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="scrollbar-slim absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-2xl shadow-black/60"
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <li key={String(option.value)}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-brand-600/20 text-heading"
                      : "text-ink-300 hover:bg-overlay",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {active ? (
                    <Check className="size-4 shrink-0" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export const Badge = ({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "brand";
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      tone === "neutral" && "bg-overlay text-ink-300",
      tone === "good" && "bg-good/15 text-good",
      tone === "warn" && "bg-warn/15 text-warn",
      tone === "bad" && "bg-bad/15 text-bad",
      tone === "brand" && "bg-brand-500/15 text-brand-600",
    )}
  >
    {children}
  </span>
);
