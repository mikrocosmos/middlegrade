import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeworkCard } from "@/components/homework/HomeworkCard";
import { HOMEWORK_STATUS } from "@/constants/constants";
import * as api from "@/lib/api";
import type { HomeworkItem } from "@/types";

type StudentSubmission = NonNullable<HomeworkItem["homework_stud"]>;

const homework = (
  submission: Partial<StudentSubmission> | null = null,
): HomeworkItem => ({
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
  homework_stud: submission
    ? {
        id: 100,
        filename: null,
        file_path: "",
        tmp_file: null,
        mark: 5,
        creation_time: "2026-04-20 12:00:00",
        stud_answer: null,
        auto_mark: false,
        ...submission,
      }
    : null,
  homework_comment: null,
});

const renderCard = (
  props: Partial<ComponentProps<typeof HomeworkCard>> = {},
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <ul>
        <HomeworkCard
          item={homework(null)}
          sectionStatus={HOMEWORK_STATUS.ACTIVE}
          {...props}
        />
      </ul>
    </QueryClientProvider>,
  );
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HomeworkCard", () => {
  it("opens a dialog with the comment when the work was submitted as text", async () => {
    const user = userEvent.setup();
    const answer = "Готово: https://codesandbox.io/p/sandbox/slider";

    renderCard({
      item: homework({ file_path: "", stud_answer: answer }),
    });

    await user.click(screen.getByRole("button", { name: "Моя работа" }));

    expect(screen.getByRole("dialog", { name: "Моя работа" })).toHaveTextContent(
      answer,
    );
  });

  it("keeps a file submission as an external link", () => {
    const fileUrl = "https://cdn.example/my-work.zip";

    renderCard({
      item: homework({ filename: "my-work.zip", file_path: fileUrl }),
    });

    expect(screen.getByRole("link", { name: "Моя работа" })).toHaveAttribute(
      "href",
      fileUrl,
    );
    expect(screen.queryByRole("button", { name: "Моя работа" })).toBeNull();
  });

  it("hides my work when nothing was submitted", () => {
    renderCard();

    expect(screen.queryByRole("link", { name: "Моя работа" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Моя работа" })).toBeNull();
  });

  it("shows upload only in overdue and active sections", () => {
    const { unmount } = renderCard({
      sectionStatus: HOMEWORK_STATUS.OVERDUE,
    });

    expect(screen.getByRole("button", { name: "Загрузить" })).toBeInTheDocument();
    unmount();

    renderCard({ sectionStatus: HOMEWORK_STATUS.ACTIVE });
    expect(screen.getByRole("button", { name: "Загрузить" })).toBeInTheDocument();
  });

  it("hides upload in deleted, uploaded and checked sections", () => {
    for (const sectionStatus of [
      HOMEWORK_STATUS.DELETED,
      HOMEWORK_STATUS.UPLOADED,
      HOMEWORK_STATUS.CHECKED,
    ]) {
      const { unmount } = renderCard({
        sectionStatus,
        item: homework({ id: 77 }),
      });

      expect(screen.queryByRole("button", { name: "Загрузить" })).toBeNull();
      unmount();
    }
  });

  it("shows delete only in uploaded section with submission id", () => {
    const { unmount } = renderCard({
      sectionStatus: HOMEWORK_STATUS.UPLOADED,
      item: homework({ id: 77 }),
    });

    expect(
      screen.getByRole("button", { name: "Удалить сдачу" }),
    ).toBeInTheDocument();

    unmount();

    renderCard({
      sectionStatus: HOMEWORK_STATUS.ACTIVE,
      item: homework({ id: 77 }),
    });

    expect(screen.queryByRole("button", { name: "Удалить сдачу" })).toBeNull();
  });

  it("calls delete endpoint with submission id", async () => {
    const user = userEvent.setup();
    const requestSpy = vi.spyOn(api, "request").mockResolvedValue(undefined);

    renderCard({
      sectionStatus: HOMEWORK_STATUS.UPLOADED,
      item: homework({ id: 77 }),
    });

    await user.click(screen.getByRole("button", { name: "Удалить сдачу" }));

    expect(requestSpy).toHaveBeenCalledWith("/homework/operations/delete", {
      method: "POST",
      body: { id: 77 },
    });
  });

  it("opens the submit dialog from Загрузить", async () => {
    const user = userEvent.setup();

    renderCard({ sectionStatus: HOMEWORK_STATUS.ACTIVE });

    await user.click(screen.getByRole("button", { name: "Загрузить" }));

    expect(
      screen.getByRole("dialog", { name: "Загрузить работу" }),
    ).toBeInTheDocument();
  });

  it("shows an alert when delete fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "request").mockRejectedValue(new api.ApiError(400, "fail"));

    renderCard({
      sectionStatus: HOMEWORK_STATUS.UPLOADED,
      item: homework({ id: 77 }),
    });

    await user.click(screen.getByRole("button", { name: "Удалить сдачу" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("fail");
  });
});
