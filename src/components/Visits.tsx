import { IData } from "../App";

export default function Visits({ data }: IData) {
	const studentWas: number[] = [];
	const studentLate: number[] = [];
	const studentWasnt: number[] = [];
	data.forEach((_, i) => {
		switch (data[i].status_was) {
			case 0:
				studentWasnt.push(i);
				break;
			case 1:
				studentWas.push(i);
				break;
			case 2:
				studentLate.push(i);
				break;
			default:
		}
	});
	function countPercent(arr: number[]): number {
		if (arr.length) {
			return +(arr.length / (data.length / 100)).toFixed(2);
		}
		return 0;
	}
	function ifLastA(i: number): string {
		if (i % 10 === 1) {
			return "а";
		} else if (
			(i % 10 === 2 || i % 10 === 3 || i % 10 === 4) &&
			+(i / 10).toFixed(0) !== 1
		) {
			return "ы";
		}
		return "";
	}
	const allLessions: number[] = [...studentWas, ...studentLate];
	return (
		<div className='inner_text'>
			<p>
				Посещаемость:{" "}
				<b className='green_text'>
					{allLessions.length} пар{ifLastA(allLessions.length)} (
					{countPercent(allLessions)}%)
				</b>
			</p>
			<p>
				Всего пар <b>{data.length}</b>, опозданий{" "}
				<b className='yellow_text'>
					{studentLate.length} ({countPercent(studentLate)}%)
				</b>
				, пропусков{" "}
				<b className='red_text'>
					{studentWasnt.length} ({countPercent(studentWasnt)}%)
				</b>
			</p>
		</div>
	);
}
