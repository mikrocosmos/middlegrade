import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarClock, FileCheck2, Paperclip, Trash2, Upload, User } from "lucide-react";
import { SubmitHomeworkModal } from "./SubmitHomeworkModal";
import { Badge } from "@/components/ui/Controls";
import { Modal } from "@/components/ui/Modal";
import { HOMEWORK_SECTIONS } from "@/constants/constants";
import { ApiError } from "@/lib/api";
import { deleteHomeworkSubmission } from "@/lib/deleteHomeworkSubmission";
import { formatFullDate } from "@/lib/format";
import { isRecent } from "@/utils/isRecent";
import { studentWork } from "@/utils/studentWork";
import type { HomeworkItem } from "@/types";

const ACTION_CLASS =
  "inline-flex items-center gap-1.5 text-brand-accent hover:text-brand-accent-hover";

const markTone = (mark: number) => {
  if (mark >= 4) return "good" as const;
  if (mark >= 3) return "warn" as const;

  return "bad" as const;
};

type HomeworkCardProps = {
  item: HomeworkItem;
  sectionStatus: number;
};

export const HomeworkCard = ({ item, sectionStatus }: HomeworkCardProps) => {
  const queryClient = useQueryClient();
  const [commentOpen, setCommentOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const mark = item.homework_stud?.mark ?? null;
  const work = studentWork(item);
  const submissionId = item.homework_stud?.id;
  const section = HOMEWORK_SECTIONS.find(({ value }) => value === sectionStatus);
  const canSubmit = section?.canSubmit ?? false;
  const canDelete = section?.canDelete ?? false;

  const refreshHomework = async () => {
    await queryClient.invalidateQueries({ queryKey: ["homework"] });
  };

  const removeSubmission = useMutation({
    mutationFn: () => {
      if (!submissionId) {
        throw new Error("Submission id is required");
      }

      return deleteHomeworkSubmission(submissionId);
    },
    onSuccess: () => void refreshHomework(),
    onError: (cause: unknown) => {
      setActionError(
        cause instanceof ApiError
          ? cause.message
          : "Не удалось удалить сдачу",
      );
    },
  });

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs tracking-wide text-brand-accent uppercase">
            {item.name_spec}
          </p>
          <h3 className="mt-1 text-sm font-medium text-ink-50">
            {item.theme || "Без темы"}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isRecent(item.creation_time) ? <Badge tone="brand">Новое</Badge> : null}
          {mark !== null ? <Badge tone={markTone(mark)}>{mark}</Badge> : null}
        </div>
      </div>

      {item.comment ? (
        <p className="line-clamp-3 text-sm text-ink-400">{item.comment}</p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5" aria-hidden />
          до {formatFullDate(item.completion_time)}
        </span>
        <span className="inline-flex items-center gap-1.5 truncate">
          <User className="size-3.5" aria-hidden />
          {item.fio_teach}
        </span>
        {item.file_path ? (
          <a
            href={item.file_path}
            target="_blank"
            rel="noreferrer noopener"
            className={ACTION_CLASS}
          >
            <Paperclip className="size-3.5" aria-hidden />
            Задание
          </a>
        ) : null}
        {work.kind === "file" ? (
          <a
            href={work.url}
            target="_blank"
            rel="noreferrer noopener"
            className={ACTION_CLASS}
          >
            <FileCheck2 className="size-3.5" aria-hidden />
            Моя работа
          </a>
        ) : null}
        {work.kind === "comment" ? (
          <button
            type="button"
            onClick={() => setCommentOpen(true)}
            className={`${ACTION_CLASS} cursor-pointer bg-transparent p-0`}
          >
            <FileCheck2 className="size-3.5" aria-hidden />
            Моя работа
          </button>
        ) : null}
        {canSubmit ? (
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              setSubmitOpen(true);
            }}
            className={`${ACTION_CLASS} cursor-pointer bg-transparent p-0`}
          >
            <Upload className="size-3.5" aria-hidden />
            Загрузить
          </button>
        ) : null}
        {canDelete && submissionId ? (
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              removeSubmission.mutate();
            }}
            disabled={removeSubmission.isPending}
            className={`${ACTION_CLASS} cursor-pointer bg-transparent p-0 disabled:opacity-50`}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Удалить сдачу
          </button>
        ) : null}
      </div>

      {actionError ? (
        <p role="alert" className="text-xs text-bad">
          {actionError}
        </p>
      ) : null}

      {commentOpen && work.kind === "comment" ? (
        <Modal
          title="Моя работа"
          description={item.theme || undefined}
          onClose={() => setCommentOpen(false)}
        >
          <p className="whitespace-pre-wrap break-words text-sm text-ink-200">
            {work.text}
          </p>
        </Modal>
      ) : null}

      {submitOpen ? (
        <SubmitHomeworkModal
          homeworkId={item.id}
          theme={item.theme}
          onClose={() => setSubmitOpen(false)}
          onSuccess={() => void refreshHomework()}
        />
      ) : null}
    </li>
  );
};
