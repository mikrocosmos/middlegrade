import { describe, expect, it } from "vitest";
import { sumHomeworkBadgeCounts } from "@/utils/sumHomeworkBadgeCounts";

describe("sumHomeworkBadgeCounts", () => {
  it("NAV_SUM: sums counters for status 0, 3 and 5 and ignores 1 and 2", () => {
    expect(
      sumHomeworkBadgeCounts([
        { counter_type: 0, counter: 1 },
        { counter_type: 1, counter: 99 },
        { counter_type: 2, counter: 99 },
        { counter_type: 3, counter: 2 },
        { counter_type: 5, counter: 1 },
      ]),
    ).toBe(4);
  });

  it("NAV_ONLY_ACTIVE: counts only active when overdue and deleted are absent", () => {
    expect(sumHomeworkBadgeCounts([{ counter_type: 3, counter: 5 }])).toBe(5);
  });

  it("NAV_EMPTY: returns 0 for empty or invalid input", () => {
    expect(sumHomeworkBadgeCounts([])).toBe(0);
    expect(sumHomeworkBadgeCounts(null)).toBe(0);
    expect(sumHomeworkBadgeCounts(undefined)).toBe(0);
    expect(sumHomeworkBadgeCounts("not-an-array")).toBe(0);
    expect(
      sumHomeworkBadgeCounts([
        null,
        { counter_type: 3, counter: Number.NaN },
        { counter_type: 3, counter: -1 },
        { counter_type: 3, counter: 2 },
      ]),
    ).toBe(2);
  });

  it("NAV_EXAMPLE: sums one overdue and one active assignment", () => {
    expect(
      sumHomeworkBadgeCounts([
        { counter_type: 0, counter: 1 },
        { counter_type: 3, counter: 1 },
      ]),
    ).toBe(2);
  });
});
