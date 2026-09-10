import { HomeworkCard } from "./HomeworkCard";
import { Button } from "@/components/ui/Controls";
import { ErrorState } from "@/components/ui/States";
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
}: HomeworkFeedProps) => (
  <div className="flex flex-col gap-4">
    <ul
      aria-busy={isLoadingMore || undefined}
      className="grid gap-4 md:grid-cols-3 xl:grid-cols-4"
    >
      {items.map((item) => (
        <HomeworkCard key={item.id} item={item} sectionStatus={sectionStatus} />
      ))}
    </ul>
    {hasMore && !loadError ? (
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={onLoadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? "Загрузка…" : "Показать больше"}
        </Button>
      </div>
    ) : null}
    {loadError ? (
      <ErrorState
        message="Не удалось подгрузить следующие задания"
        onRetry={onRetry}
      />
    ) : null}
  </div>
);
