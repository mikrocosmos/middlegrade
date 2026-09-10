import { useQueries } from "@tanstack/react-query";
import { HOMEWORK_STATUS, HOMEWORK_TYPE } from "@/constants/constants";
import { homeworkQuery } from "@/lib/queries";

const BADGE_STATUSES = [
  HOMEWORK_STATUS.OVERDUE,
  HOMEWORK_STATUS.ACTIVE,
  HOMEWORK_STATUS.DELETED,
] as const;

const sumListItems = (
  results: { data?: { items?: unknown[] | null } }[],
  typeIndex: number,
) =>
  BADGE_STATUSES.reduce<number>(
    (sum, _, statusIndex) =>
      sum +
      (results[typeIndex * BADGE_STATUSES.length + statusIndex].data?.items
        ?.length ?? 0),
    0,
  );

/** Сумма заданий со статусами overdue/active/deleted для бейджей type-switch. */
export const useHomeworkCounts = (groupId: number | undefined) =>
  useQueries({
    queries: [HOMEWORK_TYPE.HOMEWORK, HOMEWORK_TYPE.LAB].flatMap((type) =>
      BADGE_STATUSES.map((status) => homeworkQuery(groupId, type, status)),
    ),
    combine: (results) => {
      const homework = sumListItems(results, 0);
      const labs = sumListItems(results, 1);

      return {
        homework,
        labs,
        total: homework + labs,
      };
    },
  });
