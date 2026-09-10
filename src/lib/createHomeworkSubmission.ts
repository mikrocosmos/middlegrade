import { request } from "./api";

export type CreateHomeworkSubmissionInput = {
  homeworkId: number;
  answerText?: string;
  file?: File;
};

export const createHomeworkSubmission = ({
  homeworkId,
  answerText,
  file,
}: CreateHomeworkSubmissionInput) => {
  const form = new FormData();

  form.append("id", String(homeworkId));
  form.append("spentTimeHour", "13");
  form.append("spentTimeMin", "37");

  const trimmed = answerText?.trim();

  if (trimmed) {
    form.append("answerText", trimmed);
  }

  if (file) {
    form.append("file", file);
  }

  return request<unknown>("/homework/operations/create", {
    method: "POST",
    body: form,
  });
};
