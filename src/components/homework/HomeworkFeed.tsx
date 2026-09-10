import { useEffect } from "react";
import { HomeworkCard } from "./HomeworkCard";
import { ErrorState, Spinner } from "@/components/ui/States";
import { useInView } from "@/hooks/useInView";
import type { HomeworkItem } from "@/types";

type HomeworkFeedProps = {
  items: HomeworkItem[];
  sectionStatus: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadError: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
};

export const HomeworkFeed = ({
  items,
  sectionStatus,
  hasMore,
  isLoadingMore,
  loadError,
  onLoadMore,
  onRetry,
}: HomeworkFeedProps) => {
  const { ref, inView } = useInView(hasMore && !isLoadingMore && !loadError);

  useEffect(() => {
    if (inView) {
      onLoadMore();
    }
  }, [inView, onLoadMore]);

  return (
    <div className="flex flex-col gap-4">
      <ul
        aria-busy={isLoadingMore || undefined}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {items.map((item) => (
          <HomeworkCard
            key={item.id}
            item={item}
            sectionStatus={sectionStatus}
          />
        ))}
      </ul>
      {hasMore ? <div ref={ref} className="h-px w-full" aria-hidden /> : null}
      {isLoadingMore ? <Spinner label="Ещё задания" /> : null}
      {loadError ? (
        <ErrorState
          message="Не удалось подгрузить следующие задания"
          onRetry={onRetry}
        />
      ) : null}
    </div>
  );
};
