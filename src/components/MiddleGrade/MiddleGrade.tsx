import { IDataElement, IZachetkaElement } from "../../App";
import TextBlock from "./TextBlock";
import { toFive } from "../../utils/toFive.ts";

export default function MiddleGrade({
  data,
  zData,
}: {
  data: IDataElement[];
  zData: IZachetkaElement[];
}) {
  const grades: (number | null)[] = [];
  const classWork: (number | null)[] = [];
  const controlWork: (number | null)[] = [];
  const homeWork: (number | null)[] = [];
  const labs: (number | null)[] = [];
  let gradeSum: number,
    classGradeSum: number,
    controlGradeSum: number,
    homeGradeSum: number,
    labGradeSum: number;
  gradeSum = classGradeSum = controlGradeSum = homeGradeSum = labGradeSum = 0;
  data.forEach((element) => {
    if (new Date(element.date_visit) < new Date("2024-09-01")) {
      element.class_work_mark && grades.push(toFive(element.class_work_mark));
      element.class_work_mark &&
        classWork.push(toFive(element.class_work_mark));
      element.control_work_mark &&
        grades.push(toFive(element.control_work_mark));
      element.control_work_mark &&
        controlWork.push(toFive(element.control_work_mark));
      element.home_work_mark && grades.push(toFive(element.home_work_mark));
      element.home_work_mark && homeWork.push(toFive(element.home_work_mark));
      element.lab_work_mark && grades.push(toFive(element.lab_work_mark));
      element.lab_work_mark && labs.push(toFive(element.lab_work_mark));
      gradeSum! += toFive(element.class_work_mark)!;
      classGradeSum! += toFive(element.class_work_mark)!;
      gradeSum! += toFive(element.control_work_mark)!;
      controlGradeSum! += toFive(element.control_work_mark)!;
      gradeSum! += toFive(element.home_work_mark)!;
      homeGradeSum! += toFive(element.home_work_mark)!;
      gradeSum! += toFive(element.lab_work_mark)!;
      labGradeSum! += toFive(element.lab_work_mark)!;
    } else {
      element.class_work_mark && grades.push(element.class_work_mark);
      element.class_work_mark && classWork.push(element.class_work_mark);
      element.control_work_mark && grades.push(element.control_work_mark);
      element.control_work_mark && controlWork.push(element.control_work_mark);
      element.home_work_mark && grades.push(element.home_work_mark);
      element.home_work_mark && homeWork.push(element.home_work_mark);
      element.lab_work_mark && grades.push(element.lab_work_mark);
      element.lab_work_mark && labs.push(element.lab_work_mark);
      gradeSum! += element.class_work_mark!;
      classGradeSum! += element.class_work_mark!;
      gradeSum! += element.control_work_mark!;
      controlGradeSum! += element.control_work_mark!;
      gradeSum! += element.home_work_mark!;
      homeGradeSum! += element.home_work_mark!;
      gradeSum! += element.lab_work_mark!;
      labGradeSum! += element.lab_work_mark!;
    }
  });

  // Зачётка
  const zGrades: number[] = [];
  let zSum: number = 0;

  zData.forEach((element) => {
    if (new Date(element.date) < new Date("2024-09-01")) {
      element.mark && zGrades.push(toFive(element.mark)!);
      zSum += toFive(element.mark)!;
    } else {
      element.mark && zGrades.push(element.mark);
      zSum += element.mark;
    }
  });

  function countMiddle(sum: number, arr: (number | null)[]): number {
    if (sum) {
      return +(sum / arr.length).toFixed(4);
    }
    return 0;
  }

  return (
    <div className="inner_text">
      <TextBlock text="Средний балл" sum={countMiddle(gradeSum, grades)} />
      <TextBlock
        text="Средний балл за работу на паре"
        sum={countMiddle(classGradeSum, classWork)}
      />
      <TextBlock
        text="Средний балл за контрольные"
        sum={countMiddle(controlGradeSum, controlWork)}
      />
      <TextBlock
        text="Средний балл за домашки"
        sum={countMiddle(homeGradeSum, homeWork)}
      />
      <TextBlock
        text="Средний балл за лабы"
        sum={countMiddle(labGradeSum, labs)}
      />
      {zData.length ? (
        <TextBlock
          text="Средний балл за экзамены"
          sum={countMiddle(zSum, zGrades)}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
