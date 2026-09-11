import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { request } from "@/lib/api";
import { evaluateLessonQueueQuery } from "@/lib/queries";
import type { EvaluateLessonQueueItem } from "@/types";

type EvaluateStage = "teach" | "lesson";

type SubmitPayload = {
  key: string;
  mark_teach: number;
  mark_lesson: number;
  comment_teach: string;
  comment_lesson: string;
};

const bulkPayload = (key: string): SubmitPayload & {
  tags_teach: [];
  tags_lesson: [];
} => ({
  key,
  mark_teach: 5,
  mark_lesson: 5,
  comment_teach: "",
  comment_lesson: "",
  tags_teach: [],
  tags_lesson: [],
});

const submitEvaluate = (payload: SubmitPayload) =>
  request<{ ok: true }>("/feedback", {
    method: "POST",
    body: {
      ...payload,
      tags_teach: [],
      tags_lesson: [],
    },
  });

const invalidateScores = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["me"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard", "activity"] }),
    queryClient.invalidateQueries({ queryKey: ["marks"] }),
  ]);
};

export const useEvaluateLessonGate = (enabled: boolean) => {
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);
  const [queue, setQueue] = useState<EvaluateLessonQueueItem[]>([]);
  const [stage, setStage] = useState<EvaluateStage>("teach");
  const [markTeach, setMarkTeach] = useState<number | null>(null);
  const [commentTeach, setCommentTeach] = useState("");
  const [markLesson, setMarkLesson] = useState<number | null>(null);
  const [commentLesson, setCommentLesson] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  const listQuery = useQuery({
    ...evaluateLessonQueueQuery(),
    enabled,
  });

  useEffect(() => {
    if (listQuery.isSuccess && listQuery.data.length > 0) {
      setQueue(listQuery.data);
    }
  }, [listQuery.isSuccess, listQuery.data]);

  const resetCurrentItem = useCallback(() => {
    setStage("teach");
    setMarkTeach(null);
    setCommentTeach("");
    setMarkLesson(null);
    setCommentLesson("");
  }, []);

  const submit = useMutation({
    mutationFn: submitEvaluate,
    onSuccess: async () => {
      await invalidateScores(queryClient);
      setQueue((current) => current.slice(1));
      resetCurrentItem();
    },
  });

  const current = queue[0] ?? null;
  const isLoading = enabled && listQuery.isPending;
  const shouldShow =
    enabled && !dismissed && !listQuery.isError && queue.length > 0;

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  const goNext = useCallback(() => {
    if (stage === "teach" && markTeach !== null) {
      setStage("lesson");
    }
  }, [markTeach, stage]);

  const goBack = useCallback(() => {
    if (stage === "lesson") {
      setStage("teach");
    }
  }, [stage]);

  const submitCurrent = useCallback(() => {
    if (!current || markTeach === null || markLesson === null) {
      return;
    }

    submit.mutate({
      key: current.key,
      mark_teach: markTeach,
      mark_lesson: markLesson,
      comment_teach: commentTeach.trim(),
      comment_lesson: commentLesson.trim(),
    });
  }, [commentLesson, commentTeach, current, markLesson, markTeach, submit]);

  const closeAllFive = useCallback(async () => {
    if (isBulkSubmitting) {
      return;
    }

    setIsBulkSubmitting(true);

    try {
      const items = [...queue];

      const results = await Promise.allSettled(
        items.map((item) => submitEvaluate(bulkPayload(item.key))),
      );

      setDismissed(true);
      setQueue([]);
      resetCurrentItem();

      void invalidateScores(queryClient);

      const failedKeys = items
        .filter((_, index) => results[index].status === "rejected")
        .map((item) => item.key);

      if (failedKeys.length === 0) {
        return;
      }

      setTimeout(() => {
        void Promise.allSettled(
          failedKeys.map((key) => submitEvaluate(bulkPayload(key))),
        ).then(() => invalidateScores(queryClient));
      }, 1000);
    } finally {
      setIsBulkSubmitting(false);
    }
  }, [isBulkSubmitting, queryClient, queue, resetCurrentItem]);

  return {
    current,
    stage,
    markTeach,
    setMarkTeach,
    commentTeach,
    setCommentTeach,
    markLesson,
    setMarkLesson,
    commentLesson,
    setCommentLesson,
    queueLength: queue.length,
    isLoading,
    shouldShow,
    dismiss,
    goNext,
    goBack,
    submitCurrent,
    closeAllFive,
    isSubmitting: submit.isPending || isBulkSubmitting,
  };
};

export type EvaluateLessonGateState = ReturnType<typeof useEvaluateLessonGate>;
