import { ALL_SPECS } from "@/constants/constants";

export const parseHomeworkSubjectKey = (key: string) => {
  if (key === ALL_SPECS) return undefined;

  const [source, id] = key.split(":");
  const subjectSource = Number(source);
  const subjectId = Number(id);

  if (
    !Number.isInteger(subjectSource) ||
    !Number.isInteger(subjectId) ||
    subjectSource <= 0 ||
    subjectId <= 0
  )
    return undefined;

  return { subjectSource, subjectId };
};
