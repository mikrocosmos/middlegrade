import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppLayout } from "@/components/layout/AppLayout";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderLayout = (
  counts: { counter_type: number; counter: number }[] = [],
) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    },
  });

  client.setQueryData(["homework", "counts"], counts);

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<p>Контент</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AppLayout", () => {
  it("keeps page content below the iPhone status bar", () => {
    renderLayout();

    expect(screen.getByRole("main").parentElement?.className).toContain(
      "safe-area-inset-top",
    );
  });

  it("collapses the desktop sidebar to icons", () => {
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: "Свернуть меню" }));

    expect(screen.getByRole("button", { name: "Развернуть меню" })).toBeTruthy();
  });

  it("puts feedback in the mobile header", () => {
    renderLayout();

    const links = screen.getAllByRole("link", { name: "Оставить обратную связь" });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(
      links.some((link) => link.closest("header")?.className.includes("lg:hidden")),
    ).toBe(true);
  });

  it("shows homework nav badge as sum of overdue, active and deleted counts", () => {
    renderLayout([
      { counter_type: 0, counter: 1 },
      { counter_type: 1, counter: 99 },
      { counter_type: 2, counter: 99 },
      { counter_type: 3, counter: 2 },
      { counter_type: 5, counter: 1 },
    ]);

    expect(screen.getAllByLabelText("Новых заданий: 4").length).toBeGreaterThanOrEqual(1);
  });
});
