import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { HomeworkFeed } from "./HomeworkFeed";
import { ErrorState, Skeleton } from "@/components/ui/States";
import type { HomeworkSectionConfig } from "@/constants/constants";
import { homeworkFeedQuery } from "@/lib/queries";
import { flattenHomeworkPages } from "@/utils/flattenHomeworkPages";

export type HomeworkSectionState = {
  settled: boolean;
  hasItems: boolean;
  hasError: boolean;
};

type HomeworkSectionProps = {
  groupId: number | undefined;
  type: number;
  section: HomeworkSectionConfig;
  onStateChange: (status: number, state: HomeworkSectionState) => void;
};

export const HomeworkSection = ({
  groupId,
  type,
  section,
  onStateChange,
}: HomeworkSectionProps) => {
  const homework = useInfiniteQuery(homeworkFeedQuery(groupId, type, section.value));
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isPending,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = homework;
  const items = useMemo(
    () => flattenHomeworkPages(data?.pages ?? []),
    [data?.pages],
  );
  const loadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  useEffect(() => {
    if (!groupId) {
      onStateChange(section.value, {
        settled: true,
        hasItems: false,
        hasError: false,
      });
      return;
    }

    onStateChange(section.value, {
      settled: !isPending,
      hasItems: items.length > 0,
      hasError: isError && data == null,
    });
  }, [data, groupId, isError, isPending, items.length, onStateChange, section.value]);

  if (!groupId)
    return null;

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-44" />
        ))}
      </div>
    );
  }

  if (isError && data == null) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className={`text-lg font-semibold ${section.headingClass}`}>
          {section.label}: 0
        </h2>
        <ErrorState
          message="Не удалось загрузить задания"
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className={`text-lg font-semibold ${section.headingClass}`}>
        {section.label}: {items.length}
      </h2>
      <HomeworkFeed
        items={items}
        sectionStatus={section.value}
        hasMore={Boolean(hasNextPage)}
        isLoadingMore={isFetchingNextPage}
        loadError={isFetchNextPageError}
        onLoadMore={loadMore}
        onRetry={loadMore}
      />
    </section>
  );
};
