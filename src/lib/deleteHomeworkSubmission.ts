import { request } from "./api";

export const deleteHomeworkSubmission = (submissionId: number) =>
  request<void>("/homework/operations/delete", {
    method: "POST",
    body: { id: submissionId },
  });
