// check that every:
// * valid is norm
// * mapped input is not norm
// * mapped output is norm
// * ignored is empty string

import {CHARS} from '@adraffy/ensip-norm';
import {IMPLS} from '../impls.js';

for (let impl of IMPLS) {
	let errors = test(impl.fn);
	console.log(errors.length == 0 ? 'PASS' : 'FAIL', impl.name);
	if (impl.primary && errors.length) {
		console.log(errors);
		console.log(impl);
		process.exit(1);
	}
}
console.log('OK');

function test(fn) {
	let errors = [];
	for (let cp of CHARS.valid) {
		if (!is_norm(String.fromCodePoint(cp))) {
			errors.push({type: 'valid', cp});
		} 
	}
	for (let [cp, cps] of CHARS.mapped) {
		if (is_norm(String.fromCodePoint(cp))) {
			errors.push({type: 'mapped-input', cp});
		}
		if (!is_norm(String.fromCodePoint(...cps))) {
			errors.push({type: 'mapped-output', cps});
		}
	}
	for (let cp of CHARS.ignored) {
		if (!is_norm(String.fromCodePoint(cp), '')) {
			errors.push({type: 'ignored', cp});
		}
	}
	return errors;
	function is_norm(s, s0) {
		if (s0 === undefined) s0 = s;
		try {
			return fn(s) === s0;
		} catch (err) {
		}
	}
}
