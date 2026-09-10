import { describe, expect, it } from "vitest";
import { HOMEWORK_SECTIONS, HOMEWORK_STATUS } from "@/constants/constants";

describe("HOMEWORK_STATUS", () => {
  it("uses overdue 0 and deleted 5", () => {
    expect(HOMEWORK_STATUS.OVERDUE).toBe(0);
    expect(HOMEWORK_STATUS.DELETED).toBe(5);
  });

  it("has no status code 6", () => {
    expect(Object.values(HOMEWORK_STATUS)).not.toContain(6);
    expect(HOMEWORK_SECTIONS.map((section) => section.value)).not.toContain(6);
  });

  it("maps Просроченные to overdue", () => {
    const overdue = HOMEWORK_SECTIONS.find(
      (section) => section.label === "Просроченные",
    );

    expect(overdue?.value).toBe(0);
    expect(overdue?.value).toBe(HOMEWORK_STATUS.OVERDUE);
  });
});
