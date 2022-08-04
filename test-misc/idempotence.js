// check if f(f(x)) == f(x)

import LABELS from '../eth-labels/db.js';
import {IMPLS} from '../impls.js';

for (let impl of IMPLS) {
	let errors = test(impl.fn);
	console.log(errors.length == 0 ? 'PASS' : 'FAIL', impl.name);
	if (impl.primary) {
		console.log(errors);
		console.log(impl);
		process.exit(1);
	}
}
console.log('OK');

function test(fn) {
	let errors = [];
	for (let label of LABELS) {
		let norm;
		try {
			norm = fn(label);
		} catch (err) {           
			continue; 
		}
		if (fn(norm) !== norm) {
			errors.push(label);
		}        
	}
	return errors;
}