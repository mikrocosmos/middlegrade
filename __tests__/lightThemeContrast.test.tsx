import { readFileSync } from "node:fs";
import path from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeworkCard } from "@/components/homework/HomeworkCard";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar } from "@/components/layout/TabBar";
import { Button, Segmented } from "@/components/ui/Controls";
import { LoginPage } from "@/pages/Login";
import { MorePage } from "@/pages/More";
import type { HomeworkItem } from "@/types";

const stylesPath = path.resolve(process.cwd(), "src/styles/index.css");

const storage = new Map<string, string>();

const setTheme = (theme: "light" | "dark") => {
  document.documentElement.dataset.theme = theme;
};

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
  cleanup();
  delete document.documentElement.dataset.theme;
  vi.unstubAllGlobals();
});

const homeworkItem: HomeworkItem = {
  id: 1,
  id_spec: 10,
  id_teach: 20,
  id_group: 30,
  fio_teach: "Андреев Андрей Андреевич",
  theme: "JS JQuery",
  completion_time: "2026-05-02 23:59:59",
  creation_time: "2026-01-10 12:00:00",
  overdue_time: "2026-05-09 23:59:59",
  filename: "task.pdf",
  file_path: "https://cdn.example/task.pdf",
  comment: "Сделайте слайдер на jQuery",
  name_spec: "Язык сценариев JavaScript",
  status: 1,
  common_status: 1,
  cover_image: null,
  homework_stud: null,
  homework_comment: null,
};

const renderHomeworkCard = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <ul>
        <HomeworkCard
          item={homeworkItem}
          sectionStatus={3}
        />
      </ul>
    </QueryClientProvider>,
  );
};

const renderAppLayout = (path = "/") => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<p>Контент</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const classList = (element: Element) =>
  (element.getAttribute("class") ?? "").trim().split(/\s+/).filter(Boolean);

const expectHasClass = (element: Element, className: string) => {
  expect(classList(element)).toContain(className);
};

const expectLacksClass = (element: Element, className: string) => {
  expect(classList(element)).not.toContain(className);
};

const expectAccentClasses = (element: Element) => {
  expectHasClass(element, "text-brand-accent");
  expectLacksClass(element, "text-brand-300");
  expectLacksClass(element, "text-brand-200");
};

const expectFillClasses = (element: Element) => {
  expectHasClass(element, "bg-brand-fill");
  expectHasClass(element, "hover:bg-brand-fill-hover");
  expectHasClass(element, "active:bg-brand-fill-active");
};

const expectNoLegacyFillClasses = (element: Element) => {
  expectLacksClass(element, "bg-brand-600");
  expectLacksClass(element, "hover:bg-brand-500");
};

const extractCssBlock = (css: string, selector: string) => {
  const start = css.indexOf(selector);
  if (start === -1) return "";

  const braceStart = css.indexOf("{", start);
  let depth = 0;

  for (let i = braceStart; i < css.length; i++) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(braceStart, i + 1);
    }
  }

  return "";
};

describe("light theme contrast matrix", () => {
  it("CSS tokens: dark/light brand accent and fill map to expected hexes", () => {
    const css = readFileSync(stylesPath, "utf-8");
    const rootBlock = extractCssBlock(css, ":root");
    const lightBlock = extractCssBlock(css, 'html[data-theme="light"]');

    expect(rootBlock).toContain("--brand-accent: #bda9ff");
    expect(rootBlock).toContain("--brand-accent-hover: #d9cfff");
    expect(rootBlock).toContain("--brand-fill: #7024f7");
    expect(rootBlock).toContain("--brand-fill-hover: #7f45ff");
    expect(rootBlock).toContain("--brand-fill-active: #5f16dc");

    expect(lightBlock).toContain("--brand-accent: #7024f7");
    expect(lightBlock).toContain("--brand-accent-hover: #5f16dc");
    expect(lightBlock).toContain("--brand-fill: #5f16dc");
    expect(lightBlock).toContain("--brand-fill-hover: #7024f7");
    expect(lightBlock).toContain("--brand-fill-active: #4f14b4");

    expect(css).toContain("--color-brand-accent: var(--brand-accent)");
    expect(css).not.toContain("--color-brand-accent: var(--color-brand-accent)");
  });

  it("LIGHT_TEXT: accent text uses semantic tokens, not brand-300", () => {
    setTheme("light");

    renderHomeworkCard();
    expectAccentClasses(screen.getByText("Язык сценариев JavaScript"));
    expectAccentClasses(screen.getByRole("link", { name: "Задание" }));

    cleanup();

    renderAppLayout("/");
    const sidebar = screen.getByRole("navigation", { name: "Разделы" });
    const activeIcon = sidebar.querySelector('a[aria-current="page"] svg');
    expect(activeIcon).not.toBeNull();
    expectAccentClasses(activeIcon!);

    cleanup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <TabBar badges={{}} />
      </MemoryRouter>,
    );
    const tabNav = screen.getByRole("navigation", { name: "Основная навигация" });
    expectAccentClasses(within(tabNav).getByRole("link", { name: "Главная" }));

    cleanup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <MorePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const moreIcon = screen
      .getByRole("link", { name: "Отзывы" })
      .querySelector("svg");
    expect(moreIcon).not.toBeNull();
    expectAccentClasses(moreIcon!);
  });

  it("DARK_TEXT: accent text still uses semantic tokens", () => {
    setTheme("dark");

    renderHomeworkCard();
    expectAccentClasses(screen.getByText("Язык сценариев JavaScript"));
    expectAccentClasses(screen.getByRole("link", { name: "Задание" }));

    cleanup();

    renderAppLayout("/");
    const sidebar = screen.getByRole("navigation", { name: "Разделы" });
    const activeIcon = sidebar.querySelector('a[aria-current="page"] svg');
    expect(activeIcon).not.toBeNull();
    expectAccentClasses(activeIcon!);

    cleanup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <TabBar badges={{}} />
      </MemoryRouter>,
    );
    const tabNav = screen.getByRole("navigation", { name: "Основная навигация" });
    expectAccentClasses(within(tabNav).getByRole("link", { name: "Главная" }));

    cleanup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <MorePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const moreIcon = screen
      .getByRole("link", { name: "Отзывы" })
      .querySelector("svg");
    expect(moreIcon).not.toBeNull();
    expectAccentClasses(moreIcon!);
  });

  it("LIGHT_HOVER: action links hover via accent-hover, not brand-200", () => {
    setTheme("light");

    renderHomeworkCard();

    const action = screen.getByRole("link", { name: "Задание" });

    expectHasClass(action, "hover:text-brand-accent-hover");
    expectLacksClass(action, "hover:text-brand-200");
    expectLacksClass(action, "text-brand-300");
  });

  it("LIGHT_FILL: primary Button and active Segmented use fill tokens", () => {
    setTheme("light");

    render(
      <>
        <Button>Отправить</Button>
        <Segmented
          options={[
            { value: "a", label: "Активные" },
            { value: "b", label: "Архив" },
          ]}
          value="a"
          onChange={() => undefined}
          ariaLabel="Фильтр"
        />
      </>,
    );

    const button = screen.getByRole("button", { name: "Отправить" });
    const activeTab = screen.getByRole("tab", { name: "Активные" });

    for (const node of [button, activeTab]) {
      expectFillClasses(node);
      expectNoLegacyFillClasses(node);
    }
  });

  it("DARK_FILL: primary Button and active Segmented keep fill token classes", () => {
    setTheme("dark");

    render(
      <>
        <Button>Отправить</Button>
        <Segmented
          options={[
            { value: "a", label: "Активные" },
            { value: "b", label: "Архив" },
          ]}
          value="a"
          onChange={() => undefined}
          ariaLabel="Фильтр"
        />
      </>,
    );

    const button = screen.getByRole("button", { name: "Отправить" });
    const activeTab = screen.getByRole("tab", { name: "Активные" });

    for (const node of [button, activeTab]) {
      expectFillClasses(node);
      expectNoLegacyFillClasses(node);
    }
  });

  it("OTHER_FILL: TabBar pill and login brand mark keep bg-brand-600", () => {
    setTheme("light");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <TabBar badges={{}} />
      </MemoryRouter>,
    );

    const featuredIconWrap = screen
      .getByRole("link", { name: "Главная" })
      .querySelector("span.grid");

    expect(featuredIconWrap).not.toBeNull();
    expectHasClass(featuredIconWrap!, "bg-brand-600");
    expectLacksClass(featuredIconWrap!, "bg-brand-fill");

    cleanup();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <LoginPage />
      </QueryClientProvider>,
    );

    const loginBrand = screen
      .getByRole("heading", { name: "MiddleGrade" })
      .closest(".mb-8")
      ?.querySelector("span.grid");

    expect(loginBrand).not.toBeNull();
    expectHasClass(loginBrand!, "bg-brand-600");
    expectLacksClass(loginBrand!, "bg-brand-fill");
  });
});
