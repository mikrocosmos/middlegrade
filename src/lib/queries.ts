import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";
import { request } from "./api";
import type {
  AcademicPerformance,
  ActivityEntry,
  AttendanceStatistic,
  ChartPoint,
  HomeworkCount,
  HomeworkGroup,
  HomeworkList,
  Leaderboard,
  MarketCatalog,
  PaymentHistoryEntry,
  PaymentInfo,
  PaymentScheduleEntry,
  ScheduleLesson,
  StudentExam,
  StudentReview,
  EvaluateLessonQueueItem,
  StudentVisit,
  UserInfo,
} from "@/types";
import { nextHomeworkPage } from "@/utils/nextHomeworkPage";
import { toFutureExams } from "@/utils/toFutureExams";

const FIVE_MINUTES = 1000 * 60 * 5;

export const meQuery = () =>
  queryOptions({
    queryKey: ["me"],
    queryFn: () => request<{ user: UserInfo }>("/auth/me").then((r) => r.user),
    staleTime: FIVE_MINUTES,
    retry: false,
  });

export const marksQuery = () =>
  queryOptions({
    queryKey: ["marks"],
    queryFn: () => request<StudentVisit[]>("/progress/marks"),
    staleTime: FIVE_MINUTES,
  });

export const examsQuery = () =>
  queryOptions({
    queryKey: ["exams"],
    queryFn: () => request<StudentExam[]>("/progress/exams"),
    staleTime: FIVE_MINUTES,
  });

export const performanceQuery = () =>
  queryOptions({
    queryKey: ["dashboard", "performance"],
    queryFn: () => request<AcademicPerformance>("/dashboard/performance"),
    staleTime: FIVE_MINUTES,
  });

export const attendanceQuery = () =>
  queryOptions({
    queryKey: ["dashboard", "attendance"],
    queryFn: () => request<AttendanceStatistic>("/dashboard/attendance"),
    staleTime: FIVE_MINUTES,
  });

export const futureExamsQuery = () =>
  queryOptions({
    queryKey: ["dashboard", "exams"],
    queryFn: () => request<unknown>("/dashboard/exams").then(toFutureExams),
    staleTime: FIVE_MINUTES,
  });

export const activityQuery = (limit = 40) =>
  queryOptions({
    queryKey: ["dashboard", "activity", limit],
    queryFn: () =>
      request<ActivityEntry[]>("/dashboard/activity", { params: { limit } }),
    staleTime: FIVE_MINUTES,
  });

export const chartQuery = (kind: "average-progress" | "attendance") =>
  queryOptions({
    queryKey: ["dashboard", "chart", kind],
    queryFn: () => request<ChartPoint[]>(`/dashboard/charts/${kind}`),
    staleTime: FIVE_MINUTES,
  });

export const leadersQuery = (scope: "group" | "stream") =>
  queryOptions({
    queryKey: ["dashboard", "leaders", scope],
    queryFn: () => request<Leaderboard>(`/dashboard/leaders/${scope}`),
    staleTime: FIVE_MINUTES,
  });

export const scheduleMonthQuery = (date: string) =>
  queryOptions({
    queryKey: ["schedule", "month", date],
    queryFn: () =>
      request<ScheduleLesson[]>("/schedule/month", { params: { date } }),
    staleTime: FIVE_MINUTES,
  });

export const scheduleRangeQuery = (start: string, end: string) =>
  queryOptions({
    queryKey: ["schedule", "range", start, end],
    queryFn: () =>
      request<ScheduleLesson[]>("/schedule/range", { params: { start, end } }),
    staleTime: FIVE_MINUTES,
  });

export const homeworkGroupsQuery = () =>
  queryOptions({
    queryKey: ["homework", "groups"],
    queryFn: () => request<HomeworkGroup[]>("/homework/groups"),
    staleTime: FIVE_MINUTES,
  });

export const homeworkQuery = (
  groupId: number | undefined,
  type: number,
  status: number,
  page = 1,
) =>
  queryOptions({
    queryKey: ["homework", groupId, type, status, page],
    queryFn: () =>
      request<HomeworkList>("/homework", {
        params: { groupId, type, status, page },
      }),
    enabled: Boolean(groupId),
    placeholderData: keepPreviousData,
    staleTime: FIVE_MINUTES,
  });

export const homeworkFeedQuery = (
  groupId: number | undefined,
  type: number,
  status: number,
  subjectSource?: number,
  subjectId?: number,
) =>
  infiniteQueryOptions({
    queryKey: ["homework", "feed", groupId, type, status, subjectSource, subjectId],
    queryFn: ({ pageParam }) =>
      request<HomeworkList>("/homework", {
        params: {
          groupId,
          type,
          status,
          page: pageParam,
          subjectSource,
          subjectId,
        },
      }),
    initialPageParam: 1,
    getNextPageParam: nextHomeworkPage,
    enabled: Boolean(groupId),
    staleTime: FIVE_MINUTES,
  });

export const homeworkCountsQuery = () =>
  queryOptions({
    queryKey: ["homework", "counts"],
    queryFn: () => request<HomeworkCount[]>("/homework/counts"),
    staleTime: FIVE_MINUTES,
    retry: false,
  });

export const reviewsQuery = () =>
  queryOptions({
    queryKey: ["reviews"],
    queryFn: () => request<StudentReview[]>("/reviews"),
    staleTime: FIVE_MINUTES,
  });

export const evaluateLessonQueueQuery = () =>
  queryOptions({
    queryKey: ["evaluate-lesson", "queue"],
    queryFn: () => request<EvaluateLessonQueueItem[]>("/feedback/list"),
    staleTime: FIVE_MINUTES,
    retry: false,
  });

export const marketQuery = () =>
  queryOptions({
    queryKey: ["market"],
    queryFn: () => request<MarketCatalog>("/market"),
    staleTime: FIVE_MINUTES,
  });

export const paymentQuery = () =>
  queryOptions({
    queryKey: ["payment"],
    queryFn: () => request<PaymentInfo>("/payment"),
    staleTime: FIVE_MINUTES,
  });

export const paymentHistoryQuery = () =>
  queryOptions({
    queryKey: ["payment", "history"],
    queryFn: () => request<PaymentHistoryEntry[]>("/payment/history"),
    staleTime: FIVE_MINUTES,
  });

export const paymentScheduleQuery = () =>
  queryOptions({
    queryKey: ["payment", "schedule"],
    queryFn: () => request<PaymentScheduleEntry[]>("/payment/schedule"),
    staleTime: FIVE_MINUTES,
  });
