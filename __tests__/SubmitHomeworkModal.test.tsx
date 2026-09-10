import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubmitHomeworkModal } from "@/components/homework/SubmitHomeworkModal";
import * as api from "@/lib/api";

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SubmitHomeworkModal", () => {
  it("does not call create for short text without a file", async () => {
    const user = userEvent.setup();
    const requestSpy = vi.spyOn(api, "request");

    render(
      <QueryClientProvider client={createClient()}>
        <SubmitHomeworkModal
          homeworkId={10}
          theme="Theme"
          onClose={() => undefined}
          onSuccess={() => undefined}
        />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(requestSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not call create for a txt file", async () => {
    const user = userEvent.setup();
    const requestSpy = vi.spyOn(api, "request");

    render(
      <QueryClientProvider client={createClient()}>
        <SubmitHomeworkModal
          homeworkId={10}
          theme="Theme"
          onClose={() => undefined}
          onSuccess={() => undefined}
        />
      </QueryClientProvider>,
    );

    await user.upload(
      screen.getByLabelText("Файл"),
      new File(["x"], "notes.txt", { type: "text/plain" }),
    );
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(requestSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("calls create with spent time 13/37 for valid text", async () => {
    const user = userEvent.setup();
    const requestSpy = vi.spyOn(api, "request").mockResolvedValue({ ok: true });
    const onSuccess = vi.fn();

    render(
      <QueryClientProvider client={createClient()}>
        <SubmitHomeworkModal
          homeworkId={10}
          theme="Theme"
          onClose={() => undefined}
          onSuccess={onSuccess}
        />
      </QueryClientProvider>,
    );

    await user.type(
      screen.getByLabelText("Текст ответа"),
      "valid answer text",
    );
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith(
        "/homework/operations/create",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const body = requestSpy.mock.calls[0]?.[1]?.body;

    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("id")).toBe("10");
    expect((body as FormData).get("answerText")).toBe("valid answer text");
    expect((body as FormData).get("spentTimeHour")).toBe("13");
    expect((body as FormData).get("spentTimeMin")).toBe("37");
    expect(onSuccess).toHaveBeenCalled();
  });

  it("calls create for a zip without text", async () => {
    const user = userEvent.setup();
    const requestSpy = vi.spyOn(api, "request").mockResolvedValue({ ok: true });

    render(
      <QueryClientProvider client={createClient()}>
        <SubmitHomeworkModal
          homeworkId={10}
          theme="Theme"
          onClose={() => undefined}
          onSuccess={() => undefined}
        />
      </QueryClientProvider>,
    );

    await user.upload(
      screen.getByLabelText("Файл"),
      new File(["x"], "work.zip", { type: "application/zip" }),
    );
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalled();
    });

    const body = requestSpy.mock.calls[0]?.[1]?.body as FormData;

    expect(body.get("id")).toBe("10");
    expect(body.get("answerText")).toBeNull();
    expect(body.get("file")).toBeInstanceOf(File);
  });

  it("shows an alert when create fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "request").mockRejectedValue(new api.ApiError(400, "fail"));

    render(
      <QueryClientProvider client={createClient()}>
        <SubmitHomeworkModal
          homeworkId={10}
          theme="Theme"
          onClose={() => undefined}
          onSuccess={() => undefined}
        />
      </QueryClientProvider>,
    );

    await user.type(screen.getByLabelText("Текст ответа"), "valid answer text");
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("fail");
  });
});
