// NOTE: this test is no longer needed

// check that every:
// * valid is norm
// * mapped input is not norm
// * mapped output is norm
// * ignored is empty string

import {readFileSync} from 'node:fs';
import {ens_normalize_fragment} from '@adraffy/ens-normalize';

let {valid, mapped, ignored} = JSON.parse(readFileSync(new URL('../ens-normalize.js/derive/output/chars.json', import.meta.url)));

let errors = test(ens_normalize_fragment);
if (errors.length) {
	console.log(errors);
	process.exit(1);
}
console.log('OK');

function test(fn) {
	let errors = [];
	for (let cp of valid) {
		if (!is_norm(String.fromCodePoint(cp))) {
			errors.push({type: 'valid', cp});
		} 
	}
	for (let [cp, cps] of mapped) {
		if (is_norm(String.fromCodePoint(cp))) {
			errors.push({type: 'mapped-input', cp});
		}
		if (!is_norm(String.fromCodePoint(...cps))) {
			errors.push({type: 'mapped-output', cps});
		}
	}
	for (let cp of ignored) {
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
