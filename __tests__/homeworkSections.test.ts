import { describe, expect, it } from "vitest";
import {
  HOMEWORK_SECTIONS,
  HOMEWORK_STATUS,
} from "@/constants/constants";

describe("HOMEWORK_SECTIONS", () => {
  it("keeps section order 0, 5, 3, 2, 1", () => {
    expect(HOMEWORK_SECTIONS.map((section) => section.value)).toEqual([
      HOMEWORK_STATUS.OVERDUE,
      HOMEWORK_STATUS.DELETED,
      HOMEWORK_STATUS.ACTIVE,
      HOMEWORK_STATUS.UPLOADED,
      HOMEWORK_STATUS.CHECKED,
    ]);
  });

  it("maps heading classes for each status", () => {
    expect(HOMEWORK_SECTIONS[0].headingClass).toBe("text-bad");
    expect(HOMEWORK_SECTIONS[1].headingClass).toBe("text-ink-400");
    expect(HOMEWORK_SECTIONS[2].headingClass).toBe(
      "text-[var(--color-mark-classwork)]",
    );
    expect(HOMEWORK_SECTIONS[3].headingClass).toBe("text-warn");
    expect(HOMEWORK_SECTIONS[4].headingClass).toBe("text-brand-700");
  });

  it("enables submit only for overdue and active sections", () => {
    expect(HOMEWORK_SECTIONS.filter((section) => section.canSubmit)).toEqual([
      expect.objectContaining({ value: HOMEWORK_STATUS.OVERDUE }),
      expect.objectContaining({ value: HOMEWORK_STATUS.ACTIVE }),
    ]);
  });

  it("enables delete only for uploaded section", () => {
    expect(HOMEWORK_SECTIONS.filter((section) => section.canDelete)).toEqual([
      expect.objectContaining({ value: HOMEWORK_STATUS.UPLOADED }),
    ]);
  });
});
