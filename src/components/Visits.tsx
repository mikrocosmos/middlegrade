import { IData } from "../App";

export default function Visits({ data }: IData) {
	const studentWas: number[] = [];
	const studentLate: number[] = [];
	const studentWasnt: number[] = [];
	data.forEach((element, i) => {
		switch (element.status_was) {
			case 0:
				studentWasnt.push(i);
				break;
			case 1:
				studentWas.push(i);
				break;
			case 2:
				studentWas.push(i);
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

	return (
		<div className='inner_text'>
			<p>
				Посещено пар:{" "}
				<b className='green_text'>
					{studentWas.length} ({countPercent(studentWas)}%)
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
