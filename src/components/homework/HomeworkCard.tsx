import { useState } from "react";
import { CalendarClock, FileCheck2, Paperclip, User } from "lucide-react";
import { Badge } from "@/components/ui/Controls";
import { Modal } from "@/components/ui/Modal";
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

export const HomeworkCard = ({ item }: { item: HomeworkItem }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const mark = item.homework_stud?.mark ?? null;
  const work = studentWork(item);

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
      </div>

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
    </li>
  );
};
