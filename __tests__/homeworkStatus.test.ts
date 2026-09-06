import { describe, expect, it } from "vitest";
import { HOMEWORK_STATUS, HOMEWORK_STATUSES } from "@/constants/constants";

describe("HOMEWORK_STATUS", () => {
  it("uses overdue 0 and deleted 5", () => {
    expect(HOMEWORK_STATUS.OVERDUE).toBe(0);
    expect(HOMEWORK_STATUS.DELETED).toBe(5);
  });

  it("has no status code 6", () => {
    expect(Object.values(HOMEWORK_STATUS)).not.toContain(6);
    expect(HOMEWORK_STATUSES.map((item) => item.value)).not.toContain(6);
  });

  it("maps Просроченные to overdue", () => {
    const overdue = HOMEWORK_STATUSES.find(
      (item) => item.label === "Просроченные"
    );

    expect(overdue?.value).toBe(0);
    expect(overdue?.value).toBe(HOMEWORK_STATUS.OVERDUE);
  });
});
