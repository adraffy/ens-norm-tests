import {explode_cp} from '../ens-normalize.js/src/utils.js';
import {read_labels} from '../ens-labels/labels.js';
import {require_impl} from '../impls.js';


let c = require_impl('ENS0');
//let c = require_impl('ens-validation');

let v = [
	'℞drug.eth',
	'latin♛.eth',
	'mcdonald’s🍔️.eth',
	'mcdonald’s🍟️.eth',
];
for (let name of v) {
	let ret;
	try {
		ret = c.fn(name) === name
	} catch (err) {
		ret = err.message;
	}
	console.log(name, ret);
}



/*
const LABELS = read_labels();

let a = require_impl('eth-ens-namehash');
let b = require_impl('ens_normalize.local');

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
*/