/** Дата перехода журнала с 12-балльной системы на 5-балльную. */
export const FIVE_GRADE_SYSTEM_DATE = new Date("2024-08-31");

export const ALL_SPECS = "Все предметы";

/** Предметы, которые тянутся через весь курс, даже если зачёт по ним уже сдан. */
export const ALWAYS_LISTED_SPECS = [
  "Иностранный язык",
  "Физическая культура",
  "История",
];

export const MARK_KINDS = [
  {
    key: "classwork",
    label: "Классная работа",
    color: "var(--color-mark-classwork)",
  },
  {
    key: "homework",
    label: "Домашняя работа",
    color: "var(--color-mark-homework)",
  },
  { key: "laboratory", label: "Лабораторные", color: "var(--color-mark-lab)" },
  { key: "control", label: "Контрольные", color: "var(--color-mark-control)" },
  {
    key: "practical",
    label: "Практические",
    color: "var(--color-mark-practical)",
  },
  { key: "exams", label: "Экзамены", color: "var(--color-mark-final)" },
] as const;

export const WEEKDAYS_SHORT = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export const WEEKDAYS_FULL = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

/** Статусы посещения из поля status_was. */
export const VISIT_STATUS = {
  ABSENT: 0,
  PRESENT: 1,
  LATE: 2,
} as const;

/** Коды статусов заданий в API журнала. */
export const HOMEWORK_STATUS = {
  CHECKED: 1,
  UPLOADED: 2,
  ACTIVE: 3,
  DELETED: 5,
  OVERDUE: 0,
} as const;

export const HOMEWORK_STATUSES = [
  { value: HOMEWORK_STATUS.ACTIVE, label: "Текущие" },
  { value: HOMEWORK_STATUS.UPLOADED, label: "На проверке" },
  { value: HOMEWORK_STATUS.OVERDUE, label: "Просроченные" },
  { value: HOMEWORK_STATUS.CHECKED, label: "Проверенные" },
] as const;

export const HOMEWORK_TYPE = {
  HOMEWORK: 0,
  LAB: 1,
} as const;

export const HOMEWORK_TYPES = [
  { value: HOMEWORK_TYPE.HOMEWORK, label: "Домашние задания" },
  { value: HOMEWORK_TYPE.LAB, label: "Лабораторные работы" },
] as const;

export const GamingPointTypes = {
  Gems: 1,
  Coins: 2,
} as const;

/** Сколько занятий показываем на одной странице списка оценок. */
export const LESSONS_PER_PAGE = 20;
export const LESSONS_LOAD_MORE = 50;
