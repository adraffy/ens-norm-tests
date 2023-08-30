import {read_labels} from '../ens-labels/labels.js';
import {require_impl} from '../impls.js';

const LABELS = read_labels();

let a = require_impl('ens_normalize.dev');
let b = require_impl('ens_normalize.git');

console.log(`${a} vs ${b}`);

let found = [];

for (let label of LABELS) {
	let norm_a;
	try {
		norm_a = a.fn(label);
	} catch (err) {
		continue;		
	}
	let norm_b, error;
	try {
		norm_b = b.fn(label);
	} catch (err) {		
		error = err.message;
	}
	if (norm_a !== norm_b) {
		found.push({label, norm_a, norm_b, error});
	}
}

console.log(found.length);

for (let x of found) {
	if (x.error) {
		console.log(x.error);
	}
}