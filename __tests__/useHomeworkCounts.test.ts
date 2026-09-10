import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HOMEWORK_STATUS, HOMEWORK_TYPE } from "@/constants/constants";
import { useHomeworkCounts } from "@/hooks/useHomeworkCounts";
import { homeworkQuery } from "@/lib/queries";
import type { HomeworkList } from "@/types";

vi.mock("@/lib/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/queries")>();
  return {
    ...actual,
    homeworkQuery: vi.fn(actual.homeworkQuery),
  };
});

const createList = (itemCount: number): HomeworkList => ({
  items: Array.from({ length: itemCount }, (_, index) => ({ id: index + 1 }) as HomeworkList["items"][number]),
  page: 1,
  totalPages: 1,
});

const createWrapper = (client: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };

describe("useHomeworkCounts", () => {
  afterEach(() => {
    vi.mocked(homeworkQuery).mockClear();
  });

  it("TYPE_TRIPLE: sums page-1 item counts for statuses 0, 3 and 5 per type", async () => {
    const groupId = 42;
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      },
    });

    client.setQueryData(
      ["homework", groupId, HOMEWORK_TYPE.HOMEWORK, HOMEWORK_STATUS.OVERDUE, 1],
      createList(1),
    );
    client.setQueryData(
      ["homework", groupId, HOMEWORK_TYPE.HOMEWORK, HOMEWORK_STATUS.ACTIVE, 1],
      createList(2),
    );
    client.setQueryData(
      ["homework", groupId, HOMEWORK_TYPE.HOMEWORK, HOMEWORK_STATUS.DELETED, 1],
      createList(1),
    );
    client.setQueryData(
      ["homework", groupId, HOMEWORK_TYPE.LAB, HOMEWORK_STATUS.OVERDUE, 1],
      createList(0),
    );
    client.setQueryData(
      ["homework", groupId, HOMEWORK_TYPE.LAB, HOMEWORK_STATUS.ACTIVE, 1],
      createList(1),
    );
    client.setQueryData(
      ["homework", groupId, HOMEWORK_TYPE.LAB, HOMEWORK_STATUS.DELETED, 1],
      createList(0),
    );

    const { result } = renderHook(() => useHomeworkCounts(groupId), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(result.current.homework).toBe(4);
      expect(result.current.labs).toBe(1);
      expect(result.current.total).toBe(5);
    });
  });

  it("TYPE_IGNORE_REVIEW: does not request uploaded status 2 for badge counts", () => {
    const groupId = 7;
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      },
    });

    renderHook(() => useHomeworkCounts(groupId), {
      wrapper: createWrapper(client),
    });

    const requested = vi
      .mocked(homeworkQuery)
      .mock.calls.map(([, type, status]) => [type, status]);

    expect(requested).toEqual([
      [HOMEWORK_TYPE.HOMEWORK, HOMEWORK_STATUS.OVERDUE],
      [HOMEWORK_TYPE.HOMEWORK, HOMEWORK_STATUS.ACTIVE],
      [HOMEWORK_TYPE.HOMEWORK, HOMEWORK_STATUS.DELETED],
      [HOMEWORK_TYPE.LAB, HOMEWORK_STATUS.OVERDUE],
      [HOMEWORK_TYPE.LAB, HOMEWORK_STATUS.ACTIVE],
      [HOMEWORK_TYPE.LAB, HOMEWORK_STATUS.DELETED],
    ]);
  });

  it("returns zeros when groupId is missing", () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      },
    });

    const { result } = renderHook(() => useHomeworkCounts(undefined), {
      wrapper: createWrapper(client),
    });

    expect(result.current).toEqual({ homework: 0, labs: 0, total: 0 });
  });
});
