import LABELS from '../eth-labels/db.js';
import {explode_cp, parse_cp_range, SPEC} from '../utils.js';

let count = 0;
let ri = new Set(parse_cp_range('1F1E6..1F1FF'));
for (let label of LABELS) {
	let cps = explode_cp(label);
	if (cps.length && cps.every(cp => ri.has(cp))) {
		console.log(label);
		count++;
	}
}
console.log(count);