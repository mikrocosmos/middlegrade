import { HOMEWORK_STATUS } from "@/constants/constants";
import type { HomeworkCount } from "@/types";

const BADGE_COUNTER_TYPES = new Set<number>([
  HOMEWORK_STATUS.OVERDUE,
  HOMEWORK_STATUS.ACTIVE,
  HOMEWORK_STATUS.DELETED,
]);

const isHomeworkCount = (entry: unknown): entry is HomeworkCount => {
  if (entry == null || typeof entry !== "object") return false;

  const { counter_type, counter } = entry as HomeworkCount;
  return (
    typeof counter_type === "number" &&
    typeof counter === "number" &&
    Number.isFinite(counter) &&
    counter >= 0
  );
};

export const sumHomeworkBadgeCounts = (counts: HomeworkCount[] | unknown): number => {
  if (!Array.isArray(counts)) return 0;

  return counts.reduce((sum, entry) => {
    if (!isHomeworkCount(entry)) return sum;
    if (!BADGE_COUNTER_TYPES.has(entry.counter_type)) return sum;
    return sum + entry.counter;
  }, 0);
};
