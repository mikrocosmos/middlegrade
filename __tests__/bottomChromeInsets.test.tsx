import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar } from "@/components/layout/TabBar";
import { Modal } from "@/components/ui/Modal";

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

const renderLayout = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    },
  });

  client.setQueryData(["homework", "counts"], []);

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

const getMainClassName = () => screen.getByRole("main").className;

describe("bottomChromeInsets", () => {
  describe("MAIN_NARROW", () => {
    it("keeps calc bottom padding on main below lg", () => {
      renderLayout();

      expect(getMainClassName()).toContain(
        "pb-[calc(5.25rem+env(safe-area-inset-bottom))]",
      );
    });
  });

  describe("MAIN_SM", () => {
    it("uses sm:pt-8 and sm:px-6 without sm:py-8", () => {
      renderLayout();

      const className = getMainClassName();

      expect(className).toContain("sm:pt-8");
      expect(className).toContain("sm:px-6");
      expect(className).not.toContain("sm:py-8");
    });
  });

  describe("MAIN_LG", () => {
    it("restores default bottom padding at lg while keeping calc for narrower viewports", () => {
      renderLayout();

      const className = getMainClassName();

      expect(className).toContain("lg:pb-8");
      expect(className).toContain(
        "pb-[calc(5.25rem+env(safe-area-inset-bottom))]",
      );
    });
  });

  describe("MODAL_INSET", () => {
    it("applies safe-area bottom inset on overlay and centers dialog", () => {
      render(
        <Modal title="Комментарий" onClose={() => undefined}>
          текст
        </Modal>,
      );

      const dialog = screen.getByRole("dialog", { name: "Комментарий" });
      const overlay = dialog.parentElement;

      expect(overlay?.className).toContain("safe-area-inset-bottom");
      expect(overlay).toHaveClass("items-center");
      expect(overlay).not.toHaveClass("items-end");
    });
  });

  describe("TABBAR_SAFE", () => {
    it("keeps fixed positioning with safe-area bottom padding and lg:hidden", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <TabBar badges={{}} />
        </MemoryRouter>,
      );

      const nav = screen.getByRole("navigation", {
        name: "Основная навигация",
      });

      expect(nav).toHaveClass("fixed");
      expect(nav).toHaveClass("lg:hidden");
      expect(nav.className).toContain("pb-[env(safe-area-inset-bottom)]");
    });
  });
});
