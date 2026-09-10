import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeworkPage } from "@/pages/Homework";
import { ApiError, request } from "@/lib/api";
import type { HomeworkItem, HomeworkList, UserGroup } from "@/types";
import { useAuthStore } from "@/store/auth";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");

  return {
    ...actual,
    request: vi.fn(),
  };
});

const mockedRequest = vi.mocked(request);

const group: UserGroup = {
  id: 30,
  name: "ИС-21",
  group_status: 1,
  is_primary: true,
};

const homeworkItem = (
  id: number,
  status: number,
  submission: HomeworkItem["homework_stud"] = null,
): HomeworkItem => ({
  id,
  id_spec: 10,
  id_teach: 20,
  id_group: 30,
  fio_teach: "Андреев Андрей Андреевич",
  theme: `Theme ${id}`,
  completion_time: "2026-05-02 23:59:59",
  creation_time: "2026-01-10 12:00:00",
  overdue_time: "2026-05-09 23:59:59",
  filename: "task.pdf",
  file_path: "https://cdn.example/task.pdf",
  comment: "Comment",
  name_spec: "JavaScript",
  status,
  common_status: status,
  cover_image: null,
  homework_stud: submission,
  homework_comment: null,
});

const page = (status: number, ids: number[]): HomeworkList => ({
  page: 1,
  totalPages: 1,
  items: ids.map((id) => homeworkItem(id, status)),
});

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    },
  });

const stubHomework = (
  byStatus: (status: number) => HomeworkList | Promise<HomeworkList>,
) => {
  mockedRequest.mockImplementation(async (path, options) => {
    if (path === "/homework/groups")
      return [group];

    if (path === "/homework/counts")
      return [];

    if (path === "/homework")
      return byStatus(Number(options?.params?.status));

    throw new Error(`Unexpected request: ${path}`);
  });
};

const renderPage = () => {
  useAuthStore.setState({
    user: {
      current_group_id: group.id,
      groups: [group],
    } as never,
  });

  return render(
    <QueryClientProvider client={createClient()}>
      <HomeworkPage />
    </QueryClientProvider>,
  );
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  useAuthStore.setState({ user: null });
});

describe("HomeworkPage sections", () => {
  it("renders sections in order 0, 5, 3, 2, 1 and hides empty deleted section", async () => {
    stubHomework((status) => {
      if (status === 0)
        return page(status, [1]);
      if (status === 5)
        return page(status, []);
      if (status === 3)
        return page(status, [2]);
      if (status === 2)
        return page(status, [3]);
      if (status === 1)
        return page(status, [4]);

      return page(status, []);
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Просроченные: 1" })).toBeInTheDocument();
    });

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((node) => node.textContent);

    expect(headings).toEqual([
      "Просроченные: 1",
      "Текущие: 1",
      "На проверке: 1",
      "Проверенные: 1",
    ]);
    expect(screen.queryByRole("heading", { name: "Удалённые: 0" })).toBeNull();
    expect(screen.getAllByRole("button", { name: "Загрузить" })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Удалить сдачу" })).toBeNull();
    expect(screen.queryByText("Заданий нет")).toBeNull();
  });

  it("renders deleted between overdue and active when it has cards", async () => {
    stubHomework((status) => {
      if (status === 0)
        return page(status, [1]);
      if (status === 5)
        return page(status, [50]);
      if (status === 3)
        return page(status, [2]);

      return page(status, []);
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Удалённые: 1" })).toBeInTheDocument();
    });

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent),
    ).toEqual(["Просроченные: 1", "Удалённые: 1", "Текущие: 1"]);
  });

  it("shows only current headings when the other sections are empty", async () => {
    stubHomework((status) => page(status, status === 3 ? [1] : []));
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Текущие: 1" })).toBeInTheDocument();
    });

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent),
    ).toEqual(["Текущие: 1"]);
  });

  it("keeps type tablist and removes status tablist", async () => {
    stubHomework((status) => page(status, status === 3 ? [1] : []));
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("tablist", { name: "Тип задания" })).toBeInTheDocument();
    });

    expect(screen.queryByRole("tablist", { name: "Статус задания" })).toBeNull();
  });

  it("shows empty state when every section is empty", async () => {
    stubHomework((status) => page(status, []));
    renderPage();

    expect(await screen.findByText("Заданий нет")).toBeInTheDocument();
  });

  it("shows delete only on an uploaded card with a submission", async () => {
    stubHomework((status) => {
      if (status === 2) {
        return {
          page: 1,
          totalPages: 1,
          items: [
            homeworkItem(3, 2, {
              id: 77,
              filename: null,
              file_path: "",
              tmp_file: null,
              mark: null,
              creation_time: "2026-04-20 12:00:00",
              stud_answer: "ok",
              auto_mark: false,
            }),
          ],
        };
      }

      return page(status, []);
    });

    renderPage();

    expect(
      await screen.findByRole("button", { name: "Удалить сдачу" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Загрузить" })).toBeNull();
  });

  it("shows retry on a failed section and still renders a healthy neighbor", async () => {
    stubHomework((status) => {
      if (status === 0)
        return Promise.reject(new ApiError(500, "fail"));
      if (status === 3)
        return page(status, [2]);

      return page(status, []);
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Просроченные: 0" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Текущие: 1" })).toBeInTheDocument();
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Не удалось загрузить задания",
    );
    expect(screen.getByRole("button", { name: "Повторить" })).toBeInTheDocument();
    expect(screen.queryByText("Заданий нет")).toBeNull();
  });
});
