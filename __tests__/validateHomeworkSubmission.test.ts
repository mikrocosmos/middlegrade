import { describe, expect, it } from "vitest";
import { validateHomeworkSubmission } from "@/utils/validateHomeworkSubmission";

describe("validateHomeworkSubmission", () => {
  it("rejects short text without a file", () => {
    expect(
      validateHomeworkSubmission({ answerText: "1234", file: null }),
    ).toMatch(/5/);
  });

  it("rejects txt and csv files case-insensitively", () => {
    expect(
      validateHomeworkSubmission({
        answerText: "",
        file: new File(["x"], "notes.txt", { type: "text/plain" }),
      }),
    ).toMatch(/txt/i);
    expect(
      validateHomeworkSubmission({
        answerText: "valid answer",
        file: new File(["x"], "data.CSV", { type: "text/csv" }),
      }),
    ).toMatch(/csv/i);
  });

  it("accepts valid text without a file", () => {
    expect(
      validateHomeworkSubmission({ answerText: "hello world", file: null }),
    ).toBeNull();
    expect(
      validateHomeworkSubmission({
        answerText: "a".repeat(500),
        file: null,
      }),
    ).toBeNull();
  });

  it("rejects text longer than 500 characters", () => {
    expect(
      validateHomeworkSubmission({
        answerText: "a".repeat(501),
        file: null,
      }),
    ).toMatch(/500/);
  });

  it("accepts a file without text", () => {
    expect(
      validateHomeworkSubmission({
        answerText: "",
        file: new File(["x"], "work.zip", { type: "application/zip" }),
      }),
    ).toBeNull();
  });
});
