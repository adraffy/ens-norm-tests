import LABELS from './db.js';
import {explode_cp} from '../ens-normalize.js/src/utils.js';

let tally = {};
let max = 12;
let max_key = `${max}+`;
for (let x of LABELS) {
	let n = explode_cp(x).length;
	if (n >= max) n = max_key;	
	tally[n] = (tally[n] ?? 0) + 1;
}
console.log(tally);
console.log(LABELS.length);
