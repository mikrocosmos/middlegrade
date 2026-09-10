import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HomeworkSection, type HomeworkSectionState } from "@/components/homework/HomeworkSection";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Segmented, Select } from "@/components/ui/Controls";
import { EmptyState } from "@/components/ui/States";
import {
  HOMEWORK_SECTIONS,
  HOMEWORK_TYPE,
  HOMEWORK_TYPES,
} from "@/constants/constants";
import { useHomeworkCounts } from "@/hooks/useHomeworkCounts";
import { homeworkGroupsQuery } from "@/lib/queries";
import { useAuthStore } from "@/store/auth";

const initialSectionStates = (): Record<number, HomeworkSectionState> =>
  Object.fromEntries(
    HOMEWORK_SECTIONS.map((section) => [
      section.value,
      { settled: false, hasItems: false, hasError: false },
    ]),
  );

export const HomeworkPage = () => {
  const user = useAuthStore((state) => state.user);
  const groups = useQuery(homeworkGroupsQuery());

  const [groupId, setGroupId] = useState<number | undefined>(user?.current_group_id);
  const [type, setType] = useState<number>(HOMEWORK_TYPE.HOMEWORK);
  const [sectionStates, setSectionStates] = useState(initialSectionStates);

  useEffect(() => {
    if (groupId === undefined && user?.current_group_id) {
      setGroupId(user.current_group_id);
    }
  }, [groupId, user?.current_group_id]);

  useEffect(() => {
    setSectionStates(initialSectionStates());
  }, [groupId, type]);

  const counts = useHomeworkCounts(groupId);

  const handleSectionStateChange = useCallback(
    (status: number, state: HomeworkSectionState) => {
      setSectionStates((current) => ({
        ...current,
        [status]: state,
      }));
    },
    [],
  );

  const groupOptions =
    groups.data?.map((group) => ({ value: group.id, label: group.name })) ?? [];

  const typeOptions = HOMEWORK_TYPES.map((option) => ({
    ...option,
    badge: option.value === HOMEWORK_TYPE.LAB ? counts.labs : counts.homework,
  }));

  const allSectionsSettled = HOMEWORK_SECTIONS.every(
    (section) => sectionStates[section.value]?.settled,
  );
  const showEmptyState = useMemo(() => {
    if (!allSectionsSettled) {
      return false;
    }

    return HOMEWORK_SECTIONS.every((section) => {
      const state = sectionStates[section.value];
      return !state?.hasItems && !state?.hasError;
    });
  }, [allSectionsSettled, sectionStates]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-heading">Задания</h1>
        <Segmented
          options={typeOptions}
          value={type}
          onChange={setType}
          ariaLabel="Тип задания"
        />
      </div>

      {groupOptions.length > 1 && groupId !== undefined ? (
        <Card>
          <CardHeader title="Фильтры" />
          <CardBody>
            <Select
              options={groupOptions}
              value={groupId}
              onChange={setGroupId}
              ariaLabel="Группа"
              className="w-full min-w-0 sm:w-56"
            />
          </CardBody>
        </Card>
      ) : null}

      <div className="flex flex-col gap-8">
        {HOMEWORK_SECTIONS.map((section) => (
          <HomeworkSection
            key={section.value}
            groupId={groupId}
            type={type}
            section={section}
            onStateChange={handleSectionStateChange}
          />
        ))}
      </div>

      {showEmptyState ? (
        <Card>
          <EmptyState
            title="Заданий нет"
            description="Попробуйте другой тип задания или группу"
          />
        </Card>
      ) : null}
    </div>
  );
};
