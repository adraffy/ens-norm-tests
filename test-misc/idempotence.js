// check if f(f(x)) == f(x)

import LABELS from '../ens-labels/labels.js';
import {IMPLS} from '../impls.js';

for (let impl of IMPLS) {
	let errors = test(impl.fn);
	console.log(`${errors.length == 0 ? 'PASS' : 'FAIL'} ${impl.name} (${impl.version})`);
	if (impl.primary && errors.length) {
		console.log(errors);
		console.log(impl);
		throw new Error('wrong');
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
