import { IData } from "./App";

export default function MiddleGrade({ data }: IData) {
	const grades: (number | null)[] = [];
	const classWork: (number | null)[] = [];
	const controlWork: (number | null)[] = [];
	const homeWork: (number | null)[] = [];
	const labs: (number | null)[] = [];
	let gradeSum: number | null,
		classGrade: number | null,
		controlGrade: number | null,
		homeGrade: number | null,
		labGrade: number | null;
	gradeSum = classGrade = controlGrade = homeGrade = labGrade = 0;
	data.forEach((_, i) => {
		data[i].class_work_mark && grades.push(data[i].class_work_mark);
		data[i].class_work_mark && classWork.push(data[i].class_work_mark);
		data[i].control_work_mark && grades.push(data[i].control_work_mark);
		data[i].control_work_mark && controlWork.push(data[i].control_work_mark);
		data[i].home_work_mark && grades.push(data[i].home_work_mark);
		data[i].home_work_mark && homeWork.push(data[i].home_work_mark);
		data[i].lab_work_mark && grades.push(data[i].lab_work_mark);
		data[i].lab_work_mark && labs.push(data[i].lab_work_mark);
		gradeSum! += data[i].class_work_mark!;
		classGrade! += data[i].class_work_mark!;
		gradeSum! += data[i].control_work_mark!;
		controlGrade! += data[i].control_work_mark!;
		gradeSum! += data[i].home_work_mark!;
		homeGrade! += data[i].home_work_mark!;
		gradeSum! += data[i].lab_work_mark!;
		labGrade! += data[i].lab_work_mark!;
	});

	const countMiddle = (grade: number, arr: (number | null)[]): number => {
		if (grade > 0) {
			return +(grade / arr.length).toFixed(4);
		}
		return 0;
	};
	// Перевод в пятибальную систему
	function toFive(arr: (number | null)[]): (number | null)[] {
		for (let i = 0; i < arr.length; i++) {
			switch (true) {
				case arr[i] === 1:
				case arr[i] === 2:
				case arr[i] === 3:
					arr[i] = 2;
					break;
				case arr[i] === 4:
				case arr[i] === 5:
				case arr[i] === 6:
					arr[i] = 3;
					break;
				case arr[i] === 7:
				case arr[i] === 8:
				case arr[i] === 9:
					arr[i] = 4;
					break;
				case arr[i] === 10:
				case arr[i] === 11:
				case arr[i] === 12:
					arr[i] = 5;
					break;
				default:
					console.warn("Ошибка перевода в пятибалльную систему");
			}
		}

		return arr;
	}
	function sumGradeArr(arr: (number | null)[], grade = 0): number {
		toFive(arr).forEach((i: number | null): void => {
			grade += i!;
		});
		return countMiddle(grade, arr);
	}
	const grade5Sum: number = sumGradeArr(grades);
	const classGrades5: number = sumGradeArr(classWork);
	const controlGrades5: number = sumGradeArr(controlWork);
	const homeGrades5: number = sumGradeArr(homeWork);
	const labGrades5: number = sumGradeArr(labs);

	return (
		<>
			<div className='inner_text'>
				<p>
					Средний балл:{" "}
					<b>
						{countMiddle(gradeSum, grades)} ({grade5Sum})
					</b>
				</p>

				<p>
					Средний балл за работу на паре:{" "}
					<b>
						{countMiddle(classGrade, classWork)} ({classGrades5})
					</b>
				</p>

				<p>
					Средний балл за контрольные:{" "}
					<b>
						{countMiddle(controlGrade, controlWork)} ({controlGrades5})
					</b>
				</p>

				<p>
					Средний балл за домашки:{" "}
					<b>
						{countMiddle(homeGrade, homeWork)} ({homeGrades5})
					</b>
				</p>

				<p>
					Средний балл за лабы:{" "}
					<b>
						{countMiddle(labGrade, labs)} ({labGrades5})
					</b>
				</p>
			</div>
		</>
	);
}
