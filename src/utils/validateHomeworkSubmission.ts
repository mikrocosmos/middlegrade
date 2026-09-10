const FORBIDDEN_EXTENSIONS = /\.(txt|csv)$/i;
const MIN_ANSWER_LENGTH = 5;
const MAX_ANSWER_LENGTH = 500;

export const validateHomeworkSubmission = ({
  answerText,
  file,
}: {
  answerText: string;
  file: File | null;
}) => {
  const trimmed = answerText.trim();

  if (file && FORBIDDEN_EXTENSIONS.test(file.name)) {
    return "Файлы .txt и .csv не поддерживаются";
  }

  if (trimmed.length > 0) {
    if (trimmed.length < MIN_ANSWER_LENGTH || trimmed.length > MAX_ANSWER_LENGTH) {
      return "Текст ответа должен быть от 5 до 500 символов";
    }
  }

  if (!file && trimmed.length === 0) {
    return "Добавьте файл или текст ответа от 5 символов";
  }

  return null;
};
