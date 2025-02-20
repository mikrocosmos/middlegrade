import React from "react";
import { IDataElement } from "../../App.tsx";
import styles from "./SpecList.module.scss";
import activeSpecStore from "../../store/activeSpec.ts";

interface IProps {
  initialMarks: IDataElement[];
  arrDate: string;
  setData: (data: IDataElement[]) => void;
  activeList: boolean;
  setActiveList: (activeList: boolean) => void;
}

export default function SpecList({
  initialMarks,
  arrDate,
  setData,
  activeList,
  setActiveList,
}: IProps) {
  const dataJson = initialMarks;
  const { activeSpec, setActiveSpec } = activeSpecStore();
  const [considerPast, setConsiderPast] = React.useState<boolean>(false);
  const arr: string[] = dataJson
    .filter((_, pos) =>
      considerPast
        ? true
        : new Date(dataJson[pos].date_visit) > new Date(arrDate),
    )
    .map((i) => i.spec_name);
  const specList: string[] = arr
    .filter((item: string, pos: number) => arr.indexOf(item) === pos)
    .sort();
  specList.forEach((element, pos) => {
    if (specList.includes(element) && specList.includes(`${element} РПО`)) {
      specList.splice(specList.indexOf(`${element} РПО`), 1);
    }
    if (specList.includes(element) && specList.includes(`${element} ГД`)) {
      specList.splice(specList.indexOf(`${element} ГД`), 1);
    }
    if (element.includes(" РПО")) {
      specList[pos] = element.replace(" РПО", "");
    }
    if (element.includes(" ГД")) {
      specList[pos] = element.replace(" ГД", "");
    }
  });

  const switchData = (spec: string, considerPast: boolean) => {
    if (spec === "Все предметы") {
      return;
    }
    if (considerPast) {
      setData(
        dataJson.filter(
          (element) =>
            element.spec_name === spec ||
            element.spec_name === `${spec} РПО` ||
            element.spec_name === `${spec} ГД`,
        ),
      );
    } else {
      setData(
        dataJson.filter(
          (element) =>
            (element.spec_name === spec ||
              element.spec_name === `${spec} РПО` ||
              element.spec_name === `${spec} ГД`) &&
            new Date(element.date_visit) > new Date(arrDate),
        ),
      );
    }

    setActiveSpec(spec);
    setActiveList(false);
  };

  return (
    <div className={styles.specList}>
      <div
        className={styles.specList__list}
        onClick={(event) => {
          event.stopPropagation();
          setActiveList(!activeList);
        }}
      >
        <div className={styles.specList__list__text}>{activeSpec}</div>
        {activeList && (
          <ul className={styles.specList__list__active}>
            <li
              className={styles.specList__list__active__item}
              onClick={() => {
                setData(dataJson);
                setActiveSpec("Все предметы");
                setActiveList(false);
              }}
            >
              Все предметы
            </li>
            {specList.map((spec) => (
              <li
                className={styles.specList__list__active__item}
                key={spec}
                onClick={() => switchData(spec, considerPast)}
              >
                {spec}
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeSpec !== "Все предметы" && (
        <button
          className={styles.specList__button}
          onClick={() => {
            switchData(activeSpec, !considerPast);
            setConsiderPast(!considerPast);
          }}
        >
          {considerPast ? "За всё время" : "За текущий курс"}
        </button>
      )}
    </div>
  );
}
