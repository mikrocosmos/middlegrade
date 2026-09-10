import { useState } from "react";
import { Button } from "@/components/ui/Controls";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api";
import { createHomeworkSubmission } from "@/lib/createHomeworkSubmission";
import { validateHomeworkSubmission } from "@/utils/validateHomeworkSubmission";

type SubmitHomeworkModalProps = {
  homeworkId: number;
  theme: string;
  onClose: () => void;
  onSuccess: () => void;
};

export const SubmitHomeworkModal = ({
  homeworkId,
  theme,
  onClose,
  onSuccess,
}: SubmitHomeworkModalProps) => {
  const [answerText, setAnswerText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const validationError = validateHomeworkSubmission({ answerText, file });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await createHomeworkSubmission({
        homeworkId,
        answerText,
        file: file ?? undefined,
      });
      onSuccess();
      onClose();
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Не удалось отправить работу",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Загрузить работу"
      description={theme || undefined}
      onClose={() => {
        if (!isSubmitting)
          onClose();
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="homework-answer" className="text-sm font-medium text-ink-300">
            Текст ответа
          </label>
          <textarea
            id="homework-answer"
            value={answerText}
            onChange={(event) => setAnswerText(event.target.value)}
            rows={5}
            maxLength={500}
            className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink-50 placeholder:text-ink-500 focus:border-brand-400 focus:outline-none"
            placeholder="Ссылка или комментарий к работе"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="homework-file" className="text-sm font-medium text-ink-300">
            Файл
          </label>
          <input
            id="homework-file"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm text-ink-300 file:mr-3 file:rounded-lg file:border-0 file:bg-overlay file:px-3 file:py-2 file:text-sm file:text-ink-100"
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-bad">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={isSubmitting}>
            Отправить
          </Button>
        </div>
      </div>
    </Modal>
  );
};
