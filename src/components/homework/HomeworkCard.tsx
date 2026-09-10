import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CalendarClock,
  FileCheck2,
  Paperclip,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { SubmitHomeworkModal } from "./SubmitHomeworkModal";
import { Badge, Button } from "@/components/ui/Controls";
import { Modal } from "@/components/ui/Modal";
import { HOMEWORK_SECTIONS } from "@/constants/constants";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { deleteHomeworkSubmission } from "@/lib/deleteHomeworkSubmission";
import { formatFullDate } from "@/lib/format";
import { isRecent } from "@/utils/isRecent";
import { studentWork } from "@/utils/studentWork";
import type { HomeworkItem } from "@/types";

const ACTION_CLASS =
  "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-2 p-2 text-left text-base font-medium transition hover:text-ink-950";

const MARK_TONE_BG = {
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
} as const;

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const mark = item.homework_stud?.mark ?? null;
  const work = studentWork(item);
  const submissionId = item.homework_stud?.id;
  const section = HOMEWORK_SECTIONS.find(
    ({ value }) => value === sectionStatus,
  );
  const canSubmit = section?.canSubmit ?? false;
  const canDelete = section?.canDelete ?? false;
  const toneClass = section?.headingClass ?? "text-brand-accent";
  const actionClass = cn(
    ACTION_CLASS,
    section?.actionClass ?? "text-brand-accent hover:bg-brand-accent",
  );

  const refreshHomework = async () => {
    await queryClient.invalidateQueries({ queryKey: ["homework"] });
  };

  const removeSubmission = useMutation({
    mutationFn: () => {
      if (!submissionId) throw new Error("Submission id is required");

      return deleteHomeworkSubmission(submissionId);
    },
    onSuccess: () => {
      setDeleteOpen(false);
      void refreshHomework();
    },
    onError: (cause: unknown) => {
      setActionError(
        cause instanceof ApiError ? cause.message : "Не удалось удалить сдачу",
      );
    },
  });

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-2xl border-4 p-4 max-w-75 relative",
        section?.cardClass ?? "border-line bg-surface",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink-50">{item.name_spec}</h3>

          <p className={cn("mt-1 text-xs tracking-wide", toneClass)}>
            {item.theme || "Без темы"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isRecent(item.creation_time) ? (
            <Badge tone="bad">Новое</Badge>
          ) : null}
          {mark !== null ? (
            <div
              className={cn(
                "text-xl font-bold text-white rounded-xl p-2 absolute top-0 right-0",
                MARK_TONE_BG[markTone(mark)],
              )}
            >
              {mark}
            </div>
          ) : null}
        </div>
      </div>

      {item.comment ? (
        <p className="line-clamp-3 text-sm text-ink-400">{item.comment}</p>
      ) : null}

      <div className="mt-auto flex flex-col gap-3 text-xs text-ink-500">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5" aria-hidden />
            до {formatFullDate(item.completion_time)}
          </span>
          <span className="inline-flex items-center gap-1.5 truncate">
            <User className="size-3.5" aria-hidden />
            {item.fio_teach}
          </span>
        </div>

        <div className="flex flex-col items-start gap-2">
          {item.file_path ? (
            <a
              href={item.file_path}
              target="_blank"
              rel="noreferrer noopener"
              className={actionClass}
            >
              <Paperclip className="size-4" aria-hidden />
              Задание
            </a>
          ) : null}
          {work.kind === "file" ? (
            <a
              href={work.url}
              target="_blank"
              rel="noreferrer noopener"
              className={actionClass}
            >
              <FileCheck2 className="size-4" aria-hidden />
              Моя работа
            </a>
          ) : null}
          {work.kind === "comment" ? (
            <button
              type="button"
              onClick={() => setCommentOpen(true)}
              className={cn(actionClass, "cursor-pointer")}
            >
              <FileCheck2 className="size-4" aria-hidden />
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
              className={cn(actionClass, "cursor-pointer")}
            >
              <Upload className="size-4" aria-hidden />
              Загрузить
            </button>
          ) : null}
          {canDelete && submissionId ? (
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setDeleteOpen(true);
              }}
              className={cn(
                ACTION_CLASS,
                "cursor-pointer text-bad hover:bg-bad",
              )}
            >
              <Trash2 className="size-4" aria-hidden />
              Удалить сдачу
            </button>
          ) : null}
        </div>
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

      {deleteOpen ? (
        <Modal
          title="Удалить сдачу?"
          onClose={() => {
            if (!removeSubmission.isPending) setDeleteOpen(false);
          }}
          footer={
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteOpen(false)}
                disabled={removeSubmission.isPending}
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={() => removeSubmission.mutate()}
                disabled={removeSubmission.isPending}
              >
                Удалить
              </Button>
            </>
          }
        />
      ) : null}
    </li>
  );
};
